-- Revert resolved_at timestamp for all RESOLVED issues
-- Sets resolved_at back to match updated_at as it would have been originally

UPDATE issues
SET resolved_at = updated_at
WHERE status = 'RESOLVED';
