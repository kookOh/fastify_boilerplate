import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import {PrismaClient}  from '@prisma/client'

// Use TypeScript module augmentation to declare the type of server.prisma to be PrismaClient
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prismaPlugin: FastifyPluginAsync = fp(async (f) => {
  const prisma = new PrismaClient({
    log: ['error', 'warn']
  })
  await prisma.$connect()
  // Make Prisma Client available through the fastify server instance: server.prisma
  f.decorate('prisma', prisma)
  f.addHook('onClose', async (self) => {
    await self.prisma.$disconnect()
  })
})

export default prismaPlugin
