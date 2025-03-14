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

func TestListIssuesUnauthorized(t *testing.T) {
	// Create a router without setting up authentication middleware
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	
	// Create Handler with mock DB
	handler := &Handler{db: mockDB}
	
	// Set up routes without authentication middleware
	api := router.Group("/api")
	api.GET("/issues", handler.ListIssues)
	
	// No expectations set for mockDB because request should fail before DB is called
	
	// Make request without authentication
	req, _ := http.NewRequest("GET", "/api/issues", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert unauthorized response
	assert.Equal(t, http.StatusUnauthorized, w.Code)
	
	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "Unauthorized access", response["error"])
}

func TestListIssuesDatabaseError(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)
	
	// Expect ListIssues to be called but return an error
	mockDB.EXPECT().ListIssues(1, 10).Return(nil, errors.New("database error"))
	
	req, _ := http.NewRequest("GET", "/api/issues", nil)
	req.Header.Set("Authorization", "Bearer test_token")
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert error response
	assert.Equal(t, http.StatusInternalServerError, w.Code)
	
	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "Failed to list issues", response["error"])
}

func TestListIssuesCustomPagination(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)
	
	mockIssues := []*models.Issue{
		{
			ID:          1,
			Type:        "POTHOLE",
			Status:      "NEW",
			Description: "Test pothole",
			Location: struct {
				Latitude  float64 `json:"latitude" db:"latitude"`
				Longitude float64 `json:"longitude" db:"longitude"`
			}{Latitude: 51.5074, Longitude: -0.1278},
			ReportedBy: "test_user",
		},
	}
	
	// Test with custom page and page size
	mockDB.EXPECT().ListIssues(2, 5).Return(mockIssues, nil)
	
	req, _ := http.NewRequest("GET", "/api/issues?page=2&pageSize=5", nil)
	req.Header.Set("Authorization", "Bearer test_token")
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	assert.Equal(t, http.StatusOK, w.Code)
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	
	assert.Equal(t, float64(2), response["page"])
	assert.Equal(t, float64(5), response["pageSize"])
	
	issues, ok := response["issues"].([]interface{})
	assert.True(t, ok, "Issues should be an array")
	assert.Equal(t, 1, len(issues))
}

func TestListIssuesInvalidPagination(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)
	
	mockIssues := []*models.Issue{
		{
			ID:          1,
			Type:        "POTHOLE",
			Status:      "NEW",
			Description: "Test pothole",
			Location: struct {
				Latitude  float64 `json:"latitude" db:"latitude"`
				Longitude float64 `json:"longitude" db:"longitude"`
			}{Latitude: 51.5074, Longitude: -0.1278},
			ReportedBy: "test_user",
		},
	}
	
	// Test with invalid page and page size (should use defaults)
	mockDB.EXPECT().ListIssues(1, 10).Return(mockIssues, nil)
	
	req, _ := http.NewRequest("GET", "/api/issues?page=-1&pageSize=200", nil)
	req.Header.Set("Authorization", "Bearer test_token")
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	assert.Equal(t, http.StatusOK, w.Code)
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	
	// Should use default values when invalid
	assert.Equal(t, float64(1), response["page"])
	assert.Equal(t, float64(10), response["pageSize"])
}

func TestListIssuesEmptyResult(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)
	
	// Return empty list
	mockDB.EXPECT().ListIssues(1, 10).Return([]*models.Issue{}, nil)
	
	req, _ := http.NewRequest("GET", "/api/issues", nil)
	req.Header.Set("Authorization", "Bearer test_token")
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	assert.Equal(t, http.StatusOK, w.Code)
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	
	issues, ok := response["issues"].([]interface{})
	assert.True(t, ok, "Issues should be an array")
	assert.Equal(t, 0, len(issues))
}
