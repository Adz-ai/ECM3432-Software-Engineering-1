-- Drop the trigger first (otherwise, you can't drop the column)
DROP TRIGGER IF EXISTS trigger_set_closed_at ON issues;
DROP FUNCTION IF EXISTS set_closed_at;

-- Remove the closed_at column from the issues table
ALTER TABLE issues DROP COLUMN IF EXISTS closed_at;