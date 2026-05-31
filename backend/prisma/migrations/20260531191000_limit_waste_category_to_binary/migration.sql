-- Restrict Report.category to only: with_waste | no_waste
-- Convert existing values using analysisStatus when available.

CREATE TYPE "WasteCategory_new" AS ENUM ('with_waste', 'no_waste');

ALTER TABLE "Report"
ALTER COLUMN "category" TYPE "WasteCategory_new" USING (
  CASE
    WHEN "analysisStatus" = 'CLEAN' THEN 'no_waste'
    ELSE 'with_waste'
  END
)::"WasteCategory_new";

DROP TYPE "WasteCategory";

ALTER TYPE "WasteCategory_new" RENAME TO "WasteCategory";
