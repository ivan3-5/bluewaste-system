const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_q4UilKyaZdu2@ep-solitary-thunder-a1ajp2py.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Neon DB');

    // Add new Gemini AI columns if they don't exist
    await client.query(`
      ALTER TABLE "Report"
        ADD COLUMN IF NOT EXISTS "aiCategories"  TEXT[]  DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS "aiReason"      TEXT,
        ADD COLUMN IF NOT EXISTS "aiModel"       TEXT,
        ADD COLUMN IF NOT EXISTS "aiImageHash"   TEXT,
        ADD COLUMN IF NOT EXISTS "aiProcessingMs" INTEGER,
        ADD COLUMN IF NOT EXISTS "aiGeminiMs"    INTEGER
    `);
    console.log('Columns added successfully');

    // Create index on aiImageHash for dedup lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS "Report_aiImageHash_idx" ON "Report"("aiImageHash")
    `);
    console.log('Index created successfully');

    // Verify columns exist
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'Report'
        AND column_name IN ('aiCategories', 'aiReason', 'aiModel', 'aiImageHash', 'aiProcessingMs', 'aiGeminiMs')
      ORDER BY column_name
    `);
    console.log('Verified columns:', result.rows);

    await client.end();
    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err.message);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

main();
