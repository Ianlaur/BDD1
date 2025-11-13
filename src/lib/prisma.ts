import { PrismaClient } from "@prisma/client";

// Only check DATABASE_URL at runtime in production, not during build
// During build (npm run build), DATABASE_URL might not be set yet
const shouldCheckEnv = typeof window === 'undefined' && 
                       process.env.NODE_ENV === 'production' &&
                       process.env.VERCEL_ENV; // Only check when actually deployed

if (shouldCheckEnv && !process.env.DATABASE_URL) {
  const msg = [
    "Missing required environment variable: DATABASE_URL.",
    "In production (Vercel) set it at: Project → Settings → Environment Variables → Add",
    "Example value: postgresql://user:password@host:5432/dbname?sslmode=require",
    "Or use the Vercel CLI: `vercel env add DATABASE_URL production`",
  ].join(" ");

  throw new Error(msg);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
