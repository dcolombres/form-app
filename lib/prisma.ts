import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma v7: connection URL is passed via adapter, not via schema.prisma
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

import { Pool } from 'pg';

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
