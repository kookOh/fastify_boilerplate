import fp from 'fastify-plugin'

import { SessionService } from './session.service.js'
import { TokenService } from './token.service.js'
import { UserService } from './user.service.js'
import { MailService } from './mail.service.js'
import {PostService} from './post.service.js'
import { FileService } from './file.service.js'

export type { UserService, SessionService, TokenService, MailService,  PostService, FileService,  }

declare module 'fastify' {
  interface FastifyInstance {
    services: {
      mail: MailService
      session: SessionService
      token: TokenService
      user: UserService
      post : PostService
      file : FileService
    }
  }
}

export default fp(async (f) => {
  const tokenService = new TokenService(f.jwt)
  f.decorate('services', {
    mail: new MailService(f.mailer),
    session: new SessionService(f.prisma.session),
    token: tokenService,
    user: new UserService(f.prisma, f.jwt, tokenService),
    post : new PostService(f.prisma),
    file : new FileService(f.prisma),

  })
})
