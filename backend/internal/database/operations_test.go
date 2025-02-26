package database

import (
	"chalkstone.council/internal/models"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCreateAndGetIssue(t *testing.T) {
	testDB, cleanup, err := StartTestDB()
	if err != nil {
		t.Fatalf("Failed to start test DB: %v", err)
	}
	defer cleanup()

	newIssue := &models.IssueCreate{
		Type:        models.TypePothole,
		Description: "Large pothole near Main Street",
		Location: struct {
			Latitude  float64 `json:"latitude" binding:"required"`
			Longitude float64 `json:"longitude" binding:"required"`
		}(struct {
			Latitude  float64 `json:"latitude"`
			Longitude float64 `json:"longitude"`
		}{Latitude: 51.5074, Longitude: -0.1278}),
		Images:     []string{"image1.jpg", "image2.jpg"},
		ReportedBy: "test_user",
	}

	issueID, err := testDB.CreateIssue(newIssue)
	assert.NoError(t, err, "Expected issue creation to succeed")
	assert.NotZero(t, issueID, "Issue ID should not be zero")

	issue, err := testDB.GetIssue(issueID)
	assert.NoError(t, err, "Expected issue retrieval to succeed")
	assert.NotNil(t, issue, "Expected to find an issue")

	assert.Equal(t, issueID, issue.ID, "Issue ID should match")
	assert.Equal(t, newIssue.Type, issue.Type, "Issue type should match")
	assert.Equal(t, newIssue.Description, issue.Description, "Issue description should match")
	assert.Equal(t, newIssue.Location.Latitude, issue.Location.Latitude, "Latitude should match")
	assert.Equal(t, newIssue.Location.Longitude, issue.Location.Longitude, "Longitude should match")
	assert.Equal(t, newIssue.Images, issue.Images, "Images should match")
	assert.Equal(t, newIssue.ReportedBy, issue.ReportedBy, "Reporter should match")
}
