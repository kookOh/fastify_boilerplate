import fp from "fastify-plugin";
import multer from "fastify-multer"; 
import formbody from '@fastify/formbody'


export const upload = multer({dest : 'uploads/'})
export default fp(async (f) => {
    f.register(multer.contentParser )
    f.register(formbody);
})


declare module 'fastify' {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    interface FastifyRequest {
      file? : {
        buffer: Buffer;
        encoding: string;
        fieldname: string;
        mimetype: string;
        originalname: string;
        size: number;
      };
    }
  }

  