CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
CREATE TYPE issue_status AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE issue_type AS ENUM ('POTHOLE', 'STREET_LIGHT', 'GRAFFITI', 'ANTI_SOCIAL', 'FLY_TIPPING', 'BLOCKED_DRAIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS issues (
                                      id SERIAL PRIMARY KEY,
                                      type issue_type NOT NULL,
                                      status issue_status NOT NULL DEFAULT 'NEW',
                                      description TEXT NOT NULL,
                                      latitude DOUBLE PRECISION NOT NULL,
                                      longitude DOUBLE PRECISION NOT NULL,
                                      images TEXT[] DEFAULT '{}',
                                      reported_by VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                             );

CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_type ON issues(type);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_issues_updated_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();