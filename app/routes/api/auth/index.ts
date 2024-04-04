import type { FastifyPluginAsync } from 'fastify'
import authSchema from '../../../validations/auth.schema.js'
import userSchema from '../../../validations/user.schema.js'
import { FromSchema } from 'json-schema-to-ts'
import { TokenTypes } from '../../../config/index.js'


const routes: FastifyPluginAsync = async (f) => {
  const { authenticate } = f
  const { auth } = f.controllers

  f.route({
    method : 'POST', 
    url :'/logintest', 
    schema : authSchema.login, 
    handler : async (req, rep) => { 
      const {email, password} =  req.body as FromSchema<typeof authSchema.login.body>
      const rslt = await f.prisma.user.findMany({
        where : { 
          email : email!
        }
      })
      const token = f.jwt.sign({sub : rslt[0].id, type : TokenTypes.ACCESS, jti :f.services.token.generateNonce()})
      rep.send(token)
    }
  })

  f.route({
    method: 'POST',
    url: '/login',
    schema: userSchema.signIn,
    handler: auth.signIn
  })
  
  f.route({
    method: 'POST',
    url: '/signIn',
    schema: userSchema.kakaoAuthToken,
    handler: auth.kakaoOauth
  })


  f.route({
    method: 'POST',
    url: '/logout',
    schema : {
      tags : ['auth'],

    },
    onRequest: authenticate({ ignoreExpiration: true }),
    handler: auth.logout
  })

  f.route({
    method: 'PUT',
    url: '/changeUsername',
    onRequest: authenticate({ ignoreExpiration: true }),
    schema: authSchema.changeUsername,
    handler: auth.changeUsername
  })

  // f.route({
  //   method : 'GET', 
  //   url : '/kakao/callback', 
  //   schema : userSchema.kakaoCallback,
  //   handler : auth.kakaoOauth
  // })

  // f.route({
  //   method: 'GET',
  //   url: '/sessions',
  //   schema: authSchema.sessions,
  //   onRequest: authenticate(),
  //   handler: auth.getSessions
  // })

  // f.route({
  //   method: 'POST',
  //   url: '/refresh-tokens',
  //   onRequest: authenticate({ ignoreExpiration: true }),
  //   handler: auth.refreshTokens
  // })

  // f.route({
  //   method: 'POST',
  //   url: '/send-verification-email',
  //   onRequest: authenticate(),
  //   handler: auth.sendVerificationEmail
  // })

  // f.route({
  //   method: 'POST',
  //   url: '/verify-email',
  //   schema: authSchema.verifyEmail,
  //   handler: auth.verifyEmail
  // })

  // f.route({
  //   method: 'POST',
  //   url: '/forgot-password',
  //   schema: authSchema.forgotPassword,
  //   handler: auth.sendResetPasswordEmail
  // })

  // f.route({
  //   method: 'POST',
  //   url: '/reset-password',
  //   schema: authSchema.resetPassword,
  //   handler: auth.resetPassword
  // })
}

export default routes
