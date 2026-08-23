const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
console.log('wasteIncident' in p ? 'OK - wasteIncident model exists in Prisma client' : 'MISSING - wasteIncident NOT in Prisma client');
p.$disconnect();
