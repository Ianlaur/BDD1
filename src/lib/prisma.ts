import { PrismaClient } from "@prisma/client";

// Primary database (dev branch/staging)
const PRIMARY_DB = 'postgresql://neondb_owner:npg_IE4b0PSHBwmz@ep-odd-sun-agg6reik-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';

// Fallback database (main branch/production)
const FALLBACK_DB = 'postgresql://neondb_owner:npg_IE4b0PSHBwmz@ep-old-darkness-ag5157bg-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';

// Determine which database to use
function getDatabaseUrl(): string {
  // If DATABASE_URL is explicitly set, use it
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')) {
    console.log('✅ Using DATABASE_URL from environment');
    return process.env.DATABASE_URL;
  }

  // Check which deployment this is based on VERCEL_URL or VERCEL_GIT_COMMIT_REF
  const isProduction = process.env.VERCEL_GIT_COMMIT_REF === 'main' || 
                       process.env.VERCEL_URL?.includes('bdd1.vercel.app');
  
  const isDev = process.env.VERCEL_GIT_COMMIT_REF === 'dev' || 
                process.env.VERCEL_URL?.includes('bdd1prod.vercel.app');

  if (isProduction) {
    console.log('🔵 Production branch detected - using fallback database');
    return FALLBACK_DB;
  }

  if (isDev) {
    console.log('🟢 Dev branch detected - using primary database');
    return PRIMARY_DB;
  }

  // Default to primary for local development
  console.log('💻 Local development - using primary database');
  return PRIMARY_DB;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
