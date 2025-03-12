package models

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValidateIssueType(t *testing.T) {
	assert.True(t, ValidateIssueType(TypePothole))
	assert.True(t, ValidateIssueType(TypeStreetLight))
	assert.True(t, ValidateIssueType(TypeGraffiti))
	assert.False(t, ValidateIssueType("INVALID"))
}

func TestValidateIssueStatus(t *testing.T) {
	assert.True(t, ValidateIssueStatus(StatusNew))
	assert.True(t, ValidateIssueStatus(StatusResolved))
	assert.True(t, ValidateIssueStatus(StatusInProgress))
	assert.False(t, ValidateIssueStatus("UNKNOWN"))
}

func TestIssueCreateJSON(t *testing.T) {
	issue := IssueCreate{
		Type:        TypePothole,
		Description: "Pothole on main road",
		Location: struct {
			Latitude  float64 `json:"latitude" binding:"required"`
			Longitude float64 `json:"longitude" binding:"required"`
		}(struct {
			Latitude  float64 `json:"latitude"`
			Longitude float64 `json:"longitude"`
		}{Latitude: 51.5074, Longitude: -0.1278}),
		Images:     []string{"img1.jpg", "img2.jpg"},
		ReportedBy: "user123",
	}

	data, err := json.Marshal(issue)
	assert.NoError(t, err, "JSON marshalling failed")

	expectedJSON := `{"type":"POTHOLE","description":"Pothole on main road","location":{"latitude":51.5074,"longitude":-0.1278},"images":["img1.jpg","img2.jpg"],"reported_by":"user123"}`
	assert.JSONEq(t, expectedJSON, string(data))
}

func TestIssueUpdateJSON(t *testing.T) {
	newStatus := StatusResolved
	update := IssueUpdate{
		Status:     &newStatus,
		AssignedTo: nil,
	}

	data, err := json.Marshal(update)
	assert.NoError(t, err)

	expectedJSON := `{"status":"RESOLVED"}`
	assert.JSONEq(t, expectedJSON, string(data))
}
