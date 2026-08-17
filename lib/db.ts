// lib/db.ts
// Prisma client singleton with silent error recovery for serverless/remote PostgreSQL pooling

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db: PrismaClient & {
  chatSession: any;
  chatMessage: any;
} =
  (globalForPrisma.prisma as any) ??
  (new PrismaClient({
    log: [], // Prevents raw TCP idle socket closure logs from spamming terminal
  }) as any);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db as unknown as PrismaClient;
}
