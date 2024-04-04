import type { RouteHandler } from 'fastify'
import type { FromSchema } from 'json-schema-to-ts'

import { create, list, deleteUser , getUserInfo} from '../validations/user.schema.js'

import type { UserService } from '../services'

export class UserController {
  constructor(private userService: UserService) {}

  list: RouteHandler<{
    Reply: FromSchema<typeof list.response[200]>
  }> = async (req, rep) => {
    rep.send();
    // rep.send(await this.userService.queryUsers(null))
  }

  create: RouteHandler<{
    Body: FromSchema<typeof create.body>
  }> = async (req, rep) => {
    rep.send(await this.userService.createUser(req.body))
  }

  delete: RouteHandler<{
    Params: FromSchema<typeof deleteUser.params>
    Reply: undefined // 204
  }> = async (req, rep) => {
    
    const { userId } = req.params
    await this.userService.deleteUserById(userId)

    rep.code(204)
  }

  getMe: RouteHandler<{
    Reply: FromSchema<typeof getUserInfo.response[200]>
  }> = async (req, rep) => {
   
    const rslt = await this.userService.getUserById(req.user.sub);
    rep.send(rslt);
    // rep.send(await this.userService.queryUsers(null))
  }
}

export default UserController
