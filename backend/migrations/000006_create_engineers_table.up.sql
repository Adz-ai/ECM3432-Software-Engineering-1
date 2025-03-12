-- Create engineers table
CREATE TABLE engineers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    specialization VARCHAR(50),
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for updated_at on engineers
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON engineers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Insert the initial set of engineers
INSERT INTO engineers (name, email, specialization) VALUES
('John Smith', 'john.smith@chalkstone.gov.uk', 'Roads and Infrastructure'),
('Emma Johnson', 'emma.johnson@chalkstone.gov.uk', 'Environmental Services'),
('Michael Chen', 'michael.chen@chalkstone.gov.uk', 'Urban Planning'),
('Sarah Williams', 'sarah.williams@chalkstone.gov.uk', 'Public Safety'),
('David Garcia', 'david.garcia@chalkstone.gov.uk', 'Drainage Systems');

-- Add a temp column for the engineer_id foreign key
ALTER TABLE issues ADD COLUMN engineer_id INTEGER;

-- Update the relationships for existing data by mapping enum values to engineer IDs
UPDATE issues SET engineer_id = engineers.id
FROM engineers
WHERE assigned_to::TEXT = engineers.name;

-- Drop the assigned_to column (which is an enum type)
ALTER TABLE issues DROP COLUMN assigned_to;

-- Rename the temp column to assigned_to
ALTER TABLE issues RENAME COLUMN engineer_id TO assigned_to;

-- Add foreign key constraint
ALTER TABLE issues 
ADD CONSTRAINT fk_issues_engineer 
FOREIGN KEY (assigned_to) 
REFERENCES engineers(id);
