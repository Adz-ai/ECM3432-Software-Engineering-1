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

func TestGetEngineerComprehensive(t *testing.T) {
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
	engineersGroup.GET("/:id", addStaffAuth, handler.GetEngineer)
	engineersGroup.GET("/noauth/:id", handler.GetEngineer) // Route without staff auth for testing

	// Test case 1: Successfully retrieve an engineer
	t.Run("Success", func(t *testing.T) {
		// Mock engineer data
		mockEngineer := &models.Engineer{
			ID:        1,
			Name:      "John Doe",
			Email:     "john.doe@example.com",
			Phone:     "123-456-7890",
			Specialization: "Potholes",
		}
		
		// Set up mock expectation
		mockDB.EXPECT().GetEngineerByID(int64(1)).Return(mockEngineer, nil)
		
		// Create request
		req, _ := http.NewRequest("GET", "/api/engineers/1", nil)
		w := httptest.NewRecorder()
		
		router.ServeHTTP(w, req)
		
		// Verify response
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response models.Engineer
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, int64(1), response.ID)
		assert.Equal(t, "John Doe", response.Name)
	})
	
	// Test case 2: Invalid engineer ID
	t.Run("Invalid ID", func(t *testing.T) {
		// Create request with invalid ID
		req, _ := http.NewRequest("GET", "/api/engineers/invalid", nil)
		w := httptest.NewRecorder()
		
		router.ServeHTTP(w, req)
		
		// Verify response
		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Invalid engineer ID", response["error"])
	})
	
	// Test case 3: Engineer not found
	t.Run("Not Found", func(t *testing.T) {
		// Set up mock expectation for non-existent engineer
		mockDB.EXPECT().GetEngineerByID(int64(999)).Return(nil, nil)
		
		// Create request
		req, _ := http.NewRequest("GET", "/api/engineers/999", nil)
		w := httptest.NewRecorder()
		
		router.ServeHTTP(w, req)
		
		// Verify response
		assert.Equal(t, http.StatusNotFound, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Engineer not found", response["error"])
	})
	
	// Test case 4: Database error
	t.Run("Database Error", func(t *testing.T) {
		// Set up mock expectation for database error
		mockDB.EXPECT().GetEngineerByID(int64(2)).Return(nil, errors.New("database error"))
		
		// Create request
		req, _ := http.NewRequest("GET", "/api/engineers/2", nil)
		w := httptest.NewRecorder()
		
		router.ServeHTTP(w, req)
		
		// Verify response
		assert.Equal(t, http.StatusInternalServerError, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Failed to retrieve engineer", response["error"])
	})
	
	// Test case 5: Unauthorized access (non-staff user)
	t.Run("Unauthorized", func(t *testing.T) {
		// Create request to the non-authenticated route
		req, _ := http.NewRequest("GET", "/api/engineers/noauth/1", nil)
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
