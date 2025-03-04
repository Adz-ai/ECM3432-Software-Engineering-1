package api

import (
	"bytes"
	dbMock "chalkstone.council/internal/database/mocks"
	authMock "chalkstone.council/internal/middleware/mocks"
	"chalkstone.council/internal/models"

	"encoding/json"
	"go.uber.org/mock/gomock"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// Helper function to set up a test router
func setupTestRouter(t *testing.T) (*gin.Engine, *dbMock.MockDatabaseOperations, *authMock.MockAuthenticator) {
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)

	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	mockAuth := authMock.NewMockAuthenticator(ctrl)

	// Mock authentication behavior
	mockAuth.EXPECT().AuthMiddleware().Return(func(c *gin.Context) {
		c.Set("userID", "test_user")
		c.Next()
	}).AnyTimes()

	mockAuth.EXPECT().StaffOnly().Return(func(c *gin.Context) {
		c.Set("userType", "staff")
		c.Next()
	}).AnyTimes()

	router := gin.Default()
	SetupRoutes(router, mockDB, mockAuth)

	return router, mockDB, mockAuth
}

func TestCreateIssue(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	issuePayload := models.IssueCreate{
		Type:        "POTHOLE",
		Description: "Large pothole on road",
		Location: struct {
			Latitude  float64 `json:"latitude" binding:"required"`
			Longitude float64 `json:"longitude" binding:"required"`
		}(struct {
			Latitude  float64 `json:"latitude"`
			Longitude float64 `json:"longitude"`
		}{Latitude: 51.5074, Longitude: -0.1278}),
		Images:     []string{"image1.jpg"},
		ReportedBy: "test_user",
	}

	body, _ := json.Marshal(issuePayload)
	mockDB.EXPECT().CreateIssue(gomock.Any()).Return(int64(1), nil)

	req, _ := http.NewRequest("POST", "/api/issues", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer valid_token")
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
}

func TestGetIssue(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	mockIssue := &models.Issue{
		ID:          1,
		Type:        "POTHOLE",
		Status:      "NEW",
		Description: "Big pothole",
		Location: struct {
			Latitude  float64 `json:"latitude" db:"latitude"`
			Longitude float64 `json:"longitude" db:"longitude"`
		}(struct {
			Latitude  float64 `json:"latitude"`
			Longitude float64 `json:"longitude"`
		}{Latitude: 51.5074, Longitude: -0.1278}),
		ReportedBy: "test_user",
	}

	mockDB.EXPECT().GetIssue(int64(1)).Return(mockIssue, nil)

	req, _ := http.NewRequest("GET", "/api/issues/1", nil)
	req.Header.Set("Authorization", "Bearer valid_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestUpdateIssue(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	updatePayload := models.IssueUpdate{
		Status:     (*models.IssueStatus)(new(string)),
		AssignedTo: new(string),
	}
	*updatePayload.Status = "IN_PROGRESS"
	*updatePayload.AssignedTo = "staff_user"

	body, _ := json.Marshal(updatePayload)
	mockDB.EXPECT().UpdateIssue(int64(1), gomock.Any()).Return(nil)

	req, _ := http.NewRequest("PUT", "/api/issues/1", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer staff_token")
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestListIssues(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	mockDB.EXPECT().ListIssues(1, 10).Return([]*models.Issue{}, nil)

	req, _ := http.NewRequest("GET", "/api/issues?page=1&pageSize=10", nil)
	req.Header.Set("Authorization", "Bearer staff_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestGetIssueAnalytics(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	mockDB.EXPECT().
		GetIssueAnalytics("", "").
		Return(map[string]interface{}{
			"total_issues": 50,
		}, nil)

	mockDB.EXPECT().
		GetAverageResolutionTime().
		Return(map[string]string{"POTHOLE": "2d 4h"}, nil) // Sample average resolution times

	mockDB.EXPECT().
		GetEngineerPerformance().
		Return(map[string]int{"engineer1": 10, "engineer2": 5}, nil) // Sample performance

	req, _ := http.NewRequest("GET", "/api/issues/analytics", nil)
	req.Header.Set("Authorization", "Bearer staff_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	assert.Equal(t, 50, int(response["total_issues"].(float64)))
	assert.Equal(t, "2d 4h", response["average_resolution_time"].(map[string]interface{})["POTHOLE"])
	assert.Equal(t, 10, int(response["engineer_performance"].(map[string]interface{})["engineer1"].(float64)))
}

func TestSearchIssues(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	mockDB.EXPECT().SearchIssues("POTHOLE", "NEW").Return([]*models.Issue{}, nil)

	req, _ := http.NewRequest("GET", "/api/issues/search?type=POTHOLE&status=NEW", nil)
	req.Header.Set("Authorization", "Bearer staff_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}
