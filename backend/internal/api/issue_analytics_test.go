package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	dbMock "chalkstone.council/internal/database/mocks"
	"chalkstone.council/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
)

func TestGetIssueAnalyticsWithDateRange(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	// Mock data for analytics with date range
	mockAnalytics := map[string]interface{}{
		"total_issues": 30,
		"issues_by_type": map[string]int{
			"POTHOLE":     12,
			"STREETLIGHT": 10,
			"GRAFFITI":    8,
		},
		"issues_by_status": map[string]int{
			"NEW":         5,
			"IN_PROGRESS": 15,
			"RESOLVED":    10,
		},
	}

	// Mock resolutions and performance
	mockResolutionTimes := map[string]string{
		"POTHOLE":     "1d 18h",
		"STREETLIGHT": "1d 2h",
		"GRAFFITI":    "3d 4h",
	}

	engPerf := []*models.EngineerPerformance{
		{
			Engineer: &models.Engineer{
				ID:   1,
				Name: "engineer1",
			},
			IssuesAssigned:    10,
			IssuesResolved:    8,
			AvgResolutionTime: "1d 20h",
		},
	}

	// Set expectations with specific date range
	startDate := "2024-01-01"
	endDate := "2024-03-14"
	
	mockDB.EXPECT().
		GetIssueAnalytics(startDate, endDate).
		Return(mockAnalytics, nil)

	mockDB.EXPECT().
		GetAverageResolutionTime().
		Return(mockResolutionTimes, nil)

	mockDB.EXPECT().
		GetEngineerPerformance().
		Return(engPerf, nil)

	// Make request with date parameters
	req, _ := http.NewRequest("GET", "/api/issues/analytics?startDate="+startDate+"&endDate="+endDate, nil)
	req.Header.Set("Authorization", "Bearer staff_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assert success response
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)

	// Verify the response contains the analytics data with the filtered date range
	assert.Equal(t, float64(30), response["total_issues"])
	
	// Check resolution times
	resolutionTime, ok := response["average_resolution_time"].(map[string]interface{})
	assert.True(t, ok)
	assert.Equal(t, "1d 18h", resolutionTime["POTHOLE"])
}

func TestGetIssueAnalyticsNonStaffAccess(t *testing.T) {
	// Setup a router without staff authorization
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	
	// Create Handler with mock DB
	handler := &Handler{db: mockDB}
	
	// Set up routes with regular authentication, but not staff
	api := router.Group("/api")
	api.Use(func(c *gin.Context) {
		// Set userID but not userType (non-staff)
		c.Set("userID", "user1")
		c.Set("userType", "citizen") // Not "staff"
		c.Next()
	})
	api.GET("/issues/analytics", handler.GetIssueAnalytics)
	
	// No expectations on mockDB since the request should fail due to authorization
	
	req, _ := http.NewRequest("GET", "/api/issues/analytics", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert forbidden response
	assert.Equal(t, http.StatusForbidden, w.Code)
	
	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "Staff access required", response["error"])
}

func TestGetIssueAnalyticsAnalyticsError(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	// Mock database error for GetIssueAnalytics
	mockDB.EXPECT().GetIssueAnalytics("", "").Return(nil, errors.New("database error"))

	req, _ := http.NewRequest("GET", "/api/issues/analytics", nil)
	req.Header.Set("Authorization", "Bearer staff_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assert error response
	assert.Equal(t, http.StatusInternalServerError, w.Code)

	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "Failed to retrieve analytics", response["error"])
}

func TestGetIssueAnalyticsResolutionTimeError(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	// First call succeeds
	mockDB.EXPECT().GetIssueAnalytics("", "").Return(map[string]interface{}{
		"total_issues": 10,
	}, nil)

	// Second call fails
	mockDB.EXPECT().GetAverageResolutionTime().Return(nil, errors.New("database error"))

	req, _ := http.NewRequest("GET", "/api/issues/analytics", nil)
	req.Header.Set("Authorization", "Bearer staff_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assert error response
	assert.Equal(t, http.StatusInternalServerError, w.Code)

	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "Failed to retrieve resolution time analytics", response["error"])
}

func TestGetIssueAnalyticsEngineerPerformanceError(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	// First two calls succeed
	mockDB.EXPECT().GetIssueAnalytics("", "").Return(map[string]interface{}{
		"total_issues": 10,
	}, nil)

	mockDB.EXPECT().GetAverageResolutionTime().Return(map[string]string{
		"POTHOLE": "2d 4h",
	}, nil)

	// Third call fails
	mockDB.EXPECT().GetEngineerPerformance().Return(nil, errors.New("database error"))

	req, _ := http.NewRequest("GET", "/api/issues/analytics", nil)
	req.Header.Set("Authorization", "Bearer staff_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assert error response
	assert.Equal(t, http.StatusInternalServerError, w.Code)

	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "Failed to retrieve engineer performance", response["error"])
}
