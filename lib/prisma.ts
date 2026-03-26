import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma v7: connection URL is passed via adapter, not via schema.prisma
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

import { Pool } from 'pg';

function createPrismaClient() {
  console.log('--- DEBUG INFO ---');
  console.log('DATABASE_URL en runtime:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'UNDEFINED');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('------------------');

  // Eliminar cualquier parámetro sslmode de la URL si lo hubiera, 
  // ya que a veces interfiere con la configuración 'ssl' que pasamos como objeto.
  let connectionString = process.env.DATABASE_URL || '';
  if (connectionString.includes('sslmode=')) {
    connectionString = connectionString.replace(/sslmode=[^&]+&?/, '');
  }

  const pool = new Pool({
    connectionString,
    // Forzamos incondicionalmente a omitir verificación de Authority
    // para los certificados auto-firmados del Pooler de Supabase en IPv4.
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
