import type { FastifyPluginAsync } from 'fastify'

import userSchema from '../../../validations/user.schema.js'
const routes : FastifyPluginAsync = async(f) => {
    const prisma = f.prisma;
    


    f.route({
        method:'GET', 
        url :'/', 
        schema : userSchema.getUserInfo,
        onRequest : f.authenticate(),
        handler :f.controllers.user.getMe 
    });
}

export default routes;