// packages/db/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple instances in dev due to hot reload
  // @ts-ignore
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ["query", "error"], // optional
  });

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;