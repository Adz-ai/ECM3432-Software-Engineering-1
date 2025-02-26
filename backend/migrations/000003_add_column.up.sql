-- Add closed_at column to issues table
ALTER TABLE issues ADD COLUMN closed_at TIMESTAMP WITH TIME ZONE;

-- Create a trigger to set closed_at when status changes to CLOSED
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