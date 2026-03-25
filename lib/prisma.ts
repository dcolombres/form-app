import { PrismaClient } from '@prisma/client';

// add prisma to the NodeJS global type
// This declaration is needed for TypeScript to recognize `global.prisma`
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// This is a common pattern to prevent multiple instances of Prisma Client in development
// by attaching it to the global object.
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export default prisma;
