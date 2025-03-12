-- Update existing engineers with placeholder phone numbers
UPDATE engineers SET phone = '+44 123 456 ' || id || '789' WHERE phone IS NULL;

-- Alter the phone column to be NOT NULL
ALTER TABLE engineers ALTER COLUMN phone SET NOT NULL;
