-- Drop the new trigger
DROP TRIGGER IF EXISTS trigger_set_resolved_at ON issues;
DROP FUNCTION IF EXISTS set_resolved_at;

-- Rename resolved_at back to closed_at
ALTER TABLE issues RENAME COLUMN resolved_at TO closed_at;

-- Recreate original trigger function for closed_at
CREATE OR REPLACE FUNCTION set_closed_at()
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'CLOSED' AND OLD.status <> 'CLOSED' THEN
        NEW.closed_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_closed_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
EXECUTE FUNCTION set_closed_at();
