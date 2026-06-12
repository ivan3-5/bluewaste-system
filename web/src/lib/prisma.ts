import { PrismaClient } from "../generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getPrismaClient() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const isDevelopment = process.env.NODE_ENV === "development";

  const client = new PrismaClient({
    log: isDevelopment
      ? ["info", "warn", "error"]
      : process.env.DEBUG_PRISMA === "true"
        ? ["warn", "error"]
        : ["error"],
    errorFormat: "pretty",
  });

  // In development, cache the Prisma Client in global to prevent
  // creating multiple instances
  if (isDevelopment) {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma = getPrismaClient();

// Graceful disconnect on process exit
if (typeof process !== "undefined") {
  process.on("exit", async () => {
    await prisma.$disconnect();
  });
}

export default prisma;
