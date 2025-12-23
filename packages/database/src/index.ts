import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "@prisma/client";
import { env } from "@repo/lib/envs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};
const adapter = new PrismaPg({ 
  connectionString: env.DATABASE_URL 
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["error", "warn"],adapter });
// Prevent multiple instances of Prisma Client in development
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
