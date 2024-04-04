import type { FastifyPluginAsync } from 'fastify'
import postSchema from '../../../validations/post.schema.js'
import commonSchema from '../../../validations/common.schema.js'
import fileSchema from '../../../validations/file.schema.js'
const routes : FastifyPluginAsync = async(f) => {
    const prisma = f.prisma;
    

    f.route({
        method:'POST', 
        url :'/', 
        onRequest : f.authenticate(),
        schema : postSchema.create,
        handler : f.controllers.post.create, 
    });

    f.route({
        method:'PUT', 
        url :'/', 
        onRequest : f.authenticate(),
        schema : postSchema.update,
        handler : f.controllers.post.update, 
    });

    f.route({
        method:'DELETE', 
        url :'/', 
        onRequest : f.authenticate(),
        schema : postSchema.deletePost,
        handler : f.controllers.post.delete, 
    });

    f.route({
        method:'GET', 
        url :'/', 
        schema : postSchema.getList,
        handler :f.controllers.post.getList 
    });
}

export default routes;