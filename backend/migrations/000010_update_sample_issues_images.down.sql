-- Revert all sample issues back to having no images

UPDATE issues 
SET images = '{}'
WHERE type IN ('POTHOLE', 'STREET_LIGHT', 'GRAFFITI', 'ANTI_SOCIAL', 'FLY_TIPPING', 'BLOCKED_DRAIN');
