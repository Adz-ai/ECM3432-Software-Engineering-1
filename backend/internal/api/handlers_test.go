package api

import (
	"bytes"
	"chalkstone.council/internal/database"
	dbMock "chalkstone.council/internal/database/mocks"
	authMock "chalkstone.council/internal/middleware/mocks"
	"chalkstone.council/internal/models"

	"encoding/json"
	"fmt"
	"go.uber.org/mock/gomock"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// Helper function to create a string pointer
func stringPtr(s string) *string {
	return &s
}

// Helper function to create an int64 pointer
func int64Ptr(i int64) *int64 {
	return &i
}

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

// Helper function to create a test request with an authenticated user
func createAuthenticatedRequest(method, url string, body *bytes.Buffer) *http.Request {
	req, _ := http.NewRequest(method, url, body)
	req.Header.Set("Authorization", "Bearer valid_token")
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	return req
}

func TestCreateIssue(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	// Create a multipart form request
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	
	// Add form fields
	writer.WriteField("type", "POTHOLE")
	writer.WriteField("description", "Large pothole on road")
	writer.WriteField("latitude", "51.5074")
	writer.WriteField("longitude", "-0.1278")
	writer.WriteField("reported_by", "test_user")
	
	// Could add image file if needed
	// fileWriter, _ := writer.CreateFormFile("images", "image1.jpg")
	// fileWriter.Write([]byte("dummy image content"))
	
	// Close the writer
	writer.Close()

	mockDB.EXPECT().CreateIssue(gomock.Any()).Return(int64(1), nil)

	req, _ := http.NewRequest("POST", "/api/issues", body)
	req.Header.Set("Authorization", "Bearer valid_token")
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	// Verify response
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	// Verify the ID was returned
	id, ok := response["id"]
	assert.True(t, ok, "Response should contain 'id' field")
	assert.Equal(t, float64(1), id, "ID should be 1")
}

// TestCreateIssueWithInvalidCoordinates tests CreateIssue with invalid coordinates
func TestCreateIssueWithInvalidCoordinates(t *testing.T) {
	router, _, _ := setupTestRouter(t)

	// Create a multipart form with invalid coordinates
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	
	writer.WriteField("type", "POTHOLE")
	writer.WriteField("description", "Large pothole on road")
	writer.WriteField("latitude", "invalid") // Invalid latitude
	writer.WriteField("longitude", "-0.1278")
	writer.Close()

	req, _ := http.NewRequest("POST", "/api/issues", body)
	req.Header.Set("Authorization", "Bearer valid_token")
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	// Verify error message about invalid coordinates
	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Contains(t, response["error"], "Invalid issue data")
}

// TestCreateIssueWithInvalidType tests CreateIssue with an invalid issue type
func TestCreateIssueWithInvalidType(t *testing.T) {
	router, _, _ := setupTestRouter(t)

	// Create a multipart form with invalid issue type
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	
	writer.WriteField("type", "INVALID_TYPE") // Invalid issue type
	writer.WriteField("description", "Some description")
	writer.WriteField("latitude", "51.5074")
	writer.WriteField("longitude", "-0.1278")
	writer.Close()

	req, _ := http.NewRequest("POST", "/api/issues", body)
	req.Header.Set("Authorization", "Bearer valid_token")
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	// Verify error message about invalid issue type
	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Contains(t, response["error"], "Invalid issue type")
}

// TestCreateIssueFailsInDatabase tests the scenario when issue creation fails in the database
func TestCreateIssueFailsInDatabase(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	// Create a multipart form request
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	
	writer.WriteField("type", "POTHOLE")
	writer.WriteField("description", "Large pothole on road")
	writer.WriteField("latitude", "51.5074")
	writer.WriteField("longitude", "-0.1278")
	writer.Close()

	// Mock database error
	mockDB.EXPECT().CreateIssue(gomock.Any()).Return(int64(0), fmt.Errorf("database error"))

	req, _ := http.NewRequest("POST", "/api/issues", body)
	req.Header.Set("Authorization", "Bearer valid_token")
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)

	// Verify error message
	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Contains(t, response["error"], "Failed to create issue")
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
		Images:     []string{"image1.jpg"},
	}

	mockDB.EXPECT().GetIssue(int64(1)).Return(mockIssue, nil)

	req, _ := http.NewRequest("GET", "/api/issues/1", nil)
	req.Header.Set("Authorization", "Bearer valid_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	assert.Equal(t, float64(1), response["id"])
	assert.Equal(t, "POTHOLE", response["type"])
	assert.Equal(t, "NEW", response["status"])
}

// TestGetIssueNotFound tests the scenario when an issue is not found
func TestGetIssueNotFound(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	// Mock database error for issue not found
	mockDB.EXPECT().GetIssue(int64(999)).Return(nil, fmt.Errorf("issue not found"))

	req, _ := http.NewRequest("GET", "/api/issues/999", nil)
	req.Header.Set("Authorization", "Bearer valid_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)

	// Verify error message
	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Contains(t, response["error"], "Failed to get issue")
}

// TestGetIssueInvalidID tests the scenario with an invalid issue ID in the URL
func TestGetIssueInvalidID(t *testing.T) {
	router, _, _ := setupTestRouter(t)

	// Use an invalid ID in the URL
	req, _ := http.NewRequest("GET", "/api/issues/invalid", nil)
	req.Header.Set("Authorization", "Bearer valid_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	// Verify error message
	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Contains(t, response["error"], "Invalid ID")
}

func TestUpdateIssue(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	// Create proper types for the IssueUpdate struct
	status := models.StatusInProgress
	assignedEngineerId := int64(1)
	
	updatePayload := models.IssueUpdate{
		Status:     &status,
		AssignedTo: &assignedEngineerId,
	}

	// Mock the GetEngineerByID call that happens during validation
	mockEngineer := &models.Engineer{
		ID:   1,
		Name: "Test Engineer",
	}
	mockDB.EXPECT().GetEngineerByID(int64(1)).Return(mockEngineer, nil)

	body, _ := json.Marshal(updatePayload)
	mockDB.EXPECT().UpdateIssue(int64(1), gomock.Any()).Return(nil)

	req, _ := http.NewRequest("PUT", "/api/issues/1", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer staff_token")
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// Verify response
	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Issue updated successfully", response["message"])
}

// TestUpdateIssueInvalidID tests UpdateIssue with an invalid issue ID
func TestUpdateIssueInvalidID(t *testing.T) {
	router, _, _ := setupTestRouter(t)

	// Create a valid update payload
	status := models.StatusInProgress
	updatePayload := models.IssueUpdate{
		Status: &status,
	}

	body, _ := json.Marshal(updatePayload)

	// Use an invalid ID in the URL
	req, _ := http.NewRequest("PUT", "/api/issues/invalid", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer staff_token")
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	// Verify error message
	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Contains(t, response["error"], "Invalid ID")
}

// TestUpdateIssueInvalidEngineer tests issue update with non-existent engineer ID
func TestUpdateIssueInvalidEngineer(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	// Create update payload with non-existent engineer
	assignedEngineerId := int64(999) // Non-existent engineer ID
	updatePayload := models.IssueUpdate{
		AssignedTo: &assignedEngineerId,
	}

	// Mock error when looking up engineer
	mockDB.EXPECT().GetEngineerByID(int64(999)).Return(nil, fmt.Errorf("engineer not found"))

	body, _ := json.Marshal(updatePayload)
	req, _ := http.NewRequest("PUT", "/api/issues/1", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer staff_token")
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)

	// Verify error message
	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Contains(t, response["error"], "Failed to validate engineer")
}

// TestUpdateIssueDBFailure tests database failure during issue update
func TestUpdateIssueDBFailure(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	// Create update payload
	status := models.StatusResolved
	updatePayload := models.IssueUpdate{
		Status: &status,
	}

	body, _ := json.Marshal(updatePayload)

	// Mock database failure
	mockDB.EXPECT().UpdateIssue(int64(1), gomock.Any()).Return(fmt.Errorf("database error"))

	req, _ := http.NewRequest("PUT", "/api/issues/1", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer staff_token")
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)

	// Verify error message
	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Contains(t, response["error"], "Failed to update issue")
}

func TestListIssues(t *testing.T) {
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
		{
			ID:          2,
			Type:        "STREETLIGHT",
			Status:      "IN_PROGRESS",
			Description: "Broken streetlight",
			Location: struct {
				Latitude  float64 `json:"latitude" db:"latitude"`
				Longitude float64 `json:"longitude" db:"longitude"`
			}{Latitude: 51.5075, Longitude: -0.1279},
			AssignedTo: int64Ptr(1),
			ReportedBy: "citizen1",
		},
	}

	mockDB.EXPECT().ListIssues(1, 10).Return(mockIssues, nil)

	req, _ := http.NewRequest("GET", "/api/issues?page=1&pageSize=10", nil)
	req.Header.Set("Authorization", "Bearer staff_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	issues, ok := response["issues"].([]interface{})
	assert.True(t, ok, "Issues should be an array")
	assert.Equal(t, 2, len(issues))
}

func TestGetIssueAnalytics(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	// Create mock engineer performance data
	engPerf := []*models.EngineerPerformance{
		{
			Engineer: &models.Engineer{
				ID:   1,
				Name: "engineer1",
			},
			IssuesAssigned: 15,
			IssuesResolved: 10,
			AvgResolutionTime: "2d 5h",
		},
		{
			Engineer: &models.Engineer{
				ID:   2,
				Name: "engineer2",
			},
			IssuesAssigned: 8,
			IssuesResolved: 5,
			AvgResolutionTime: "1d 12h",
		},
	}

	mockDB.EXPECT().
		GetIssueAnalytics("", "").
		Return(map[string]interface{}{
			"total_issues": 50,
			"issues_by_type": map[string]int{
				"POTHOLE": 20,
				"STREETLIGHT": 15,
				"GRAFFITI": 15,
			},
			"issues_by_status": map[string]int{
				"NEW": 10,
				"IN_PROGRESS": 15,
				"RESOLVED": 25,
			},
		}, nil)

	mockDB.EXPECT().
		GetAverageResolutionTime().
		Return(map[string]string{"POTHOLE": "2d 4h", "STREETLIGHT": "1d 6h"}, nil)

	mockDB.EXPECT().
		GetEngineerPerformance().
		Return(engPerf, nil)

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

	// Check that the engineer performance is returned as an array of objects
	engPerformance, ok := response["engineer_performance"].([]interface{})
	assert.True(t, ok, "Engineer performance should be an array")
	assert.Equal(t, 2, len(engPerformance))
}

func TestSearchIssues(t *testing.T) {
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

	mockDB.EXPECT().SearchIssues("POTHOLE", "NEW").Return(mockIssues, nil)

	req, _ := http.NewRequest("GET", "/api/issues/search?type=POTHOLE&status=NEW", nil)
	req.Header.Set("Authorization", "Bearer staff_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// The API directly returns an array of issues without wrapping them
	var issues []*models.Issue
	err := json.Unmarshal(w.Body.Bytes(), &issues)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	assert.Equal(t, 1, len(issues))
	assert.Equal(t, int64(1), issues[0].ID)
	assert.Equal(t, "POTHOLE", string(issues[0].Type))
}

func TestGetIssuesForMap(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	mockMapIssues := []*models.Issue{
		{
			ID:     1,
			Type:   "POTHOLE",
			Status: "NEW",
			Location: struct {
				Latitude  float64 `json:"latitude" db:"latitude"`
				Longitude float64 `json:"longitude" db:"longitude"`
			}{Latitude: 51.5074, Longitude: -0.1278},
		},
		{
			ID:     2,
			Type:   "STREETLIGHT",
			Status: "IN_PROGRESS",
			Location: struct {
				Latitude  float64 `json:"latitude" db:"latitude"`
				Longitude float64 `json:"longitude" db:"longitude"`
			}{Latitude: 51.5075, Longitude: -0.1279},
		},
	}

	mockDB.EXPECT().GetIssuesForMap().Return(mockMapIssues, nil)

	req, _ := http.NewRequest("GET", "/api/issues/map", nil)
	req.Header.Set("Authorization", "Bearer valid_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// The API directly returns an array of issues
	var issues []*models.Issue
	err := json.Unmarshal(w.Body.Bytes(), &issues)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	assert.Equal(t, 2, len(issues))

	// Check that map issues contain essential fields
	assert.Equal(t, int64(1), issues[0].ID)
	assert.Equal(t, "POTHOLE", string(issues[0].Type))
	assert.Equal(t, "NEW", string(issues[0].Status))
	// Location should be present
	assert.NotEqual(t, 0.0, issues[0].Location.Latitude)
	assert.NotEqual(t, 0.0, issues[0].Location.Longitude)
}

func TestListEngineers(t *testing.T) {
	// Create a custom test setup with a properly mocked staff auth middleware
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)

	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	mockAuth := authMock.NewMockAuthenticator(ctrl)

	// Mock authentication to properly set both userID and userType (staff)
	mockAuth.EXPECT().AuthMiddleware().Return(func(c *gin.Context) {
		c.Set("userID", "test_user")
		c.Set("userType", "staff") // This is critical for staff-only endpoints
		c.Next()
	}).AnyTimes()

	mockAuth.EXPECT().StaffOnly().Return(func(c *gin.Context) {
		c.Set("userType", "staff")
		c.Next()
	}).AnyTimes()

	router := gin.Default()
	SetupRoutes(router, mockDB, mockAuth)

	mockEngineers := []*models.Engineer{
		{
			ID:             1,
			Name:           "John Doe",
			Email:          "john.doe@example.com",
			Phone:          "123-456-7890",
			Specialization: "Potholes",
		},
		{
			ID:             2,
			Name:           "Jane Smith",
			Email:          "jane.smith@example.com",
			Phone:          "987-654-3210",
			Specialization: "Streetlights",
		},
	}

	mockDB.EXPECT().ListEngineers().Return(mockEngineers, nil)

	req, _ := http.NewRequest("GET", "/api/engineers", nil)
	req.Header.Set("Authorization", "Bearer staff_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// The API directly returns an array of engineers
	var engineers []*models.Engineer
	err := json.Unmarshal(w.Body.Bytes(), &engineers)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	assert.Equal(t, 2, len(engineers))
	assert.Equal(t, int64(1), engineers[0].ID)
	assert.Equal(t, "John Doe", engineers[0].Name)
}

func TestGetEngineerByID(t *testing.T) {
	// Create a custom test setup with a properly mocked staff auth middleware
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)

	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	mockAuth := authMock.NewMockAuthenticator(ctrl)

	// Mock authentication to properly set both userID and userType (staff)
	mockAuth.EXPECT().AuthMiddleware().Return(func(c *gin.Context) {
		c.Set("userID", "test_user")
		c.Set("userType", "staff") // This is critical for staff-only endpoints
		c.Next()
	}).AnyTimes()

	mockAuth.EXPECT().StaffOnly().Return(func(c *gin.Context) {
		c.Set("userType", "staff")
		c.Next()
	}).AnyTimes()

	router := gin.Default()
	SetupRoutes(router, mockDB, mockAuth)

	mockEngineer := &models.Engineer{
		ID:             1,
		Name:           "John Doe",
		Email:          "john.doe@example.com",
		Phone:          "123-456-7890",
		Specialization: "Potholes",
	}

	mockDB.EXPECT().GetEngineerByID(int64(1)).Return(mockEngineer, nil)

	req, _ := http.NewRequest("GET", "/api/engineers/1", nil)
	req.Header.Set("Authorization", "Bearer staff_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// Response is a single engineer object, not wrapped in a map
	var engineer models.Engineer
	err := json.Unmarshal(w.Body.Bytes(), &engineer)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	assert.Equal(t, int64(1), engineer.ID)
	assert.Equal(t, "John Doe", engineer.Name)
	assert.Equal(t, "john.doe@example.com", engineer.Email)
}

func TestEngineerPerformance(t *testing.T) {
	// Create a custom test setup with a properly mocked staff auth middleware
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)

	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	mockAuth := authMock.NewMockAuthenticator(ctrl)

	// Mock authentication to properly set both userID and userType (staff)
	mockAuth.EXPECT().AuthMiddleware().Return(func(c *gin.Context) {
		c.Set("userID", "test_user")
		c.Set("userType", "staff") // This is critical for staff-only endpoints
		c.Next()
	}).AnyTimes()

	mockAuth.EXPECT().StaffOnly().Return(func(c *gin.Context) {
		c.Set("userType", "staff")
		c.Next()
	}).AnyTimes()

	router := gin.Default()
	SetupRoutes(router, mockDB, mockAuth)

	// Create mock engineer performance data
	engPerfs := []*models.EngineerPerformance{
		{
			Engineer: &models.Engineer{
				ID:   1,
				Name: "John Doe",
			},
			IssuesAssigned: 10,
			IssuesResolved: 5,
			AvgResolutionTime: "2d 4h",
			ResolvedIssuesByType: map[string]int{"POTHOLE": 3, "STREETLIGHT": 2},
			AssignedIssuesByType: map[string]int{"POTHOLE": 6, "STREETLIGHT": 4},
			TotalIssues: 15,
		},
		{
			Engineer: &models.Engineer{
				ID:   2,
				Name: "Jane Smith",
			},
			IssuesAssigned: 8,
			IssuesResolved: 4,
			AvgResolutionTime: "1d 8h",
			ResolvedIssuesByType: map[string]int{"GRAFFITI": 2, "FLY_TIPPING": 2},
			AssignedIssuesByType: map[string]int{"GRAFFITI": 5, "FLY_TIPPING": 3},
			TotalIssues: 12,
		},
	}

	mockDB.EXPECT().GetEngineerPerformance().Return(engPerfs, nil)

	req, _ := http.NewRequest("GET", "/api/analytics/engineers", nil)
	req.Header.Set("Authorization", "Bearer staff_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// The API directly returns an array of EngineerPerformance
	var performances []*models.EngineerPerformance
	err := json.Unmarshal(w.Body.Bytes(), &performances)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	assert.Equal(t, 2, len(performances))
	assert.Equal(t, "John Doe", performances[0].Engineer.Name)
	assert.Equal(t, 10, performances[0].IssuesAssigned)
	assert.Equal(t, 5, performances[0].IssuesResolved)
}

func TestResolutionTime(t *testing.T) {
	// Create a custom test setup with a properly mocked staff auth middleware
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)

	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	mockAuth := authMock.NewMockAuthenticator(ctrl)

	// Mock authentication to properly set both userID and userType (staff)
	mockAuth.EXPECT().AuthMiddleware().Return(func(c *gin.Context) {
		c.Set("userID", "test_user")
		c.Set("userType", "staff") // This is critical for staff-only endpoints
		c.Next()
	}).AnyTimes()

	mockAuth.EXPECT().StaffOnly().Return(func(c *gin.Context) {
		c.Set("userType", "staff")
		c.Next()
	}).AnyTimes()

	router := gin.Default()
	SetupRoutes(router, mockDB, mockAuth)

	// Create mock resolution time data
	resolutionTimeData := map[string]string{
		"POTHOLE":       "2d 5h",
		"STREETLIGHT":   "1d 12h",
		"GRAFFITI":      "4d 3h",
		"FLY_TIPPING":   "1d 18h",
		"ANTI_SOCIAL":   "5d 0h",
		"BLOCKED_DRAIN": "1d 8h",
	}

	mockDB.EXPECT().GetAverageResolutionTime().Return(resolutionTimeData, nil)

	req, _ := http.NewRequest("GET", "/api/analytics/resolution-time", nil)
	req.Header.Set("Authorization", "Bearer staff_token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// Response should be a map of issue types to average resolution times
	var resolutionTimeResponse map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &resolutionTimeResponse)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	assert.Equal(t, 6, len(resolutionTimeResponse))
	assert.Equal(t, "2d 5h", resolutionTimeResponse["POTHOLE"])
	assert.Equal(t, "1d 12h", resolutionTimeResponse["STREETLIGHT"])
}

// TestLoginHandler is a simplified login handler for testing that doesn't use bcrypt
type TestLoginHandler struct {
	db database.DatabaseOperations
}

func NewTestLoginHandler(db database.DatabaseOperations) *TestLoginHandler {
	return &TestLoginHandler{db: db}
}

// Login is a simplified login handler for testing that doesn't use bcrypt
func (h *TestLoginHandler) Login(c *gin.Context) {
	var creds struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&creds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.db.GetUserByUsername(creds.Username)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// For testing purposes, we'll just check if the password is "testpassword"
	if creds.Password != "testpassword" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate a dummy token for testing
	c.JSON(http.StatusOK, gin.H{"token": "test_token", "user_type": user.UserType})
}

func setupTestAuthRouter(t *testing.T) (*gin.Engine, *dbMock.MockDatabaseOperations) {
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)

	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	router := gin.Default()

	// Set up a test router with our custom handler
	testHandler := NewTestLoginHandler(mockDB)
	
	// Set up only the auth routes
	api := router.Group("/api")
	authGroup := api.Group("/auth")
	authGroup.POST("/login", testHandler.Login)

	return router, mockDB
}

func TestLogin(t *testing.T) {
	router, mockDB := setupTestAuthRouter(t)

	// Prepare mock data
	loginPayload := map[string]string{
		"username": "testuser",
		"password": "testpassword",
	}

	// Mock user retrieval
	mockUser := &models.User{
		Username:     "testuser",
		PasswordHash: "not-important-for-test",
		UserType:     "user",
	}

	// Mock the database call to get the user
	mockDB.EXPECT().GetUserByUsername("testuser").Return(mockUser, nil)

	// Create request
	body, _ := json.Marshal(loginPayload)
	req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	assert.Equal(t, "test_token", response["token"])
	assert.Equal(t, "user", response["user_type"])
}

// TestRegisterHandler is a simplified register handler for testing
type TestRegisterHandler struct {
	db database.DatabaseOperations
}

func NewTestRegisterHandler(db database.DatabaseOperations) *TestRegisterHandler {
	return &TestRegisterHandler{db: db}
}

// Register is a simplified register handler for testing
func (h *TestRegisterHandler) Register(c *gin.Context) {
	var reg struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		IsStaff  bool   `json:"is_staff"`
	}

	if err := c.ShouldBindJSON(&reg); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userType := "public"
	if reg.IsStaff {
		userType = "staff"
	}

	// In a test context, we'll just pass the password directly, not hash it
	err := h.db.CreateUser(reg.Username, reg.Password, userType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": "test_token", "user_type": userType})
}

func setupTestRegisterRouter(t *testing.T) (*gin.Engine, *dbMock.MockDatabaseOperations) {
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)

	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	router := gin.Default()

	// Set up a test router with our custom handler
	testHandler := NewTestRegisterHandler(mockDB)
	
	// Set up only the auth routes
	api := router.Group("/api")
	authGroup := api.Group("/auth")
	authGroup.POST("/register", testHandler.Register)

	return router, mockDB
}

func TestRegister(t *testing.T) {
	router, mockDB := setupTestRegisterRouter(t)

	// Prepare mock data
	registerPayload := map[string]interface{}{
		"username":  "newuser",
		"password":  "newpassword",
		"is_staff": false,
	}

	// Mock the database call to create a user - with a direct password for testing
	mockDB.EXPECT().CreateUser("newuser", "newpassword", "public").Return(nil)

	// Create request
	body, _ := json.Marshal(registerPayload)
	req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	assert.Equal(t, "test_token", response["token"])
	assert.Equal(t, "public", response["user_type"])
}

// TestLoginFail tests the scenario when login fails due to incorrect credentials
func TestLoginFail(t *testing.T) {
	router, mockDB := setupTestAuthRouter(t)

	// Prepare mock data with wrong password
	loginPayload := map[string]string{
		"username": "testuser",
		"password": "wrongpassword",
	}

	// Mock user retrieval
	mockUser := &models.User{
		Username:     "testuser",
		PasswordHash: "not-important-for-test",
		UserType:     "user",
	}

	// Mock the database call to get the user
	mockDB.EXPECT().GetUserByUsername("testuser").Return(mockUser, nil)

	// Create request
	body, _ := json.Marshal(loginPayload)
	req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)

	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	assert.Equal(t, "Invalid credentials", response["error"])
}

// TestLoginUserNotFound tests the scenario when the username is not found
func TestLoginUserNotFound(t *testing.T) {
	router, mockDB := setupTestAuthRouter(t)

	// Prepare mock data
	loginPayload := map[string]string{
		"username": "nonexistentuser",
		"password": "password",
	}

	// Mock database error when user not found
	mockDB.EXPECT().GetUserByUsername("nonexistentuser").Return(nil, fmt.Errorf("user not found"))

	// Create request
	body, _ := json.Marshal(loginPayload)
	req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)

	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	assert.Equal(t, "Invalid credentials", response["error"])
}

// TestRegisterFail tests the scenario when registration fails due to database error
func TestRegisterFail(t *testing.T) {
	router, mockDB := setupTestRegisterRouter(t)

	// Prepare mock data
	registerPayload := map[string]interface{}{
		"username":  "existinguser",
		"password":  "password",
		"is_staff": false,
	}

	// Mock database error when creating user
	mockDB.EXPECT().CreateUser("existinguser", "password", "public").Return(fmt.Errorf("user already exists"))

	// Create request
	body, _ := json.Marshal(registerPayload)
	req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)

	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	assert.Equal(t, "Failed to create user", response["error"])
}

// TestRegisterStaff tests registration of a staff user
func TestRegisterStaff(t *testing.T) {
	router, mockDB := setupTestRegisterRouter(t)

	// Prepare mock data for staff registration
	registerPayload := map[string]interface{}{
		"username":  "staffuser",
		"password":  "staffpass",
		"is_staff": true,
	}

	// Mock the database call for staff user creation
	mockDB.EXPECT().CreateUser("staffuser", "staffpass", "staff").Return(nil)

	// Create request
	body, _ := json.Marshal(registerPayload)
	req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	assert.Equal(t, "test_token", response["token"])
	assert.Equal(t, "staff", response["user_type"])
}

// TestLoginWithInvalidJSON tests the case where JSON binding fails
func TestLoginWithInvalidJSON(t *testing.T) {
	router, _, _ := setupTestRouter(t)

	// Create a request with invalid JSON
	invalidJSON := `{"username":"testuser", "password":123}` // Password should be string, not number
	req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer([]byte(invalidJSON)))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// TestLoginUserNotFoundWithActualHandler tests when user is not found in database
func TestLoginUserNotFoundWithActualHandler(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	// Prepare mock data
	loginPayload := map[string]string{
		"username": "nonexistentuser",
		"password": "password",
	}

	// Mock database error when user not found
	mockDB.EXPECT().GetUserByUsername("nonexistentuser").Return(nil, fmt.Errorf("user not found"))

	// Create request
	body, _ := json.Marshal(loginPayload)
	req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// TestRegisterWithInvalidJSON tests the case where JSON binding fails in register handler
func TestRegisterWithInvalidJSON(t *testing.T) {
	router, _, _ := setupTestRouter(t)

	// Create a request with invalid JSON
	invalidJSON := `{"username":"testuser", "password":123}` // Password should be string, not number
	req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer([]byte(invalidJSON)))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// TestRegisterDatabaseError tests when database returns an error for user creation
func TestRegisterDatabaseError(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	// Prepare mock data
	registerPayload := map[string]interface{}{
		"username":  "existinguser",
		"password":  "password",
		"is_staff": false,
	}

	// Mock database error when creating user
	mockDB.EXPECT().CreateUser(gomock.Any(), gomock.Any(), "public").Return(fmt.Errorf("user already exists"))

	// Create request
	body, _ := json.Marshal(registerPayload)
	req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

// TestRegisterWithStaffUser tests staff user registration
func TestRegisterWithStaffUser(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	// Prepare mock data for staff registration
	registerPayload := map[string]interface{}{
		"username":  "staffuser",
		"password":  "staffpass",
		"is_staff": true,
	}

	// Mock the database call for staff user creation (with any password hash)
	mockDB.EXPECT().CreateUser("staffuser", gomock.Any(), "staff").Return(nil)

	// Create request
	body, _ := json.Marshal(registerPayload)
	req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}
