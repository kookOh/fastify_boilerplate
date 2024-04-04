import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import fastify from 'fastify'
import autoload from '@fastify/autoload'
import blipp from 'fastify-blipp'
import helmet from '@fastify/helmet'

import type { FastifyInstance, FastifyServerOptions } from 'fastify'

import services from './services/index.js'
import controllers from './controllers/index.js'
import fastifyCors from '@fastify/cors'
import fstatic from '@fastify/static'
import path from 'path'

const dir = dirname(fileURLToPath(import.meta.url))
const build = (opts: FastifyServerOptions = {}) => {
  const f: FastifyInstance = fastify(opts)

  f.register(helmet, { contentSecurityPolicy: false , crossOriginResourcePolicy : false})

  f.register(blipp)
 

  f.register(autoload, {
    dir: join(dir, 'plugins')
  })
  f.register(fastifyCors, {
    // origin : [
    //   '*'
    // ],
    origin : '*', 
    credentials: true, 
    exposedHeaders : ['set-cookie']
    })

  f.register(fstatic, {
    root : path.resolve('uploads'), 
    prefix : '/img',
  })
  f.register(services)
  f.register(controllers)

  f.register(autoload, {
    dir: join(dir, 'routes')
  })

  return f
}

export default build
