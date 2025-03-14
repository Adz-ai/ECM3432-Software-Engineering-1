-- Update resolved_at timestamp for all RESOLVED issues
-- Sets resolved_at to a random timestamp between 3-15 days after created_at
-- Ensures no resolved_at date goes beyond the current date (March 14, 2025)

UPDATE issues
SET resolved_at = LEAST(
    created_at + (INTERVAL '3 days') + (RANDOM() * (INTERVAL '12 days')),
    TIMESTAMP '2025-03-14 16:24:09+00'
)
WHERE status = 'RESOLVED';
