package database

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"chalkstone.council/internal/models"
)

// TestUpdateIssueEdgeCases tests additional scenarios for UpdateIssue to increase coverage
func TestUpdateIssueEdgeCases(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	// Clear any existing data
	ClearTestData(t, testDB)

	// Seed an engineer and an issue
	_, err = testDB.DB.Exec(`
		INSERT INTO engineers (id, name, email, phone, specialization, join_date)
		VALUES (1, 'Test Engineer', 'test@example.com', '555-1234', 'Pothole Repair', NOW())
	`)
	assert.NoError(t, err, "Failed to create test engineer")

	_, err = testDB.DB.Exec(`
		INSERT INTO issues (id, type, description, latitude, longitude, reported_by, status, created_at)
		VALUES (1, 'POTHOLE', 'Test pothole', 51.5074, -0.1278, 'test@example.com', 'NEW', NOW())
	`)
	assert.NoError(t, err, "Failed to create test issue")

	// Test updating non-existent issue ID
	resolvedStatus := models.StatusResolved
	updateNonExistentIssue := &models.IssueUpdate{
		Status:     &resolvedStatus,
		AssignedTo: new(int64),
	}
	*updateNonExistentIssue.AssignedTo = 1

	err = testDB.UpdateIssue(999, updateNonExistentIssue)
	assert.Error(t, err, "UpdateIssue should fail for non-existent issue")

	// Test with invalid assigned engineer ID
	inProgressStatus := models.StatusInProgress
	updateWithInvalidEngineer := &models.IssueUpdate{
		Status:     &inProgressStatus,
		AssignedTo: new(int64),
	}
	*updateWithInvalidEngineer.AssignedTo = 999 // Non-existent engineer ID

	err = testDB.UpdateIssue(1, updateWithInvalidEngineer)
	assert.Error(t, err, "UpdateIssue should fail with invalid engineer ID")

	// Test with nil update
	err = testDB.UpdateIssue(1, nil)
	assert.Error(t, err, "UpdateIssue should fail with nil update")

	// Test with valid update but DB error
	// We'll simulate this by dropping a needed column temporarily
	_, err = testDB.DB.Exec(`ALTER TABLE issues RENAME COLUMN status TO status_temp`)
	assert.NoError(t, err, "Failed to rename column")

	inProgressStatus2 := models.StatusInProgress
	validUpdateWithDBError := &models.IssueUpdate{
		Status: &inProgressStatus2,
	}

	err = testDB.UpdateIssue(1, validUpdateWithDBError)
	assert.Error(t, err, "UpdateIssue should fail due to DB error")

	// Restore the column for cleanup
	_, err = testDB.DB.Exec(`ALTER TABLE issues RENAME COLUMN status_temp TO status`)
	assert.NoError(t, err, "Failed to restore column")
}

// TestEngineerPerformanceErrors tests error scenarios in GetEngineerPerformance
func TestEngineerPerformanceErrors(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	// Clear any existing data
	ClearTestData(t, testDB)

	// Cause a DB error by temporarily dropping a needed table
	_, err = testDB.DB.Exec(`ALTER TABLE engineers RENAME TO engineers_temp`)
	assert.NoError(t, err, "Failed to rename engineers table")

	// This should fail since the engineers table doesn't exist anymore
	_, err = testDB.GetEngineerPerformance()
	assert.Error(t, err, "GetEngineerPerformance should fail when engineers table doesn't exist")

	// Restore the table for cleanup
	_, err = testDB.DB.Exec(`ALTER TABLE engineers_temp RENAME TO engineers`)
	assert.NoError(t, err, "Failed to restore engineers table")
}

// TestGetAverageResolutionTimeErrors tests error scenarios in GetAverageResolutionTime
func TestGetAverageResolutionTimeErrors(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	// Clear any existing data
	ClearTestData(t, testDB)

	// Cause a DB error by temporarily dropping a needed table
	_, err = testDB.DB.Exec(`ALTER TABLE issues RENAME TO issues_temp`)
	assert.NoError(t, err, "Failed to rename issues table")

	// This should fail since the issues table doesn't exist anymore
	_, err = testDB.GetAverageResolutionTime()
	assert.Error(t, err, "GetAverageResolutionTime should fail when issues table doesn't exist")

	// Restore the table for cleanup
	_, err = testDB.DB.Exec(`ALTER TABLE issues_temp RENAME TO issues`)
	assert.NoError(t, err, "Failed to restore issues table")

	// Test with data that has no resolved issues
	_, err = testDB.DB.Exec(`
		INSERT INTO issues (id, type, description, latitude, longitude, reported_by, status, created_at)
		VALUES (1, 'POTHOLE', 'Test pothole', 51.5074, -0.1278, 'test@example.com', 'NEW', NOW())
	`)
	assert.NoError(t, err, "Failed to create test issue")

	results, err := testDB.GetAverageResolutionTime()
	assert.NoError(t, err, "GetAverageResolutionTime should not fail with empty results")
	assert.Empty(t, results, "Results should be empty when no issues are resolved")
}

// TestGetIssueAnalyticsEdgeCases tests additional scenarios for GetIssueAnalytics
func TestGetIssueAnalyticsEdgeCases(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	// Clear any existing data
	ClearTestData(t, testDB)

	// Test with empty database
	analytics, err := testDB.GetIssueAnalytics("", "")
	assert.NoError(t, err, "GetIssueAnalytics should not fail with empty database")
	assert.NotNil(t, analytics, "Analytics should not be nil even with empty database")
	assert.Equal(t, 0, analytics["total"], "Total issues should be 0 for empty database")

	// Cause a DB error by temporarily dropping a needed table
	_, err = testDB.DB.Exec(`ALTER TABLE issues RENAME TO issues_temp`)
	assert.NoError(t, err, "Failed to rename issues table")

	// This should fail since the issues table doesn't exist anymore
	_, err = testDB.GetIssueAnalytics("", "")
	assert.Error(t, err, "GetIssueAnalytics should fail when issues table doesn't exist")

	// Restore the table for cleanup
	_, err = testDB.DB.Exec(`ALTER TABLE issues_temp RENAME TO issues`)
	assert.NoError(t, err, "Failed to restore issues table")
}
