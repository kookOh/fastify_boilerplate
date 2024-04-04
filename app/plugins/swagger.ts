import fp from 'fastify-plugin';
import swagger, { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import swagerUI from '@fastify/swagger-ui';
import { build } from 'esbuild'
import { copy } from 'esbuild-plugin-copy'
import path from 'path';
import commonSchema from '../validations/common.schema.js';
import character from '../validations/character.schema.js'
import fileSchema from '../validations/file.schema.js'
import postSchema from '../validations/post.schema.js'
import userSchema from '../validations/user.schema.js'
import authSchema from '../validations/auth.schema.js';
import orderSchema from '../validations/order.schema.js';

const fastifySwagger = fp<FastifyDynamicSwaggerOptions>(
  async (fastify, opts) => {
    const f = fastify; 
    f.addSchema(commonSchema.commonDt)
    f.addSchema(fileSchema.file)
    f.addSchema(fileSchema.create)
    f.addSchema(postSchema.create)
    f.addSchema(postSchema.post)
    f.addSchema(postSchema.getList)
    f.addSchema(userSchema.user)
    f.addSchema(userSchema.sns)
    f.addSchema(authSchema.authHeader)
    // f.addSchema(orderSchema.orderCallback)
    // f.addSchema(orderSchema.orderRequest)

    console.debug('static resolve = ', path.resolve('dist/static'));
    await build({
      // ...
      plugins: [
        copy({
          resolveFrom: 'cwd',
          assets: {
            from: ['node_modules/@fastify/swagger-ui/static/*'],
            to: ['dist/static'],
          },
        }),
      ],
    })

    await fastify.register(swagger, {
      swagger: {
        info: {
          title: 'API',
          description: 'api',
          version: '1.0.0',
        },
        externalDocs: {
          url: 'https://swagger.io',
          description: 'Find more info here',
        },
        host: 'manner.gg',
        schemes: ['https'],
        consumes: ['application/json'],
        produces: ['application/json'],
        
      },
    });

    await fastify.register(swagerUI, {
      routePrefix: '/api/docs'
      , 
      uiConfig: {
        deepLinking: false
      },
      uiHooks: {
        onRequest: function (request, reply, next) { next() },
        preHandler: function (request, reply, next) { next() }
      },
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
      transformSpecificationClone: true,
      // staticCSP : true, 
      baseDir :  path.resolve('static'),
      

    });
  },
);

export default fastifySwagger;