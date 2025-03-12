-- Add a temp column for the engineer name
ALTER TABLE issues ADD COLUMN engineer_name VARCHAR(100);

-- Update the engineer name from the engineers table
UPDATE issues
SET engineer_name = engineers.name
FROM engineers
WHERE issues.assigned_to = engineers.id;

-- Drop the foreign key constraint first
ALTER TABLE issues DROP CONSTRAINT IF EXISTS fk_issues_engineer;

-- Drop the assigned_to column (which is now an engineer_id)
ALTER TABLE issues DROP COLUMN assigned_to;

-- Rename the engineer_name column to assigned_to
ALTER TABLE issues RENAME COLUMN engineer_name TO assigned_to;

-- Drop the engineers table and related trigger
DROP TRIGGER IF EXISTS set_timestamp ON engineers;
DROP FUNCTION IF EXISTS trigger_set_timestamp;
DROP TABLE IF EXISTS engineers;
