import { FromSchema } from 'json-schema-to-ts';
import fileSchema from '../../../validations/file.schema.js';
import type { FastifyPluginAsync } from 'fastify'
import { env } from '../../../config/index.js';

const routes : FastifyPluginAsync = async(f) => {
    const prisma = f.prisma;

    f.route({
        method:'POST', 
        url :'/', 
        schema : fileSchema.create,
        handler : async (req, rep) => {
            let result =  await f.services.file.createFile(req.body as FromSchema<typeof fileSchema.create.body>, null);
            return {...result, imgUrl : `${env.FRONTEND_IMG_URL}${result.relativeURL}`}
        }
    });

    
}

export default routes;