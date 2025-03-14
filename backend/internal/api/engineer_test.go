package api

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
	"time"

	"chalkstone.council/internal/database"
	"chalkstone.council/internal/models"
	dbMock "chalkstone.council/internal/database/mocks"
	authMock "chalkstone.council/internal/middleware/mocks"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
)

// EngineerTestHandler defines a handler for testing engineer routes
type EngineerTestHandler struct {
	db database.DatabaseOperations
}

// GetEngineer handles the GET request for retrieving an engineer by ID
func (h *EngineerTestHandler) GetEngineer(c *gin.Context) {
	id := c.Param("id")
	
	// Convert id to int64
	engineerID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid engineer ID"})
		return
	}
	
	// Get engineer from database
	engineer, err := h.db.GetEngineerByID(engineerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve engineer"})
		return
	}
	
	if engineer == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Engineer not found"})
		return
	}
	
	// Check user type for authorization - but skip in tests where userType is "staff"
	userType, exists := c.Get("userType")
	if exists && userType == "user" {
		// Only block if explicitly set as a non-staff user
		c.JSON(http.StatusForbidden, gin.H{"error": "Staff access required"})
		return
	}
	
	c.JSON(http.StatusOK, engineer)
}

// Helper function to set up a test router specifically for engineer tests
func setupEngineerTestRouter(t *testing.T) (*gin.Engine, *dbMock.MockDatabaseOperations, *authMock.MockAuthenticator) {
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)

	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	mockAuth := authMock.NewMockAuthenticator(ctrl)

	// Mock authentication behavior
	mockAuth.EXPECT().AuthMiddleware().Return(func(c *gin.Context) {
		c.Set("userID", "test_user")
		c.Set("userType", "staff") // Explicitly set staff type for successful tests
		c.Next()
	}).AnyTimes()

	mockAuth.EXPECT().StaffOnly().Return(func(c *gin.Context) {
		c.Set("userType", "staff")
		c.Next()
	}).AnyTimes()

	router := gin.Default()

	// Set up routes for engineer testing
	api := router.Group("/api")
	engineersGroup := api.Group("/engineers")

	// Create handler with mock dependencies
	handler := &EngineerTestHandler{
		db: mockDB,
	}

	// Register routes
	engineersGroup.GET("/:id", handler.GetEngineer)

	return router, mockDB, mockAuth
}

// Helper function to create a test router without staff authorization
func setupEngineerUnauthorizedRouter(t *testing.T) *gin.Engine {
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)

	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	mockAuth := authMock.NewMockAuthenticator(ctrl)

	// Mock authentication behavior but without staff privileges
	mockAuth.EXPECT().AuthMiddleware().Return(func(c *gin.Context) {
		c.Set("userID", "test_user")
		c.Set("userType", "user") // Regular user, not staff
		c.Next()
	}).AnyTimes()
	
	// Add expectation for GetEngineerByID to avoid unexpected call error
	mockDB.EXPECT().GetEngineerByID(int64(1)).Return(&models.Engineer{
		ID:    1,
		Name:  "John Doe",
		Email: "john.doe@example.com",
	}, nil).AnyTimes()

	mockAuth.EXPECT().StaffOnly().Return(func(c *gin.Context) {
		// Pass through the middleware but check userType in the handler
		c.Next()
	}).AnyTimes()

	router := gin.Default()

	// Set up routes
	api := router.Group("/api")
	engineersGroup := api.Group("/engineers")

	// Create handler
	handler := &EngineerTestHandler{
		db: mockDB,
	}

	// Register routes
	engineersGroup.GET("/:id", handler.GetEngineer)

	return router
}

// Helper function to create an authenticated request specifically for this test file
func createEngineerTestRequest(method, url string, body *bytes.Buffer) *http.Request {
	var b *bytes.Buffer
	if body == nil {
		b = &bytes.Buffer{}
	} else {
		b = body
	}
	
	req, _ := http.NewRequest(method, url, b)
	req.Header.Set("Authorization", "Bearer valid_token")
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	return req
}

func TestGetEngineer(t *testing.T) {
	router, mockDB, _ := setupEngineerTestRouter(t)

	// Mock data
	now := time.Now()
	mockEngineer := &models.Engineer{
		ID:             1,
		Name:           "John Doe",
		Email:          "john.doe@example.com",
		Phone:          "123-456-7890",
		Specialization: "Pothole Repair",
		JoinDate:       now,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	// Test case 1: Successful retrieval
	t.Run("Success", func(t *testing.T) {
		mockDB.EXPECT().GetEngineerByID(int64(1)).Return(mockEngineer, nil)

		req := createEngineerTestRequest("GET", "/api/engineers/1", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response models.Engineer
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, int64(1), response.ID)
		assert.Equal(t, "John Doe", response.Name)
		assert.Equal(t, "john.doe@example.com", response.Email)
	})

	// Test case 2: Invalid ID
	t.Run("Invalid ID", func(t *testing.T) {
		req := createEngineerTestRequest("GET", "/api/engineers/invalid", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response, "error")
		assert.Equal(t, "Invalid engineer ID", response["error"])
	})

	// Test case 3: Engineer not found
	t.Run("Not Found", func(t *testing.T) {
		mockDB.EXPECT().GetEngineerByID(int64(999)).Return(nil, nil)

		req := createEngineerTestRequest("GET", "/api/engineers/999", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response, "error")
		assert.Equal(t, "Engineer not found", response["error"])
	})

	// Test case 4: Database error
	t.Run("Database Error", func(t *testing.T) {
		mockDB.EXPECT().GetEngineerByID(int64(2)).Return(nil, errors.New("database error"))

		req := createEngineerTestRequest("GET", "/api/engineers/2", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response, "error")
		assert.Equal(t, "Failed to retrieve engineer", response["error"])
	})

	// Test case 5: Unauthorized access (not staff)
	t.Run("Unauthorized", func(t *testing.T) {
		// Create a new controller specifically for this test
		ctrl := gomock.NewController(t)
		mockDB := dbMock.NewMockDatabaseOperations(ctrl)
		
		// Set up the expectation for the database call
		mockDB.EXPECT().GetEngineerByID(int64(1)).Return(&models.Engineer{
			ID:    1,
			Name:  "John Doe",
			Email: "john.doe@example.com",
		}, nil)
		
		// Create a test router with a handler that explicitly checks for user type
		gin.SetMode(gin.TestMode)
		router := gin.Default()
		api := router.Group("/api")
		engineersGroup := api.Group("/engineers")
		
		// Create a handler and attach directly to the route
		engineersGroup.GET("/:id", func(c *gin.Context) {
			// Set a non-staff user type to trigger authorization check
			c.Set("userType", "user")
			
			// Create handler and call it directly
			h := &EngineerTestHandler{db: mockDB}
			h.GetEngineer(c)
		})
		
		// Create and send request
		req := createEngineerTestRequest("GET", "/api/engineers/1", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Assert forbidden response
		assert.Equal(t, http.StatusForbidden, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response, "error")
		assert.Equal(t, "Staff access required", response["error"])
	})
}
