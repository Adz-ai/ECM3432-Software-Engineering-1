-- Add temporary column for the text type
ALTER TABLE issues ADD COLUMN assigned_to_old TEXT;

-- Migrate data
UPDATE issues
SET assigned_to_old = assigned_to::TEXT;

-- Drop old column and rename new column
ALTER TABLE issues DROP COLUMN assigned_to;
ALTER TABLE issues RENAME COLUMN assigned_to_old TO assigned_to;

-- Drop the enum type
DROP TYPE engineer_name;
