import type { RouteHandler } from 'fastify'
import type { FromSchema } from 'json-schema-to-ts'
import type {
    PostService,
  } from '../services'
import postSchema from '../validations/post.schema.js'
export class PostController { 
    constructor(
        private postService : PostService

    ){}

    create : RouteHandler<{
        Body: FromSchema<typeof postSchema.create.body>
    }> = async ( req, rep) => { 
        const rslt = await this.postService.createPost(req.body, req.user.sub);
        rep.send(rslt);
    }

    update : RouteHandler<{
        Body: FromSchema<typeof postSchema.update.body>
    }> = async ( req, rep) => { 
        const rslt = await this.postService.updatePost(req.body, req.user);
        rep.send(rslt);
    }
    delete : RouteHandler<{
        Body : FromSchema<typeof postSchema.deletePost.body>
    }> = async ( req, rep) => {
        
        const rslt = await this.postService.deletePost(req.body, req.user);
        rep.send(rslt);
    }
    

    getList : RouteHandler<{
        Querystring : FromSchema<typeof postSchema.getList.querystring>
    }> = async (req, rep )=> { 
        rep.send(await this.postService.getList(req.query));
    }
}

export default PostController;
