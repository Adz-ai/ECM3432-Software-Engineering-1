-- Remove the sample issues created in the up migration
-- This will delete all issues created between December 2024 and March 2025

DELETE FROM issues
WHERE created_at >= '2024-12-01' AND created_at <= '2025-03-12';
