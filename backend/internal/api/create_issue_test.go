package api

import (
	"bytes"
	"errors"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	dbMock "chalkstone.council/internal/database/mocks"
	"chalkstone.council/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
)

// Helper function to create a multipart form with test data and a file
func createTestMultipartForm(t *testing.T, includeFile bool) (*bytes.Buffer, string) {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	// Add form fields
	_ = writer.WriteField("type", "POTHOLE")
	_ = writer.WriteField("description", "Test pothole description")
	_ = writer.WriteField("latitude", "51.5074")
	_ = writer.WriteField("longitude", "-0.1278")

	// Add file if requested
	if includeFile {
		fileWriter, err := writer.CreateFormFile("images", "test_image.jpg")
		if err != nil {
			t.Fatalf("Failed to create form file: %v", err)
		}
		_, err = fileWriter.Write([]byte("mock image content"))
		if err != nil {
			t.Fatalf("Failed to write to form file: %v", err)
		}
	}

	writer.Close()
	return &body, writer.FormDataContentType()
}

// setupTestEnv sets environment variables for testing
func setupTestEnv() func() {
	// Save original values
	origMinioEndpoint := os.Getenv("MINIO_ENDPOINT")
	origMinioAccessKey := os.Getenv("MINIO_ACCESS_KEY")
	origMinioSecretKey := os.Getenv("MINIO_SECRET_KEY")
	origMinioBucket := os.Getenv("MINIO_BUCKET")
	
	// Set test values
	os.Setenv("MINIO_ENDPOINT", "localhost:9000")
	os.Setenv("MINIO_ACCESS_KEY", "test_access_key")
	os.Setenv("MINIO_SECRET_KEY", "test_secret_key")
	os.Setenv("MINIO_BUCKET", "test-bucket")
	
	// Return cleanup function
	return func() {
		os.Setenv("MINIO_ENDPOINT", origMinioEndpoint)
		os.Setenv("MINIO_ACCESS_KEY", origMinioAccessKey)
		os.Setenv("MINIO_SECRET_KEY", origMinioSecretKey)
		os.Setenv("MINIO_BUCKET", origMinioBucket)
	}
}

func TestCreateIssueParseMultipartFormError(t *testing.T) {
	// Setup test environment
	cleanup := setupTestEnv()
	defer cleanup()
	
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	
	// Create Handler with mock DB
	handler := &Handler{db: mockDB}
	
	// Set up routes with authentication middleware
	api := router.Group("/api")
	api.Use(func(c *gin.Context) {
		c.Set("userID", "test_user")
		c.Next()
	})
	api.POST("/issues", handler.CreateIssue)
	
	// Create a request with an invalid multipart form
	// We'll use a raw string that's not a valid multipart form
	invalidForm := bytes.NewBufferString("not a valid multipart form")
	req, _ := http.NewRequest("POST", "/api/issues", invalidForm)
	req.Header.Set("Content-Type", "multipart/form-data; boundary=invalidboundary")
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Verify the response - should be a bad request error
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestCreateIssueMissingRequiredFields(t *testing.T) {
	// Setup test environment
	cleanup := setupTestEnv()
	defer cleanup()
	
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	
	// Create Handler with mock DB
	handler := &Handler{db: mockDB}
	
	// Set up routes with authentication middleware
	api := router.Group("/api")
	api.Use(func(c *gin.Context) {
		c.Set("userID", "test_user")
		c.Next()
	})
	api.POST("/issues", handler.CreateIssue)
	
	// Test different missing fields
	testCases := []struct {
		name       string
		formFields map[string]string
	}{
		{
			name: "Missing type",
			formFields: map[string]string{
				"description": "Test description",
				"latitude":    "51.5074",
				"longitude":   "-0.1278",
			},
		},
		{
			name: "Missing description",
			formFields: map[string]string{
				"type":      "POTHOLE",
				"latitude":  "51.5074",
				"longitude": "-0.1278",
			},
		},
		{
			name: "Missing latitude",
			formFields: map[string]string{
				"type":        "POTHOLE",
				"description": "Test description",
				"longitude":   "-0.1278",
			},
		},
		{
			name: "Missing longitude",
			formFields: map[string]string{
				"type":        "POTHOLE",
				"description": "Test description",
				"latitude":    "51.5074",
			},
		},
	}
	
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			var body bytes.Buffer
			writer := multipart.NewWriter(&body)
			
			// Add form fields from test case
			for key, value := range tc.formFields {
				_ = writer.WriteField(key, value)
			}
			
			writer.Close()
			
			req, _ := http.NewRequest("POST", "/api/issues", &body)
			req.Header.Set("Content-Type", writer.FormDataContentType())
			
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)
			
			// Verify the response - should be a bad request error
			assert.Equal(t, http.StatusBadRequest, w.Code)
		})
	}
}

func TestCreateIssueWithInvalidIssueType(t *testing.T) {
	// Setup test environment
	cleanup := setupTestEnv()
	defer cleanup()
	
	// Setup multipart form with invalid issue type
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	
	// Add form fields with invalid issue type
	_ = writer.WriteField("type", "INVALID_TYPE")
	_ = writer.WriteField("description", "Test pothole description")
	_ = writer.WriteField("latitude", "51.5074")
	_ = writer.WriteField("longitude", "-0.1278")
	writer.Close()
	
	// Setup test router and handler
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	
	// Create Handler with mock DB
	handler := &Handler{db: mockDB}
	
	// Set up routes with authentication middleware
	api := router.Group("/api")
	api.Use(func(c *gin.Context) {
		c.Set("userID", "test_user")
		c.Next()
	})
	api.POST("/issues", handler.CreateIssue)
	
	// Make the request
	req, _ := http.NewRequest("POST", "/api/issues", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Verify the response - should be a bad request error
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestCreateIssueDBError(t *testing.T) {
	// Setup test environment
	cleanup := setupTestEnv()
	defer cleanup()
	
	// Set up test router and database mock
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	
	// Set up DB mock to return an error
	mockDB.EXPECT().
		CreateIssue(gomock.Any()).
		Return(int64(0), errors.New("database error"))
	
	// Create Handler with mock DB
	handler := &Handler{db: mockDB}
	
	// Set up routes with authentication middleware
	api := router.Group("/api")
	api.Use(func(c *gin.Context) {
		c.Set("userID", "test_user")
		c.Next()
	})
	api.POST("/issues", handler.CreateIssue)
	
	// Create a basic form without images to bypass storage issues
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	
	// Add form fields
	_ = writer.WriteField("type", "POTHOLE")
	_ = writer.WriteField("description", "Test pothole description")
	_ = writer.WriteField("latitude", "51.5074")
	_ = writer.WriteField("longitude", "-0.1278")
	writer.Close()
	
	// Make the request
	req, _ := http.NewRequest("POST", "/api/issues", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Verify the response
	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestCreateIssueSuccess(t *testing.T) {
	// Setup test environment
	cleanup := setupTestEnv()
	defer cleanup()
	
	// Setup test router and database mock
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	
	// Expect a call to create the issue with the correct data
	mockDB.EXPECT().
		CreateIssue(gomock.Any()).
		Do(func(issue *models.IssueCreate) {
			assert.Equal(t, models.IssueType("POTHOLE"), issue.Type)
			assert.Equal(t, "Test pothole description", issue.Description)
			assert.Equal(t, 51.5074, issue.Location.Latitude)
			assert.Equal(t, -0.1278, issue.Location.Longitude)
			assert.Equal(t, "test_user", issue.ReportedBy)
			// Note: we're not checking images here since we can't mock storage.UploadImage
		}).
		Return(int64(1), nil)
	
	// Create Handler with mock DB
	handler := &Handler{db: mockDB}
	
	// Set up routes with authentication middleware
	api := router.Group("/api")
	api.Use(func(c *gin.Context) {
		c.Set("userID", "test_user")
		c.Next()
	})
	api.POST("/issues", handler.CreateIssue)
	
	// Create a basic form without images since we can't easily mock the storage
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	
	// Add form fields
	_ = writer.WriteField("type", "POTHOLE")
	_ = writer.WriteField("description", "Test pothole description")
	_ = writer.WriteField("latitude", "51.5074")
	_ = writer.WriteField("longitude", "-0.1278")
	writer.Close()
	
	// Make the request
	req, _ := http.NewRequest("POST", "/api/issues", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Verify response
	assert.Equal(t, http.StatusCreated, w.Code)
}
