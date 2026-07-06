DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Severity') THEN
    CREATE TYPE "Severity" AS ENUM ('CRITICAL', 'HIGH', 'MODERATE', 'SPAM');
  END IF;
END $$;

ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "severity" "Severity";
