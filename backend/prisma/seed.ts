import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "" || value === "change-me-before-seeding") {
    console.error(
      `\n❌  Missing or default env var: ${key}\n` +
        `    Please set a real value in backend/.env before seeding.\n`
    );
    process.exit(1);
  }
  return value;
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("❌  Seeding is not allowed in production.");
    process.exit(1);
  }

  const adminPassword = requireEnv("SEED_ADMIN_PASSWORD");
  const workerPassword = requireEnv("SEED_WORKER_PASSWORD");
  const citizenPassword = requireEnv("SEED_CITIZEN_PASSWORD");

  const SALT_ROUNDS = 10;

  const users = [
    // ── Admin ──────────────────────────────────────────────────────────────
    {
      email: "admin@bluewaste.ph",
      password: await bcrypt.hash(adminPassword, SALT_ROUNDS),
      firstName: "System",
      lastName: "Admin",
      role: Role.LGU_ADMIN,
      address: "City Hall, Panabo City",
    },
    // ── Field Workers ──────────────────────────────────────────────────────
    {
      email: "worker1@bluewaste.ph",
      password: await bcrypt.hash(workerPassword, SALT_ROUNDS),
      firstName: "Field",
      lastName: "Worker 1",
      role: Role.FIELD_WORKER,
      address: "Panabo City",
    },
    {
      email: "worker2@bluewaste.ph",
      password: await bcrypt.hash(workerPassword, SALT_ROUNDS),
      firstName: "Field",
      lastName: "Worker 2",
      role: Role.FIELD_WORKER,
      address: "Panabo City",
    },
    {
      email: "worker3@bluewaste.ph",
      password: await bcrypt.hash(workerPassword, SALT_ROUNDS),
      firstName: "Field",
      lastName: "Worker 3",
      role: Role.FIELD_WORKER,
      address: "Panabo City",
    },
    {
      email: "worker4@bluewaste.ph",
      password: await bcrypt.hash(workerPassword, SALT_ROUNDS),
      firstName: "Field",
      lastName: "Worker 4",
      role: Role.FIELD_WORKER,
      address: "Panabo City",
    },
    // ── Citizen ────────────────────────────────────────────────────────────
    {
      email: "citizen@bluewaste.ph",
      password: await bcrypt.hash(citizenPassword, SALT_ROUNDS),
      firstName: "Juan",
      lastName: "dela Cruz",
      role: Role.CITIZEN,
      address: "Panabo City",
    },
  ];

  console.log("\n🌱  Seeding users...\n");

  for (const user of users) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        address: user.address,
        isActive: true,
      },
      create: user,
    });
    console.log(`  ✅  ${created.role.padEnd(14)} → ${created.email}`);
  }

  console.log("\n✨  Seeding complete!\n");
  console.log("  Accounts created:");
  console.log("  ┌─────────────────────────────────┬───────────────┐");
  console.log("  │ Email                           │ Role          │");
  console.log("  ├─────────────────────────────────┼───────────────┤");
  console.log("  │ admin@bluewaste.ph              │ LGU_ADMIN     │");
  console.log("  │ worker1@bluewaste.ph            │ FIELD_WORKER  │");
  console.log("  │ worker2@bluewaste.ph            │ FIELD_WORKER  │");
  console.log("  │ worker3@bluewaste.ph            │ FIELD_WORKER  │");
  console.log("  │ worker4@bluewaste.ph            │ FIELD_WORKER  │");
  console.log("  │ citizen@bluewaste.ph            │ CITIZEN       │");
  console.log("  └─────────────────────────────────┴───────────────┘");
  console.log(
    "\n  Use the passwords you set in SEED_ADMIN_PASSWORD,\n  SEED_WORKER_PASSWORD, and SEED_CITIZEN_PASSWORD to log in.\n"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
