const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reports = await prisma.report.findMany({
    take: 10,
    select: {
      id: true,
      title: true,
      address: true,
      latitude: true,
      longitude: true,
      cleanupSchedule: {
        select: {
          barangay: true
        }
      }
    }
  });
  console.log(JSON.stringify(reports, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
