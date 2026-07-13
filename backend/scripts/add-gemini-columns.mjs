/**
 * Migration: Add Gemini AI columns to Report table
 * Run: node scripts/add-gemini-columns.mjs
 *
 * Uses Prisma's $executeRaw via the web project's Prisma client
 * which is already configured with DATABASE_URL from .env.local
 */

// We use node's native fetch-less approach — read .env and use pg from @prisma internals
// Instead, use Prisma Client from the web project

import { PrismaClient } from '../../web/src/generated/prisma/index.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env from web/.env.local
const envContent = readFileSync(resolve(__dirname, '../../web/.env.local'), 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  process.env[key] = val;
}

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to Neon DB via Prisma...');

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Report"
      ADD COLUMN IF NOT EXISTS "aiCategories"   TEXT[]  DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS "aiReason"       TEXT,
      ADD COLUMN IF NOT EXISTS "aiModel"        TEXT,
      ADD COLUMN IF NOT EXISTS "aiImageHash"    TEXT,
      ADD COLUMN IF NOT EXISTS "aiProcessingMs" INTEGER,
      ADD COLUMN IF NOT EXISTS "aiGeminiMs"     INTEGER
  `);
  console.log('✓ Columns added');

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Report_aiImageHash_idx" ON "Report"("aiImageHash")
  `);
  console.log('✓ Index created');

  const rows = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Report'
      AND column_name IN ('aiCategories','aiReason','aiModel','aiImageHash','aiProcessingMs','aiGeminiMs')
    ORDER BY column_name
  `);
  console.log('✓ Verified columns:', rows);

  await prisma.$disconnect();
  console.log('Migration complete!');
}

main().catch(async (e) => {
  console.error('Migration failed:', e.message);
  await prisma.$disconnect();
  process.exit(1);
});
