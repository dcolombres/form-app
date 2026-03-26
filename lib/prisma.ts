import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma v7: connection URL is passed via adapter, not via schema.prisma
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

import { Pool } from 'pg';

function createPrismaClient() {
  // Remove 'sslmode=require' as it conflicts with pg library's verification logic
  // and prevents our explicit { rejectUnauthorized: false } from taking effect.
  const connectionString = process.env.DATABASE_URL!.replace('sslmode=require', 'sslmode=no-verify');
  const pool = new Pool({
    connectionString,
    // Add explicit SSL options required by Supabase/Vercel
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
