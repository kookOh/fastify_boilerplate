import fp from 'fastify-plugin'

import { AuthController } from './auth.controller.js'
import { UserController } from './user.controller.js'
import CharacterController from './character.controller.js'
import PostController from './post.controllers.js'

declare module 'fastify' {
  interface FastifyInstance {
    controllers: {
      auth: AuthController
      user: UserController
      character : CharacterController
      post : PostController
    }
  }
}

export default fp(async (f) => {
  const { user, session, token, mail, character, post} = f.services

  f.decorate('controllers', {
    auth: new AuthController(user, session, token, mail),
    user: new UserController(user),
    character : new CharacterController(character),
    post : new PostController(post),
  })
})
