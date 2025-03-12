package database

import (
	"chalkstone.council/internal/models"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

// 🏗 Setup and Seed Database
func setupTestData(t *testing.T, db *DB) {
	// Seed test issues (Initially NEW)
	issues := []models.IssueCreate{
		{
			Type:        models.TypePothole,
			Description: "Pothole on High Street",
			Location: struct {
				Latitude  float64 `json:"latitude" binding:"required"`
				Longitude float64 `json:"longitude" binding:"required"`
			}(struct{ Latitude, Longitude float64 }{51.5074, -0.1278}),
			ReportedBy: "user1",
		},
		{
			Type:        models.TypeGraffiti,
			Description: "Graffiti on City Hall",
			Location: struct {
				Latitude  float64 `json:"latitude" binding:"required"`
				Longitude float64 `json:"longitude" binding:"required"`
			}(struct{ Latitude, Longitude float64 }{51.508, -0.128}),
			ReportedBy: "user2",
		},
		{
			Type:        models.TypeBlockedDrain,
			Description: "Drain is blocked near Market Square",
			Location: struct {
				Latitude  float64 `json:"latitude" binding:"required"`
				Longitude float64 `json:"longitude" binding:"required"`
			}(struct{ Latitude, Longitude float64 }{51.509, -0.129}),
			ReportedBy: "user3",
		},
	}

	// Insert issues
	for _, issue := range issues {
		_, err := db.CreateIssue(&issue)
		assert.NoError(t, err, "Seeding issues failed")
	}

	// Move created_at back 2 days
	_, err := db.DB.Exec(`
		UPDATE issues 
		SET created_at = created_at - INTERVAL '2 days'
		WHERE type = 'POTHOLE';
	`)
	assert.NoError(t, err, "Updating created_at failed")

	// Move created_at back 1 day
	_, err = db.DB.Exec(`
		UPDATE issues 
		SET created_at = created_at - INTERVAL '1 day'
		WHERE type = 'GRAFFITI';
	`)
	assert.NoError(t, err, "Updating created_at failed")

	// Mark issue as CLOSED (Trigger sets closed_at automatically)
	_, err = db.DB.Exec(`
		UPDATE issues 
		SET status = 'CLOSED'
		WHERE type = 'POTHOLE';
	`)
	assert.NoError(t, err, "Updating issue statuses failed")

	// Mark issue as CLOSED (Trigger sets closed_at automatically)
	_, err = db.DB.Exec(`
		UPDATE issues 
		SET status = 'RESOLVED'
		WHERE type = 'BLOCKED_DRAIN';
	`)
	assert.NoError(t, err, "Updating issue statuses failed")
}

func TestCreateAndGetIssue(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	issue := models.IssueCreate{
		Type:        models.TypePothole,
		Description: "Large pothole near the roundabout",
		Location: struct {
			Latitude  float64 `json:"latitude" binding:"required"`
			Longitude float64 `json:"longitude" binding:"required"`
		}(struct{ Latitude, Longitude float64 }{51.5014, -0.1419}),
		ReportedBy: "user123",
	}

	// ✅ Create Issue
	id, err := testDB.CreateIssue(&issue)
	assert.NoError(t, err, "CreateIssue should not fail")
	assert.NotZero(t, id, "Issue ID should be non-zero")

	// ✅ Get Issue
	retrievedIssue, err := testDB.GetIssue(id)
	assert.NoError(t, err, "GetIssue should not fail")
	assert.NotNil(t, retrievedIssue, "Issue should exist")
	assert.Equal(t, issue.Type, retrievedIssue.Type, "Issue type should match")
	assert.Equal(t, issue.Description, retrievedIssue.Description, "Description should match")
}

func TestUpdateIssue(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	// Ensure testDB is initialized
	if testDB == nil {
		t.Fatalf("testDB is nil, database initialization failed")
	}

	// Seed Data
	setupTestData(t, testDB)

	// Check if issue exists before updating
	existingIssue, err := testDB.GetIssue(1)
	if err != nil || existingIssue == nil {
		t.Fatalf("Test issue with ID 1 does not exist")
	}

	resolvedStatus := models.StatusResolved
	var assignedEngineerID int64 = 1 // Use engineer ID 1 instead of string name
	update := &models.IssueUpdate{
		Status:     &resolvedStatus,
		AssignedTo: &assignedEngineerID, // Ensure assignedTo is not nil
	}

	err = testDB.UpdateIssue(1, update)
	assert.NoError(t, err, "UpdateIssue should not fail")

	// ✅ Verify Update
	updatedIssue, err := testDB.GetIssue(1)
	assert.NoError(t, err)
	assert.Equal(t, models.StatusResolved, updatedIssue.Status, "Issue should be marked as resolved")
	assert.Equal(t, int64(1), *updatedIssue.AssignedTo, "Engineer ID should be assigned correctly")
}

func TestListIssues(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	// Seed Data
	setupTestData(t, testDB)

	// ✅ List Issues
	issues, err := testDB.ListIssues(1, 10)
	assert.NoError(t, err, "ListIssues should not fail")
	assert.Len(t, issues, 3, "Should return 2 issues")
}

func TestSearchIssues(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	// Seed Data
	setupTestData(t, testDB)

	// ✅ Search for Graffiti issues
	issues, err := testDB.SearchIssues(string(models.TypeGraffiti), "")
	assert.NoError(t, err)
	assert.Len(t, issues, 1, "Should return 1 Graffiti issue")
}

func TestGetIssuesForMap(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	// Seed Data
	setupTestData(t, testDB)

	// ✅ Retrieve Issues for Map
	issues, err := testDB.GetIssuesForMap()
	assert.NoError(t, err, "GetIssuesForMap should not fail")
	assert.Len(t, issues, 3, "Should return 2 issues")
}

func TestGetAverageResolutionTime(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	setupTestData(t, testDB)

	resolutionTimes, err := testDB.GetAverageResolutionTime()
	assert.NoError(t, err)
	assert.NotEmpty(t, resolutionTimes)

	assert.Equal(t, "2d 0h", resolutionTimes["POTHOLE"], "Pothole resolution time should be 2d 0h")
}

func TestGetEngineerPerformance(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	setupTestData(t, testDB)

	// First create a test engineer
	_, err = testDB.DB.Exec(`INSERT INTO engineers (id, name, email, phone, specialization, join_date) VALUES (1, 'Test Engineer', 'test@example.com', '123456789', 'General', NOW())`)
	assert.NoError(t, err)

	// Then assign engineer ID to closed issues
	_, err = testDB.DB.Exec(`UPDATE issues SET assigned_to = 1 WHERE status = 'CLOSED'`)
	assert.NoError(t, err)

	performance, err := testDB.GetEngineerPerformance()
	assert.NoError(t, err)
	assert.NotEmpty(t, performance)

	// Check that the performance data is a slice of EngineerPerformance
	assert.NotNil(t, performance, "Performance data should not be nil")
	assert.NotEmpty(t, performance, "Performance data should not be empty")
	
	// Look for our test engineer in the performance results
	found := false
	for _, engPerf := range performance {
		if engPerf.Engineer.Name == "Test Engineer" {
			found = true
			assert.Equal(t, 1, engPerf.IssuesResolved, "Engineer should have resolved 1 issue")
		}
	}
	assert.True(t, found, "Test Engineer should be in the performance data")
}

func TestGetIssueAnalytics(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	setupTestData(t, testDB)

	// 🎯 Execute analytics function
	analytics, err := testDB.GetIssueAnalytics("", "")
	assert.NoError(t, err)
	assert.NotEmpty(t, analytics)

	// ✅ Check total issue count
	assert.Equal(t, 3, analytics["total_issues"], "There should be 3 total issues")

	// ✅ Verify issue distribution by type
	issuesByType := analytics["issues_by_type"].(map[string]int)
	assert.Equal(t, 1, issuesByType["POTHOLE"], "There should be 1 Pothole issue")
	assert.Equal(t, 1, issuesByType["GRAFFITI"], "There should be 1 Graffiti issue")
	assert.Equal(t, 1, issuesByType["BLOCKED_DRAIN"], "There should be 1 Blocked Drain issue")

	// ✅ Verify issue distribution by status
	issuesByStatus := analytics["issues_by_status"].(map[string]int)
	assert.Equal(t, 1, issuesByStatus["CLOSED"], "There should be 1 Closed issue")
	assert.Equal(t, 1, issuesByStatus["RESOLVED"], "There should be 1 Resolved issue")
	assert.Equal(t, 1, issuesByStatus["NEW"], "There should be 1 New issue")

	// ✅ Verify issues by month (checks if aggregation works)
	issuesByMonth := analytics["issues_by_month"].(map[string]int)
	assert.NotEmpty(t, issuesByMonth, "Issues should be grouped by month")

	fmt.Println("✅ TestGetIssueAnalytics Passed!")
}
