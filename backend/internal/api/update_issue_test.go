package api

import (
	"bytes"
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

func TestUpdateIssueNonStaffAccess(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	handler := &Handler{
		db: mockDB,
	}
	
	// Set up routes with non-staff authentication middleware
	api := router.Group("/api")
	api.Use(func(c *gin.Context) {
		c.Set("userID", "test_user")
		c.Set("userType", "public") // Non-staff user
		c.Next()
	})
	api.PUT("/issues/:id", handler.UpdateIssue)
	
	// Create a sample update payload
	status := models.StatusInProgress
	update := models.IssueUpdate{
		Status: &status,
	}
	body, _ := json.Marshal(update)
	
	// Create request
	req, _ := http.NewRequest("PUT", "/api/issues/1", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	
	// Test
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Verify - should return forbidden for non-staff
	assert.Equal(t, http.StatusForbidden, w.Code)
}

func TestUpdateIssueWithInvalidID(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	handler := &Handler{
		db: mockDB,
	}
	
	// Set up routes with staff authentication middleware
	api := router.Group("/api")
	api.Use(func(c *gin.Context) {
		c.Set("userID", "test_staff")
		c.Set("userType", "staff") // Staff user
		c.Next()
	})
	api.PUT("/issues/:id", handler.UpdateIssue)
	
	// Create a sample update payload
	status := models.StatusInProgress
	update := models.IssueUpdate{
		Status: &status,
	}
	body, _ := json.Marshal(update)
	
	// Create request with non-numeric ID
	req, _ := http.NewRequest("PUT", "/api/issues/invalid", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	
	// Test
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Verify - should return bad request for invalid ID
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestUpdateIssueInvalidJSON(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	handler := &Handler{
		db: mockDB,
	}
	
	// Set up routes with staff authentication middleware
	api := router.Group("/api")
	api.Use(func(c *gin.Context) {
		c.Set("userID", "test_staff")
		c.Set("userType", "staff") // Staff user
		c.Next()
	})
	api.PUT("/issues/:id", handler.UpdateIssue)
	
	// Create an invalid JSON payload
	invalidJSON := []byte(`{"status": "in_progress"`)
	
	// Create request
	req, _ := http.NewRequest("PUT", "/api/issues/1", bytes.NewBuffer(invalidJSON))
	req.Header.Set("Content-Type", "application/json")
	
	// Test
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Verify - should return bad request for invalid JSON
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestUpdateIssueInvalidStatus(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	handler := &Handler{
		db: mockDB,
	}
	
	// Set up routes with staff authentication middleware
	api := router.Group("/api")
	api.Use(func(c *gin.Context) {
		c.Set("userID", "test_staff")
		c.Set("userType", "staff") // Staff user
		c.Next()
	})
	api.PUT("/issues/:id", handler.UpdateIssue)
	
	// Create a payload with invalid status
	invalidStatus := models.IssueStatus("INVALID_STATUS")
	update := models.IssueUpdate{
		Status: &invalidStatus,
	}
	body, _ := json.Marshal(update)
	
	// Create request
	req, _ := http.NewRequest("PUT", "/api/issues/1", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	
	// Test
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Verify - should return bad request for invalid status
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestUpdateIssueInvalidEngineerID(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	
	// Mock the GetEngineerByID call to return nil (indicating engineer doesn't exist)
	engineerID := int64(123)
	mockDB.EXPECT().
		GetEngineerByID(engineerID).
		Return(nil, nil)
	
	handler := &Handler{
		db: mockDB,
	}
	
	// Set up routes with staff authentication middleware
	api := router.Group("/api")
	api.Use(func(c *gin.Context) {
		c.Set("userID", "test_staff")
		c.Set("userType", "staff") // Staff user
		c.Next()
	})
	api.PUT("/issues/:id", handler.UpdateIssue)
	
	// Create a payload with invalid engineer ID
	update := models.IssueUpdate{
		AssignedTo: &engineerID,
	}
	body, _ := json.Marshal(update)
	
	// Create request
	req, _ := http.NewRequest("PUT", "/api/issues/1", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	
	// Test
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Verify - should return bad request for invalid engineer ID
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestUpdateIssueEngineerLookupError(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	
	// Mock the GetEngineerByID call to return an error
	engineerID := int64(123)
	mockDB.EXPECT().
		GetEngineerByID(engineerID).
		Return(nil, errors.New("database error"))
	
	handler := &Handler{
		db: mockDB,
	}
	
	// Set up routes with staff authentication middleware
	api := router.Group("/api")
	api.Use(func(c *gin.Context) {
		c.Set("userID", "test_staff")
		c.Set("userType", "staff") // Staff user
		c.Next()
	})
	api.PUT("/issues/:id", handler.UpdateIssue)
	
	// Create a payload with engineer ID
	update := models.IssueUpdate{
		AssignedTo: &engineerID,
	}
	body, _ := json.Marshal(update)
	
	// Create request
	req, _ := http.NewRequest("PUT", "/api/issues/1", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	
	// Test
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Verify - should return internal server error for database error
	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestUpdateIssueDBUpdateError(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	
	// Mock the UpdateIssue call to return an error
	mockDB.EXPECT().
		UpdateIssue(gomock.Any(), gomock.Any()).
		Return(errors.New("database error"))
	
	handler := &Handler{
		db: mockDB,
	}
	
	// Set up routes with staff authentication middleware
	api := router.Group("/api")
	api.Use(func(c *gin.Context) {
		c.Set("userID", "test_staff")
		c.Set("userType", "staff") // Staff user
		c.Next()
	})
	api.PUT("/issues/:id", handler.UpdateIssue)
	
	// Create a valid update payload
	status := models.StatusInProgress
	update := models.IssueUpdate{
		Status: &status,
	}
	body, _ := json.Marshal(update)
	
	// Create request
	req, _ := http.NewRequest("PUT", "/api/issues/1", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	
	// Test
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Verify - should return internal server error for database error
	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestUpdateIssueSuccess(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	
	// Valid engineer for test
	engineerID := int64(123)
	engineer := &models.Engineer{
		ID:             engineerID,
		Name:           "Test Engineer",
		Specialization: "Pothole Repair",
	}
	
	// Mock the GetEngineerByID call to return the valid engineer
	mockDB.EXPECT().
		GetEngineerByID(engineerID).
		Return(engineer, nil)
	
	// Mock the UpdateIssue call to succeed
	mockDB.EXPECT().
		UpdateIssue(int64(1), gomock.Any()).
		DoAndReturn(func(id int64, update *models.IssueUpdate) error {
			// Validate update has expected values
			assert.Equal(t, models.StatusInProgress, *update.Status)
			assert.Equal(t, engineerID, *update.AssignedTo)
			return nil
		})
	
	handler := &Handler{
		db: mockDB,
	}
	
	// Set up routes with staff authentication middleware
	api := router.Group("/api")
	api.Use(func(c *gin.Context) {
		c.Set("userID", "test_staff")
		c.Set("userType", "staff") // Staff user
		c.Next()
	})
	api.PUT("/issues/:id", handler.UpdateIssue)
	
	// Create a complete update payload
	status := models.StatusInProgress
	update := models.IssueUpdate{
		Status:     &status,
		AssignedTo: &engineerID,
	}
	body, _ := json.Marshal(update)
	
	// Create request
	req, _ := http.NewRequest("PUT", "/api/issues/1", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	
	// Test
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Verify - should succeed with 200 OK
	assert.Equal(t, http.StatusOK, w.Code)
	
	// Verify response body contains success message
	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response, "message")
	assert.Equal(t, "Issue updated successfully", response["message"])
}
