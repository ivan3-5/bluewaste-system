const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const schedules = await prisma.cleanupSchedule.findMany({
    include: {
      reports: {
        include: {
          images: true
        }
      }
    },
    take: 1
  });
  if (schedules.length > 0 && schedules[0].reports.length > 0) {
    console.log(JSON.stringify(schedules[0].reports[0].images, null, 2));
  } else {
    console.log("No schedules with reports found.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
