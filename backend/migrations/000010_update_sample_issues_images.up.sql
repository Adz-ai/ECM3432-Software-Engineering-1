-- Update sample issues to reference the sample images in Minio
-- The images will be available at http://localhost:9000/issues-bucket/{filename}

-- Update POTHOLE issues with pothole images
UPDATE issues 
SET images = ARRAY['http://localhost:9000/issues-bucket/pothole-1.jpeg', 'http://localhost:9000/issues-bucket/pothole-2.png', 'http://localhost:9000/issues-bucket/pothole-3.jpeg']
WHERE type = 'POTHOLE' AND created_at < '2025-03-01';

UPDATE issues 
SET images = ARRAY['http://localhost:9000/issues-bucket/pothole-3.jpeg', 'http://localhost:9000/issues-bucket/pothole-1.jpeg']
WHERE type = 'POTHOLE' AND created_at >= '2025-03-01';

-- Update STREET_LIGHT issues with street light images
UPDATE issues 
SET images = ARRAY['http://localhost:9000/issues-bucket/street-light-1.jpeg', 'http://localhost:9000/issues-bucket/street-light-2.jpeg', 'http://localhost:9000/issues-bucket/street-light-3.jpg']
WHERE type = 'STREET_LIGHT' AND created_at < '2025-02-01';

UPDATE issues 
SET images = ARRAY['http://localhost:9000/issues-bucket/street-light-2.jpeg', 'http://localhost:9000/issues-bucket/street-light-3.jpg']
WHERE type = 'STREET_LIGHT' AND created_at >= '2025-02-01';

-- Update GRAFFITI issues with graffiti images
UPDATE issues 
SET images = ARRAY['http://localhost:9000/issues-bucket/graffiti-1.jpg', 'http://localhost:9000/issues-bucket/graffiti-2.webp', 'http://localhost:9000/issues-bucket/graffiti-3.jpg']
WHERE type = 'GRAFFITI' AND created_at < '2025-02-15';

UPDATE issues 
SET images = ARRAY['http://localhost:9000/issues-bucket/graffiti-2.webp', 'http://localhost:9000/issues-bucket/graffiti-3.jpg']
WHERE type = 'GRAFFITI' AND created_at >= '2025-02-15';

-- Update ANTI_SOCIAL issues with anti-social images
UPDATE issues 
SET images = ARRAY['http://localhost:9000/issues-bucket/anti-social-1.jpg', 'http://localhost:9000/issues-bucket/anti-social-2.webp', 'http://localhost:9000/issues-bucket/anti-social-3.webp']
WHERE type = 'ANTI_SOCIAL' AND created_at < '2025-02-01';

UPDATE issues 
SET images = ARRAY['http://localhost:9000/issues-bucket/anti-social-2.webp', 'http://localhost:9000/issues-bucket/anti-social-3.webp']
WHERE type = 'ANTI_SOCIAL' AND created_at >= '2025-02-01';

-- Update FLY_TIPPING issues with fly-tipping images
UPDATE issues 
SET images = ARRAY['http://localhost:9000/issues-bucket/fly-tipping-1.jpg', 'http://localhost:9000/issues-bucket/fly-tipping-2.jpeg', 'http://localhost:9000/issues-bucket/fly-tipping-3.jpg']
WHERE type = 'FLY_TIPPING' AND created_at < '2025-02-01';

UPDATE issues 
SET images = ARRAY['http://localhost:9000/issues-bucket/fly-tipping-2.jpeg', 'http://localhost:9000/issues-bucket/fly-tipping-3.jpg']
WHERE type = 'FLY_TIPPING' AND created_at >= '2025-02-01';

-- Update BLOCKED_DRAIN issues with blocked drain images
UPDATE issues 
SET images = ARRAY['http://localhost:9000/issues-bucket/blocked-drain-1.jpg', 'http://localhost:9000/issues-bucket/blocked-drain-2.jpg', 'http://localhost:9000/issues-bucket/blocked-drain-3.jpg']
WHERE type = 'BLOCKED_DRAIN' AND created_at < '2025-02-15';

UPDATE issues 
SET images = ARRAY['http://localhost:9000/issues-bucket/blocked-drain-2.jpg', 'http://localhost:9000/issues-bucket/blocked-drain-3.jpg']
WHERE type = 'BLOCKED_DRAIN' AND created_at >= '2025-02-15';
