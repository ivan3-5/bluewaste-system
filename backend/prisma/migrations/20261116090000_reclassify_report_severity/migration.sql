BEGIN;

-- Reclassify historical count-based results. A severity that differs from
-- the previous count-based value may be an override and keeps its meaning.
WITH reclassified AS (
  SELECT id, CASE
    WHEN NOT "isSpam" AND category = 'with_waste' AND "analysisWasteCount" > 0
      AND severity = CASE
        WHEN "analysisWasteCount" >= 25 THEN 'CRITICAL'::"Severity"
        WHEN "analysisWasteCount" >= 16 THEN 'HIGH'::"Severity"
        WHEN "analysisWasteCount" >= 9 THEN 'MODERATE'::"Severity"
        ELSE 'LOW'::"Severity"
      END
      THEN CASE
        WHEN "analysisWasteCount" >= 26 THEN 'HIGH'::"Severity"
        WHEN "analysisWasteCount" >= 14 THEN 'MODERATE'::"Severity"
        WHEN "analysisWasteCount" >= 4 THEN 'LOW'::"Severity"
        ELSE NULL
      END
    WHEN severity = 'CRITICAL' THEN 'HIGH'::"Severity"
    ELSE severity
  END AS severity
  FROM "Report"
)
UPDATE "Report" r
SET severity = reclassified.severity,
    "aiReason" = CASE
      WHEN r."aiReason" IN (
        'Waste detected. Severity: Critical.',
        'Waste detected. Severity: High.',
        'Waste detected. Severity: Medium.',
        'Waste detected. Severity: Low.'
      ) THEN 'Waste detected. Severity: ' || CASE reclassified.severity
        WHEN 'HIGH' THEN 'High.'
        WHEN 'MODERATE' THEN 'Medium.'
        WHEN 'LOW' THEN 'Low.'
        ELSE 'None.'
      END
      ELSE r."aiReason"
    END
FROM reclassified
WHERE r.id = reclassified.id AND r.severity IS DISTINCT FROM reclassified.severity;

WITH incident_severity AS (
  SELECT "incidentId", CASE
    WHEN BOOL_OR(severity = 'HIGH') THEN 'HIGH'::"Severity"
    WHEN BOOL_OR(severity = 'MODERATE') THEN 'MODERATE'::"Severity"
    WHEN BOOL_OR(severity = 'LOW') THEN 'LOW'::"Severity"
    ELSE NULL
  END AS severity
  FROM "Report"
  WHERE "incidentId" IS NOT NULL AND NOT "isDeleted" AND NOT "isSpam"
  GROUP BY "incidentId"
)
UPDATE "WasteIncident" i
SET severity = incident_severity.severity
FROM incident_severity
WHERE i.id = incident_severity."incidentId" AND i.severity IS DISTINCT FROM incident_severity.severity;

-- Keep the enum value available to older clients during rollout.
UPDATE "WasteIncident" SET severity = 'HIGH' WHERE severity = 'CRITICAL';

COMMIT;
