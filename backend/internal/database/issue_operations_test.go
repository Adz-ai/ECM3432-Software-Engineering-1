package database

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"chalkstone.council/internal/models"
)

// TestGetIssueEdgeCases tests additional scenarios for GetIssue to increase coverage
func TestGetIssueEdgeCases(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	// Clear any existing data
	ClearTestData(t, testDB)

	// Test getting a non-existent issue
	issue, err := testDB.GetIssue(999)
	assert.NoError(t, err, "GetIssue should not return an error for non-existent issue, just nil")
	assert.Nil(t, issue, "Issue should be nil for non-existent ID")

	// Create an issue with missing fields to test error handling
	_, err = testDB.DB.Exec(`
		INSERT INTO issues (id, type, description, latitude, longitude, reported_by, status, created_at)
		VALUES (1, 'POTHOLE', 'Test pothole', 51.5074, -0.1278, 'test@example.com', 'NEW', NOW())
	`)
	assert.NoError(t, err, "Failed to create test issue")

	// Cause a DB error by temporarily altering the table structure
	_, err = testDB.DB.Exec(`ALTER TABLE issues RENAME COLUMN type TO type_temp`)
	assert.NoError(t, err, "Failed to rename column")

	// Now try to get the issue, which should fail due to column mismatch
	_, err = testDB.GetIssue(1)
	assert.Error(t, err, "GetIssue should fail when table structure is incorrect")

	// Restore the column for cleanup
	_, err = testDB.DB.Exec(`ALTER TABLE issues RENAME COLUMN type_temp TO type`)
	assert.NoError(t, err, "Failed to restore column")
}

// TestCreateIssueEdgeCases tests additional scenarios for CreateIssue to increase coverage
func TestCreateIssueEdgeCases(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	// Clear any existing data
	ClearTestData(t, testDB)

	// Test creating issue with invalid data (nil pointer)
	id, err := testDB.CreateIssue(nil)
	assert.Error(t, err, "CreateIssue should fail with nil issue")
	assert.Equal(t, int64(0), id, "ID should be 0 when creation fails")

	// Create issue with minimum required fields
	minimalIssue := &models.IssueCreate{
		Type:        models.TypePothole,
		Description: "Minimal pothole",
		Location: struct {
			Latitude  float64 `json:"latitude" binding:"required"`
			Longitude float64 `json:"longitude" binding:"required"`
		}{51.5074, -0.1278},
		ReportedBy: "test@example.com",
	}

	id, err = testDB.CreateIssue(minimalIssue)
	assert.NoError(t, err, "CreateIssue should succeed with minimal data")
	assert.Greater(t, id, int64(0), "ID should be positive when creation succeeds")

	// Test DB error scenario by temporarily removing a required column
	_, err = testDB.DB.Exec(`ALTER TABLE issues RENAME COLUMN description TO description_temp`)
	assert.NoError(t, err, "Failed to rename column")

	errorIssue := &models.IssueCreate{
		Type:        models.TypeGraffiti,
		Description: "Should fail",
		Location: struct {
			Latitude  float64 `json:"latitude" binding:"required"`
			Longitude float64 `json:"longitude" binding:"required"`
		}{51.5075, -0.1279},
		ReportedBy: "test@example.com",
	}

	_, err = testDB.CreateIssue(errorIssue)
	assert.Error(t, err, "CreateIssue should fail when table structure is incorrect")

	// Restore the column for cleanup
	_, err = testDB.DB.Exec(`ALTER TABLE issues RENAME COLUMN description_temp TO description`)
	assert.NoError(t, err, "Failed to restore column")
}

// TestGetIssuesForMapErrors tests error scenarios in GetIssuesForMap
func TestGetIssuesForMapErrors(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	// Clear any existing data
	ClearTestData(t, testDB)

	// Test with empty database
	issues, err := testDB.GetIssuesForMap()
	assert.NoError(t, err, "GetIssuesForMap should not fail with empty database")
	assert.Empty(t, issues, "Issues should be empty for empty database")

	// Cause a DB error by temporarily dropping a needed table
	_, err = testDB.DB.Exec(`ALTER TABLE issues RENAME TO issues_temp`)
	assert.NoError(t, err, "Failed to rename issues table")

	// This should fail since the issues table doesn't exist anymore
	_, err = testDB.GetIssuesForMap()
	assert.Error(t, err, "GetIssuesForMap should fail when issues table doesn't exist")

	// Restore the table for cleanup
	_, err = testDB.DB.Exec(`ALTER TABLE issues_temp RENAME TO issues`)
	assert.NoError(t, err, "Failed to restore issues table")
}

// TestListIssuesEdgeCases tests additional scenarios for ListIssues to increase coverage
func TestListIssuesEdgeCases(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	// Clear any existing data
	ClearTestData(t, testDB)

	// Test with empty database
	issues, err := testDB.ListIssues(1, 10)
	assert.NoError(t, err, "ListIssues should not fail with empty database")
	assert.Empty(t, issues, "Issues should be empty for empty database")

	// Test all filter parameters
	// First create some test data
	_, err = testDB.DB.Exec(`
		INSERT INTO engineers (id, name, email, phone, specialization, join_date)
		VALUES (1, 'Test Engineer', 'test@example.com', '555-1234', 'Pothole Repair', NOW())
	`)
	assert.NoError(t, err, "Failed to create test engineer")

	_, err = testDB.DB.Exec(`
		INSERT INTO issues (id, type, description, latitude, longitude, reported_by, status, created_at, assigned_to)
		VALUES 
		(1, 'POTHOLE', 'Pothole 1', 51.5074, -0.1278, 'test1@example.com', 'NEW', NOW(), NULL),
		(2, 'GRAFFITI', 'Graffiti 1', 51.5075, -0.1279, 'test2@example.com', 'IN_PROGRESS', NOW() - interval '1 day', 1),
		(3, 'BLOCKED_DRAIN', 'Drain 1', 51.5076, -0.1280, 'test3@example.com', 'RESOLVED', NOW() - interval '2 days', 1)
	`)
	assert.NoError(t, err, "Failed to create test issues")

	// Test with issues in the database
	issuesPage1, err := testDB.ListIssues(1, 10)
	assert.NoError(t, err, "ListIssues should not fail")
	assert.Equal(t, 3, len(issuesPage1), "Should find 3 issues")

	// Test pagination
	issuesPage2, err := testDB.ListIssues(2, 1)
	assert.NoError(t, err, "ListIssues should not fail with pagination")
	assert.Equal(t, 1, len(issuesPage2), "Should return 1 issue on page 2 with pageSize 1")

	// Test with invalid page and pageSize
	emptyPage, err := testDB.ListIssues(100, 10) // Page that doesn't exist
	assert.NoError(t, err, "ListIssues should not fail with invalid page")
	assert.Empty(t, emptyPage, "Should return empty result for non-existent page")

	// Clear all test data to start fresh
	ClearTestData(t, testDB)

	// Create at least one issue to ensure we have data to return
	testIssue := &models.IssueCreate{
		Type:        "POTHOLE",
		Description: "Test pothole",
		Images:      []string{"test-image.jpg"},
		ReportedBy:  "test@example.com",
	}
	// Set location
	testIssue.Location.Latitude = 51.5074
	testIssue.Location.Longitude = -0.1278
	_, err = testDB.CreateIssue(testIssue)
	assert.NoError(t, err, "Failed to create test issue")

	// Test with pageSize of 0 (should use default)
	allIssues, err := testDB.ListIssues(1, 0)
	assert.NoError(t, err, "ListIssues should not fail with pageSize 0")
	assert.NotEmpty(t, allIssues, "Should return issues with default pageSize")

	// Test DB error scenario by temporarily dropping a needed table
	_, err = testDB.DB.Exec(`ALTER TABLE issues RENAME TO issues_temp`)
	assert.NoError(t, err, "Failed to rename issues table")

	// This should fail since the issues table doesn't exist anymore
	_, err = testDB.ListIssues(1, 10)
	assert.Error(t, err, "ListIssues should fail when issues table doesn't exist")

	// Restore the table for cleanup
	_, err = testDB.DB.Exec(`ALTER TABLE issues_temp RENAME TO issues`)
	assert.NoError(t, err, "Failed to restore issues table")
}

// TestSearchIssuesEdgeCases tests additional scenarios for SearchIssues to increase coverage
func TestSearchIssuesEdgeCases(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	// Clear any existing data
	ClearTestData(t, testDB)

	// Test with empty database
	emptyResults, err := testDB.SearchIssues("", "")
	assert.NoError(t, err, "SearchIssues should not fail with empty database")
	assert.Empty(t, emptyResults, "Search results should be empty for empty database")

	// Test with empty search query
	emptyQuery, err := testDB.SearchIssues("", "")
	assert.NoError(t, err, "SearchIssues should not fail with empty query")
	assert.Empty(t, emptyQuery, "Search results should be empty for empty query")

	// Add test data
	_, err = testDB.DB.Exec(`
		INSERT INTO issues (id, type, description, latitude, longitude, reported_by, status, created_at)
		VALUES 
		(1, 'POTHOLE', 'Large pothole on Main Street', 51.5074, -0.1278, 'test1@example.com', 'NEW', NOW()),
		(2, 'GRAFFITI', 'Offensive graffiti on wall', 51.5075, -0.1279, 'test2@example.com', 'IN_PROGRESS', NOW() - interval '1 day')
	`)
	assert.NoError(t, err, "Failed to create test issues")

	// Test search that matches by type
	matchResults, err := testDB.SearchIssues("POTHOLE", "")
	assert.NoError(t, err, "SearchIssues should not fail with valid query")
	assert.Equal(t, 1, len(matchResults), "Should find 1 issue matching 'pothole'")
	assert.Equal(t, string("POTHOLE"), string(matchResults[0].Type), "Type should match")

	// Test search with no matches
	noMatchResults, err := testDB.SearchIssues("nonexistent", "")
	assert.NoError(t, err, "SearchIssues should not fail when no matches")
	assert.Empty(t, noMatchResults, "Search results should be empty when no matches")

	// Test DB error scenario by temporarily dropping a needed table
	_, err = testDB.DB.Exec(`ALTER TABLE issues RENAME TO issues_temp`)
	assert.NoError(t, err, "Failed to rename issues table")

	// This should fail since the issues table doesn't exist anymore
	_, err = testDB.SearchIssues("", "")
	assert.Error(t, err, "SearchIssues should fail when issues table doesn't exist")

	// Restore the table for cleanup
	_, err = testDB.DB.Exec(`ALTER TABLE issues_temp RENAME TO issues`)
	assert.NoError(t, err, "Failed to restore issues table")
}

// TestListEngineersEdgeCases tests additional scenarios for ListEngineers to increase coverage
func TestListEngineersEdgeCases(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	// Clear any existing data
	ClearTestData(t, testDB)

	// Test with empty database
	emptyEngineers, err := testDB.ListEngineers()
	assert.NoError(t, err, "ListEngineers should not fail with empty database")
	assert.Empty(t, emptyEngineers, "Engineers list should be empty for empty database")

	// Add test engineers
	_, err = testDB.DB.Exec(`
		INSERT INTO engineers (id, name, email, phone, specialization, join_date)
		VALUES 
		(1, 'Test Engineer 1', 'test1@example.com', '555-1234', 'Pothole Repair', NOW() - interval '10 days'),
		(2, 'Test Engineer 2', 'test2@example.com', '555-5678', 'Graffiti Removal', NOW() - interval '5 days')
	`)
	assert.NoError(t, err, "Failed to create test engineers")

	// Test with engineers in database
	engineers, err := testDB.ListEngineers()
	assert.NoError(t, err, "ListEngineers should not fail with engineers in database")
	assert.Equal(t, 2, len(engineers), "Should find 2 engineers")
	assert.Equal(t, "Test Engineer 1", engineers[0].Name, "First engineer name should match")
	assert.Equal(t, "Test Engineer 2", engineers[1].Name, "Second engineer name should match")

	// Test DB error scenario by temporarily dropping a needed table
	_, err = testDB.DB.Exec(`ALTER TABLE engineers RENAME TO engineers_temp`)
	assert.NoError(t, err, "Failed to rename engineers table")

	// This should fail since the engineers table doesn't exist anymore
	_, err = testDB.ListEngineers()
	assert.Error(t, err, "ListEngineers should fail when engineers table doesn't exist")

	// Restore the table for cleanup
	_, err = testDB.DB.Exec(`ALTER TABLE engineers_temp RENAME TO engineers`)
	assert.NoError(t, err, "Failed to restore engineers table")
}
