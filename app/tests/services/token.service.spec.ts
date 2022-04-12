/* eslint-disable func-names */
import sinon from 'sinon'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import httpErrors from 'http-errors'

import { jwt } from '../mocks.js'
import { TokenService } from '../../services/token.service.js'

chai.use(chaiAsPromised)

describe('[Service: Token]', () => {
  const key = 'TEST_CcJWC4NvmVknXfcRvksqpsdtXwGP5SPj'

  const tokenService = new TokenService(jwt, key)

  beforeEach(function () {
    this.jwt = sinon.mock(jwt)
  })

  afterEach(function () {
    this.jwt.verify()
    this.jwt.restore()
  })

  const userId = '77976d43-c76e-4b0c-943c-342b0f7d6cc4'
  const nonce = 'pWRHSFiGmlMotmDM'

  describe('generateAccessToken()', () => {
    it('should call `jwt.sign()` once', function () {
      this.jwt.expects('sign').once()

      tokenService.generateAccessToken(userId, nonce)
    })
  })

  describe('encrypt-decrypt()', () => {
    it('should be able to decrypt encrypted-payload', () => {
      const text = 'hello you can see me'

      const encrypted = tokenService.encrypt(text)
      const decrypted = tokenService.decrypt(encrypted)

      expect(encrypted.content).not.equal(text)
      expect(decrypted).equal(text)
    })
  })

  describe('create-verifySignature()', () => {
    const data = 'authentic data requires signature'
    const inauthenticData = 'this data is authentic. trust me'

    it('should be able to verify signature', () => {
      const signature = tokenService.createSignature(data)
      const isAuthentic = tokenService.verifySignature(data, signature)

      expect(isAuthentic).to.equal(true)
    })

    it('should not verify inauthentic data', () => {
      const signature = tokenService.createSignature(data)
      const isAuthentic = tokenService.verifySignature(
        inauthenticData,
        signature
      )

      expect(isAuthentic).to.equal(false)
    })
  })

  describe('create-parseOpaqueToken()', () => {
    it('should be able to process symbols', () => {
      const symbols = `~!@#$%^&*()_+-={}[]:";<>,.?/'`

      const opaqueToken = tokenService.createOpaqueToken(
        symbols,
        'abcdefghijklmnop'
      )
      const parsedOpaqueToken = tokenService.parseOpaqueToken(opaqueToken)

      expect(parsedOpaqueToken).to.be.equal(symbols)
    })
  })

  describe('generate-verifyRefreshToken()', () => {
    it('should be able to verify and parse generated refresh token', () => {
      const refreshToken = tokenService.generateRefreshToken(userId, nonce)
      const { userId: tokenUserId, tokenNonce } =
        tokenService.verifyRefreshToken(refreshToken)

      expect(tokenUserId).equal(userId)
      expect(tokenNonce).equal(nonce)
    })

    it('should not verify modified refresh tokens', () => {
      const expectedError = httpErrors.Unauthorized
      const ERROR_MESSAGE = 'Invalid refresh token'

      const refreshToken = tokenService.generateRefreshToken(userId, nonce)

      const modifiedTokens = [
        'randomguytryingtoguessthetoken',
        `x${refreshToken}`,
        `${refreshToken}x`,
        refreshToken.slice(-5),
        refreshToken.slice(0, -5)
      ]

      modifiedTokens.forEach((token) => {
        const verify = () => tokenService.verifyRefreshToken(token)

        expect(verify).to.throw(expectedError, ERROR_MESSAGE)
      })
    })
  })
})
