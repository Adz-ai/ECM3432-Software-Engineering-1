package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"chalkstone.council/internal/models"
	dbMock "chalkstone.council/internal/database/mocks"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
)

func TestListEngineersComprehensive(t *testing.T) {
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	router := gin.Default()
	
	// Create a real Handler instance with our mock DB
	handler := NewHandler(mockDB)
	
	// Create a test group with middleware that sets userType for staff
	api := router.Group("/api")
	
	// Add middleware that simulates staff authentication
	addStaffAuth := func(c *gin.Context) {
		c.Set("userType", "staff")
		c.Next()
	}
	
	// Setup routes for testing - with and without auth
	engineersGroup := api.Group("/engineers")
	engineersGroup.GET("", addStaffAuth, handler.ListEngineers)
	engineersGroup.GET("/noauth", handler.ListEngineers) // Route without staff auth for testing

	// Test case 1: Successfully retrieve engineers
	t.Run("Success", func(t *testing.T) {
		// Mock engineer data
		mockEngineers := []*models.Engineer{
			{
				ID:        1,
				Name:      "John Doe",
				Email:     "john.doe@example.com",
				Phone:     "123-456-7890",
				Specialization: "Potholes",
			},
			{
				ID:        2,
				Name:      "Jane Smith",
				Email:     "jane.smith@example.com",
				Phone:     "987-654-3210",
				Specialization: "Street Lights",
			},
		}
		
		// Set up mock expectation
		mockDB.EXPECT().ListEngineers().Return(mockEngineers, nil)
		
		// Create request
		req, _ := http.NewRequest("GET", "/api/engineers", nil)
		w := httptest.NewRecorder()
		
		router.ServeHTTP(w, req)
		
		// Verify response
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response []*models.Engineer
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 2)
		assert.Equal(t, int64(1), response[0].ID)
		assert.Equal(t, "John Doe", response[0].Name)
		assert.Equal(t, int64(2), response[1].ID)
		assert.Equal(t, "Jane Smith", response[1].Name)
	})
	
	// Test case 2: Empty list of engineers
	t.Run("Empty List", func(t *testing.T) {
		// Set up mock expectation for empty list
		mockDB.EXPECT().ListEngineers().Return([]*models.Engineer{}, nil)
		
		// Create request
		req, _ := http.NewRequest("GET", "/api/engineers", nil)
		w := httptest.NewRecorder()
		
		router.ServeHTTP(w, req)
		
		// Verify response
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response []*models.Engineer
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 0)
	})
	
	// Test case 3: Database error
	t.Run("Database Error", func(t *testing.T) {
		// Set up mock expectation for database error
		mockDB.EXPECT().ListEngineers().Return(nil, errors.New("database error"))
		
		// Create request
		req, _ := http.NewRequest("GET", "/api/engineers", nil)
		w := httptest.NewRecorder()
		
		router.ServeHTTP(w, req)
		
		// Verify response
		assert.Equal(t, http.StatusInternalServerError, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Failed to retrieve engineers", response["error"])
	})
	
	// Test case 4: Unauthorized access (non-staff user)
	t.Run("Unauthorized", func(t *testing.T) {
		// Create request to the non-authenticated route
		req, _ := http.NewRequest("GET", "/api/engineers/noauth", nil)
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
