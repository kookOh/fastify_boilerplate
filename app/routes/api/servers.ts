import type { FastifyPluginAsync } from 'fastify'
import {  RouteHandler } from 'fastify'
import type { FromSchema } from 'json-schema-to-ts'

const routes : FastifyPluginAsync = async(f) => {
    const prisma = f.prisma;
    const serverSchema = {
        tags : ['home'],
        querystring : {
            type : 'object', 
            required : [],
            properties : { 
                game : { type : 'string'}
            }
        }
    } as const;
    
     const serverHandler : RouteHandler<{Querystring : FromSchema<typeof serverSchema.querystring>}> = async (req, rep) => {
        return await f.prisma.commonCode.findMany({
            where : {
                groupCd : req.query.game?.toUpperCase()
            }
        })

    }

    f.route({
        method:'GET', 
        url :'/servers', 
        schema : serverSchema,
        handler : serverHandler
    });

    
}

export default routes;