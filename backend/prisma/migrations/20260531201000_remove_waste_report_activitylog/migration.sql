-- Drop WasteReport and ActivityLog tables (if present)
BEGIN;

-- Remove WasteReport table and any dependent objects
DROP TABLE IF EXISTS "WasteReport" CASCADE;

-- Remove ActivityLog table and any dependent objects
DROP TABLE IF EXISTS "ActivityLog" CASCADE;

COMMIT;
