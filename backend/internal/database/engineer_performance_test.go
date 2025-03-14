package database

import (
	"chalkstone.council/internal/models"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetEngineerPerformanceEdgeCases(t *testing.T) {
	// Setup test database
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test database: %v", err)
	}
	defer cleanup()

	// Clear data and seed the database with test data
	ClearTestData(t, testDB)

	// Create engineers
	_, err = testDB.DB.Exec(`
		INSERT INTO engineers (id, name, email, phone, specialization, join_date) 
		VALUES 
		(1, 'Engineer 1', 'eng1@example.com', '1111111111', 'POTHOLE', NOW()),
		(2, 'Engineer 2', 'eng2@example.com', '2222222222', 'STREET_LIGHT', NOW())
	`)
	assert.NoError(t, err, "Failed to insert test engineers")

	// Create issues with various statuses and types
	// Create resolved issues for Engineer 1
	_, err = testDB.DB.Exec(`
		INSERT INTO issues (id, type, description, latitude, longitude, reported_by, assigned_to, status, created_at, updated_at, resolved_at) 
		VALUES 
		(1, 'POTHOLE', 'Resolved pothole 1', 51.5074, -0.1278, 'user1', 1, 'RESOLVED', NOW() - interval '3 days', NOW() - interval '1 day', NOW() - interval '1 day'),
		(2, 'POTHOLE', 'Resolved pothole 2', 51.5075, -0.1279, 'user2', 1, 'RESOLVED', NOW() - interval '5 days', NOW() - interval '2 days', NOW() - interval '2 days'),
		(3, 'STREET_LIGHT', 'Resolved light', 51.5076, -0.1280, 'user3', 1, 'RESOLVED', NOW() - interval '10 days', NOW() - interval '3 days', NOW() - interval '3 days')
	`)
	assert.NoError(t, err, "Failed to insert resolved issues for Engineer 1")

	// Create in-progress issues for Engineer 1
	_, err = testDB.DB.Exec(`
		INSERT INTO issues (id, type, description, latitude, longitude, reported_by, assigned_to, status, created_at, updated_at) 
		VALUES 
		(4, 'POTHOLE', 'In-progress pothole', 51.5077, -0.1281, 'user4', 1, 'IN_PROGRESS', NOW() - interval '2 days', NOW() - interval '1 day'),
		(5, 'GRAFFITI', 'In-progress graffiti', 51.5078, -0.1282, 'user5', 1, 'IN_PROGRESS', NOW() - interval '4 days', NOW() - interval '2 days')
	`)
	assert.NoError(t, err, "Failed to insert in-progress issues for Engineer 1")

	// Create resolved issues for Engineer 2
	_, err = testDB.DB.Exec(`
		INSERT INTO issues (id, type, description, latitude, longitude, reported_by, assigned_to, status, created_at, updated_at, resolved_at) 
		VALUES 
		(6, 'STREET_LIGHT', 'Resolved light 1', 51.5079, -0.1283, 'user6', 2, 'RESOLVED', NOW() - interval '7 days', NOW() - interval '4 days', NOW() - interval '4 days'),
		(7, 'BLOCKED_DRAIN', 'Resolved drain', 51.5080, -0.1284, 'user7', 2, 'RESOLVED', NOW() - interval '6 days', NOW() - interval '3 days', NOW() - interval '3 days')
	`)
	assert.NoError(t, err, "Failed to insert resolved issues for Engineer 2")

	// Create in-progress issue for Engineer 2
	_, err = testDB.DB.Exec(`
		INSERT INTO issues (id, type, description, latitude, longitude, reported_by, assigned_to, status, created_at, updated_at) 
		VALUES 
		(8, 'STREET_LIGHT', 'In-progress light', 51.5081, -0.1285, 'user8', 2, 'IN_PROGRESS', NOW() - interval '3 days', NOW() - interval '1 day')
	`)
	assert.NoError(t, err, "Failed to insert in-progress issue for Engineer 2")

	// Create new unassigned issue
	_, err = testDB.DB.Exec(`
		INSERT INTO issues (id, type, description, latitude, longitude, reported_by, status, created_at) 
		VALUES 
		(9, 'FLY_TIPPING', 'New fly tipping', 51.5082, -0.1286, 'user9', 'NEW', NOW() - interval '1 day')
	`)
	assert.NoError(t, err, "Failed to insert new unassigned issue")

	// Test getting engineer performance
	performance, err := testDB.GetEngineerPerformance()
	assert.NoError(t, err, "GetEngineerPerformance should not fail")
	assert.NotNil(t, performance, "Performance should not be nil")
	assert.Equal(t, 2, len(performance), "Should return performance for both engineers")

	// Verify Engineer 1 performance
	var eng1Perf *models.EngineerPerformance
	var eng2Perf *models.EngineerPerformance
	for _, perf := range performance {
		if perf.Engineer.ID == 1 {
			eng1Perf = perf
		} else if perf.Engineer.ID == 2 {
			eng2Perf = perf
		}
	}

	assert.NotNil(t, eng1Perf, "Should have performance data for Engineer 1")
	assert.Equal(t, 3, eng1Perf.IssuesResolved, "Engineer 1 should have 3 resolved issues")
	assert.Equal(t, 2, eng1Perf.IssuesAssigned, "Engineer 1 should have 2 assigned issues")
	assert.Equal(t, 2, eng1Perf.ResolvedIssuesByType["POTHOLE"], "Engineer 1 should have 2 resolved potholes")
	assert.Equal(t, 1, eng1Perf.ResolvedIssuesByType["STREET_LIGHT"], "Engineer 1 should have 1 resolved street light")
	assert.Equal(t, 1, eng1Perf.AssignedIssuesByType["POTHOLE"], "Engineer 1 should have 1 assigned pothole")
	assert.Equal(t, 1, eng1Perf.AssignedIssuesByType["GRAFFITI"], "Engineer 1 should have 1 assigned graffiti")

	// Verify Engineer 2 performance
	assert.NotNil(t, eng2Perf, "Should have performance data for Engineer 2")
	assert.Equal(t, 2, eng2Perf.IssuesResolved, "Engineer 2 should have 2 resolved issues")
	assert.Equal(t, 1, eng2Perf.IssuesAssigned, "Engineer 2 should have 1 assigned issue")
	assert.Equal(t, 1, eng2Perf.ResolvedIssuesByType["STREET_LIGHT"], "Engineer 2 should have 1 resolved street light")
	assert.Equal(t, 1, eng2Perf.ResolvedIssuesByType["BLOCKED_DRAIN"], "Engineer 2 should have 1 resolved blocked drain")
	assert.Equal(t, 1, eng2Perf.AssignedIssuesByType["STREET_LIGHT"], "Engineer 2 should have 1 assigned street light")

	// Test average resolution time for both engineers
	assert.NotEmpty(t, eng1Perf.AvgResolutionTime, "Average resolution time should not be empty")
	assert.NotEmpty(t, eng2Perf.AvgResolutionTime, "Average resolution time should not be empty")
	assert.True(t, eng1Perf.AvgResolutionSeconds > 0, "Average resolution seconds should be greater than 0")
	assert.True(t, eng2Perf.AvgResolutionSeconds > 0, "Average resolution seconds should be greater than 0")

	// Test with no engineers in the database
	ClearTestData(t, testDB)
	emptyPerformance, err := testDB.GetEngineerPerformance()
	assert.NoError(t, err, "GetEngineerPerformance should not fail with empty database")
	assert.Empty(t, emptyPerformance, "Performance should be empty with no engineers")

	// Test with engineers but no issues
	_, err = testDB.DB.Exec(`
		INSERT INTO engineers (id, name, email, phone, specialization, join_date) 
		VALUES (1, 'Engineer 1', 'eng1@example.com', '1111111111', 'POTHOLE', NOW())
	`)
	assert.NoError(t, err, "Failed to insert test engineer")

	noIssuesPerformance, err := testDB.GetEngineerPerformance()
	assert.NoError(t, err, "GetEngineerPerformance should not fail with no issues")
	assert.Equal(t, 1, len(noIssuesPerformance), "Should return performance for the engineer")
	assert.Equal(t, 0, noIssuesPerformance[0].IssuesResolved, "Engineer should have 0 resolved issues")
	assert.Equal(t, 0, noIssuesPerformance[0].IssuesAssigned, "Engineer should have 0 assigned issues")
}
