import { hash, compare } from 'bcrypt'

import type { RouteHandler } from 'fastify'
import type { FromSchema } from 'json-schema-to-ts'

import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changeUsername
} from '../validations/auth.schema.js'
import {signIn, user, kakaoCallback, kakaoAuthToken} from '../validations/user.schema.js'
import { TokenTypes } from '../config/index.js'

import type {
  UserService,
  SessionService,
  TokenService,
  MailService
} from '../services'

export class AuthController {
  constructor(
    private userService: UserService,
    private sessionService: SessionService,
    private tokenService: TokenService,
    private mailService: MailService
  ) {}

  changeUsername: RouteHandler<{
    Body: FromSchema<typeof changeUsername.body>
  }> = async (req, rep) => {
    const { name } = req.body
    rep.code(201).send(await this.userService.updateUsername(req.user.sub, name))
  }

  register: RouteHandler<{
    Body: FromSchema<typeof register.body>
  }> = async (req, rep) => {
    const { name, email, password } = req.body


    await this.userService.createUser({ name, email, password })

    rep.code(201).send()
  }

  kakaoOauth: RouteHandler<{
    Body: FromSchema<typeof kakaoAuthToken.body>
  }> = async (req, rep) => {
    const user = await this.userService.kakaoOauthCallback(req.body)
    rep.send(user)
  }

  signIn : RouteHandler<{
    Body : FromSchema<typeof signIn.body>
  }> = async (req, rep) => {
    const user = await this.userService.signInSns(req.body)
    rep.send(user)
  }

  login: RouteHandler<{
    Body: FromSchema<typeof login.body>
  }> = async (req, rep) => {
    const { email, password } = req.body
    const user = await this.userService.getUserByEmail(email)

    if (!user) {
      rep.unauthorized(
        "The email address you entered isn't connected to an account."
      )
      return
    }

    const match = await compare(password, user.password!)

    if (!match) {
      rep.unauthorized("The password that you've entered is incorrect.")
      return
    }

    const nonce = this.tokenService.generateNonce()
    const { id: sessionId } = await this.sessionService.createSession({
      userId: user.id,
      nonce
    })

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      nonce
    })

    rep.sendAccessTokenAndSessionId({ accessToken, sessionId })
  }

  logout: RouteHandler = async (req, rep) => {
    try {
      // TODO: blacklist access token jti (tokenNonce)
      const sessionId = req.getSessionId()

      await this.sessionService.deleteSessionById(sessionId)
    } catch (e) {
      // do nothing
    }

    rep.destroyAuthCookies()
    rep.code(200).send()
  }

  getSessions: RouteHandler = async (req, rep) => {
    const { sub } = req.user

    rep.send(await this.sessionService.listSessions({ userId: sub }))
  }

  refreshTokens: RouteHandler = async (req, rep) => {
    const sessionId = req.getSessionId()
    const currentNonce = req.user.jti

    const nextNonce = this.tokenService.generateNonce()
    const updatedSession = await this.sessionService.refreshSession({
      sessionId,
      nonce: currentNonce,
      nextNonce
    })

    const accessToken = this.tokenService.generateAccessToken({
      userId: updatedSession.userId,
      nonce: nextNonce
    })

    rep.sendAccessTokenAndSessionId({ accessToken, sessionId })
  }

  sendVerificationEmail: RouteHandler = async (req, rep) => {
    const { sub } = req.user
    const user = await this.userService.getUserById(sub)

    if (!user) {
      rep.notFound('User not found')
    } else if (user.updatedAt) {
      rep.badRequest('User already verified')
    } else {
      const verifyEmailToken = this.tokenService.generateVerifyEmailToken(sub)
      await this.mailService.sendVerificationEmail(user.email, verifyEmailToken)

      rep.send()
    }
  }

  verifyEmail: RouteHandler<{
    Querystring: FromSchema<typeof verifyEmail.querystring>
  }> = async (req, rep) => {
    const { sub } = this.tokenService.verifyJwt(
      req.query.token,
      TokenTypes.VERIFY_EMAIL
    )

    const user = await this.userService.getUserById(sub, {
      select: { updatedAt: true }
    })

    if (!user) {
      rep.notFound('User not found')
    } else if (user.updatedAt) {
      rep.badRequest('User already verified')
    } else {
      const verifiedUser = await this.userService.updateUserById(sub, {
        data: { updatedAt: new Date() },
        select: {
          name: true,
          email: true,
          updatedAt: true
        }
      })

      rep.send(verifiedUser)
    }
  }

  sendResetPasswordEmail: RouteHandler<{
    Body: FromSchema<typeof forgotPassword.body>
  }> = async (req, rep) => {
    const user = await this.userService.getUserByEmail(req.body.email)

    if (user) {
      const resetPasswordToken = this.tokenService.generateResetPasswordToken(
        user.id
      )

      await this.mailService.sendResetPasswordEmail(
        user.email,
        resetPasswordToken
      )
    }

    rep.send()
  }

  resetPassword: RouteHandler<{
    Querystring: FromSchema<typeof resetPassword.querystring>
    Body: FromSchema<typeof resetPassword.body>
  }> = async (req, rep) => {
    const { password } = req.body
    const { sub } = this.tokenService.verifyJwt(
      req.query.token,
      TokenTypes.RESET_PASSWORD
    )

    const user = await this.userService.getUserById(sub)
    if (!user) {
      rep.notFound('User not found')
      return
    }

    const matchOldPassword = await compare(password, user.password!)
    if (matchOldPassword) {
      rep.badRequest('New password must be different from old password')
      return
    }

    const passwordHash = await hash(password, 10)
    await this.userService.updateUserById(sub, {
      data: { password : passwordHash },
      select: { id: true }
    })

    rep.send({ message: 'Password updated' })
  }
}

export default AuthController
