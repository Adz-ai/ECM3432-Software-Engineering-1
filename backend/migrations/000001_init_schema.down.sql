DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS issues;
DROP TYPE IF EXISTS issue_status;
DROP TYPE IF EXISTS issue_type;
DROP EXTENSION IF EXISTS "uuid-ossp";