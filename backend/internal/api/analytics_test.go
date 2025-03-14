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

func TestEngineerPerformanceAnalytics(t *testing.T) {
	// Setup
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockDB := dbMock.NewMockDatabaseOperations(ctrl)

	// Create handler with mocked dependencies
	h := &Handler{db: mockDB}

	// Setup router with handler
	router := gin.Default()
	api := router.Group("/api")
	api.Use(func(c *gin.Context) {
		// Mock authentication middleware that sets userType to "staff"
		c.Set("userType", "staff")
		c.Next()
	})
	api.GET("/analytics/engineers", h.EngineerPerformance)

	// Test case 1: Successful retrieval
	t.Run("Success", func(t *testing.T) {
		// Mock data
		engr1 := &models.Engineer{
			ID:   1,
			Name: "John Doe",
		}
		
		engr2 := &models.Engineer{
			ID:   2,
			Name: "Jane Smith",
		}
		
		performanceData := []*models.EngineerPerformance{
			{
				Engineer:             engr1,
				IssuesResolved:       15,
				AvgResolutionTime:    "2.5 days",
				AvgResolutionSeconds: 216000, // 2.5 days in seconds
				IssuesAssigned:       5,
				TotalIssues:          20,
			},
			{
				Engineer:             engr2,
				IssuesResolved:       20,
				AvgResolutionTime:    "1.8 days",
				AvgResolutionSeconds: 155520, // 1.8 days in seconds
				IssuesAssigned:       3,
				TotalIssues:          23,
			},
		}

		// Set mock expectation - this should be called when the handler runs
		mockDB.EXPECT().GetEngineerPerformance().Return(performanceData, nil)

		// Create request
		req, _ := http.NewRequest("GET", "/api/analytics/engineers", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Verify response
		assert.Equal(t, http.StatusOK, w.Code)

		var response []*models.EngineerPerformance
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 2)
		assert.Equal(t, int64(1), response[0].Engineer.ID)
		assert.Equal(t, "John Doe", response[0].Engineer.Name)
		assert.Equal(t, 15, response[0].IssuesResolved)
		assert.Equal(t, "2.5 days", response[0].AvgResolutionTime)
	})

	// Test case 2: Database error
	t.Run("Database Error", func(t *testing.T) {
		mockDB.EXPECT().GetEngineerPerformance().Return(nil, errors.New("database error"))

		req, _ := http.NewRequest("GET", "/api/analytics/engineers", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response, "error")
		assert.Equal(t, "Failed to retrieve engineer performance", response["error"])
	})

	// Test case 3: No data found
	t.Run("No Data", func(t *testing.T) {
		mockDB.EXPECT().GetEngineerPerformance().Return([]*models.EngineerPerformance{}, nil)

		req, _ := http.NewRequest("GET", "/api/analytics/engineers", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []*models.EngineerPerformance
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 0)
	})

	// Test case 4: Access without authorization (non-staff)
	t.Run("Unauthorized Access", func(t *testing.T) {
		// Create a router without staff authorization
		unauthRouter := setupUnauthorizedRouter(t)
		
		req, _ := http.NewRequest("GET", "/api/analytics/engineers", nil)
		w := httptest.NewRecorder()
		unauthRouter.ServeHTTP(w, req)

		assert.Equal(t, http.StatusForbidden, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response, "error")
		assert.Equal(t, "Staff access required", response["error"])
	})
}
