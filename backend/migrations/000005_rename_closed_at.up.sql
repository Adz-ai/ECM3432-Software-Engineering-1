-- Drop the existing trigger
DROP TRIGGER IF EXISTS trigger_set_closed_at ON issues;
DROP FUNCTION IF EXISTS set_closed_at;

-- Rename closed_at to resolved_at
ALTER TABLE issues RENAME COLUMN closed_at TO resolved_at;

-- Create new trigger to set resolved_at when status changes to RESOLVED
CREATE OR REPLACE FUNCTION set_resolved_at()
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'RESOLVED' AND OLD.status <> 'RESOLVED' THEN
        NEW.resolved_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_resolved_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
EXECUTE FUNCTION set_resolved_at();

-- Update existing resolved issues to have resolved_at set if it's NULL
UPDATE issues
SET resolved_at = updated_at
WHERE status = 'RESOLVED' AND resolved_at IS NULL;
