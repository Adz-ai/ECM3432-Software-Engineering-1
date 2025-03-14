package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	dbMock "chalkstone.council/internal/database/mocks"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
)

func TestResolutionTimeHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	router := gin.Default()
	
	// Create a real Handler instance with our mock DB
	handler := NewHandler(mockDB)
	
	// Create a test group with middleware that sets userType
	api := router.Group("/api")
	
	// Add a middleware that simulates the StaffOnly middleware for some tests
	addStaffAuth := func(c *gin.Context) {
		c.Set("userType", "staff")
		c.Next()
	}
	
	// Setup routes for testing
	analyticsGroup := api.Group("/analytics")
	analyticsGroup.GET("/resolution-time", addStaffAuth, handler.ResolutionTime)
	
	// Add a route without staff authentication for testing unauthorized access
	analyticsGroup.GET("/resolution-time-no-auth", handler.ResolutionTime)

	// Test case 1: Successful retrieval
	t.Run("Success", func(t *testing.T) {
		// Prepare mock data
		mockResolutionTimes := map[string]string{
			"POTHOLE":       "2d 5h",
			"STREET_LIGHT":  "1d 12h",
			"GRAFFITI":      "8h 30m",
			"ANTI_SOCIAL":   "3d 0h",
			"FLY_TIPPING":   "2d 2h",
			"BLOCKED_DRAIN": "1d 8h",
		}
		
		// Set up mock expectation
		mockDB.EXPECT().GetAverageResolutionTime().Return(mockResolutionTimes, nil)
		
		// Create request
		req, _ := http.NewRequest("GET", "/api/analytics/resolution-time", nil)
		w := httptest.NewRecorder()
		
		router.ServeHTTP(w, req)
		
		// Verify response
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, 6, len(response))
		assert.Equal(t, "2d 5h", response["POTHOLE"])
		assert.Equal(t, "1d 12h", response["STREET_LIGHT"])
	})
	
	// Test case 2: Database error
	t.Run("Database Error", func(t *testing.T) {
		// Set up mock expectation
		mockDB.EXPECT().GetAverageResolutionTime().Return(nil, errors.New("database error"))
		
		// Create request
		req, _ := http.NewRequest("GET", "/api/analytics/resolution-time", nil)
		w := httptest.NewRecorder()
		
		router.ServeHTTP(w, req)
		
		// Verify response
		assert.Equal(t, http.StatusInternalServerError, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Failed to retrieve resolution time analytics", response["error"])
	})
	
	// Test case 3: Unauthorized access (non-staff)
	t.Run("Unauthorized Access", func(t *testing.T) {
		// Create request for the endpoint without staff auth
		req, _ := http.NewRequest("GET", "/api/analytics/resolution-time-no-auth", nil)
		w := httptest.NewRecorder()
		
		router.ServeHTTP(w, req)
		
		// Verify response
		assert.Equal(t, http.StatusForbidden, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Staff access required", response["error"])
	})
}
