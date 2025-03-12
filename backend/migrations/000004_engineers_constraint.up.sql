-- Create enum type for engineers
CREATE TYPE engineer_name AS ENUM (
  'John Smith',
  'Emma Johnson',
  'Michael Chen',
  'Sarah Williams',
  'David Garcia'
);

-- Add temporary column for the new type
ALTER TABLE issues ADD COLUMN assigned_to_new engineer_name;

-- Migrate data where possible
UPDATE issues
SET assigned_to_new = 
  CASE
    WHEN assigned_to = 'John Smith' THEN 'John Smith'::engineer_name
    WHEN assigned_to = 'Emma Johnson' THEN 'Emma Johnson'::engineer_name
    WHEN assigned_to = 'Michael Chen' THEN 'Michael Chen'::engineer_name
    WHEN assigned_to = 'Sarah Williams' THEN 'Sarah Williams'::engineer_name
    WHEN assigned_to = 'David Garcia' THEN 'David Garcia'::engineer_name
    ELSE NULL
  END;

-- Drop old column and rename new column
ALTER TABLE issues DROP COLUMN assigned_to;
ALTER TABLE issues RENAME COLUMN assigned_to_new TO assigned_to;
