package api

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	dbMock "chalkstone.council/internal/database/mocks"
	"chalkstone.council/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
)

func setupAuthTest() func() {
	// Save original JWT_SECRET
	origJwtSecret := os.Getenv("JWT_SECRET")
	
	// Set consistent test value
	const testSecret = "test_secret_key_for_testing"
	
	// Set environment variable
	os.Setenv("JWT_SECRET", testSecret)
	
	// Explicitly update the middleware's secret key directly for testing
	middleware.SetSecretKeyForTesting(testSecret)
	
	// Return cleanup function
	return func() {
		// Restore original environment variable
		os.Setenv("JWT_SECRET", origJwtSecret)
		// Restore original secret key in middleware
		middleware.SetSecretKeyForTesting(origJwtSecret)
	}
}

func TestRegisterInvalidJSON(t *testing.T) {
	// Setup test environment
	cleanup := setupAuthTest()
	defer cleanup()
	
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	handler := NewHandler(mockDB)
	
	// Set up routes
	api := router.Group("/api")
	api.POST("/register", handler.Register)
	
	// Create an invalid JSON payload
	invalidJSON := []byte(`{"username": "test_user", "password": "password123", is_staff: true}`)
	
	// Create request
	req, _ := http.NewRequest("POST", "/api/register", bytes.NewBuffer(invalidJSON))
	req.Header.Set("Content-Type", "application/json")
	
	// Test
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Verify - should fail with 400 Bad Request
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestRegisterMissingRequiredFields(t *testing.T) {
	// Setup test environment
	cleanup := setupAuthTest()
	defer cleanup()
	
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	handler := NewHandler(mockDB)
	
	// Set up routes
	api := router.Group("/api")
	api.POST("/register", handler.Register)
	
	// Test cases for missing required fields
	testCases := []struct {
		name string
		payload map[string]interface{}
	}{
		{
			name: "Missing Username",
			payload: map[string]interface{}{
				"password": "password123",
				"is_staff": false,
			},
		},
		{
			name: "Missing Password",
			payload: map[string]interface{}{
				"username": "test_user",
				"is_staff": false,
			},
		},
	}
	
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			body, _ := json.Marshal(tc.payload)
			
			req, _ := http.NewRequest("POST", "/api/register", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)
			
			// Verify - should fail with 400 Bad Request
			assert.Equal(t, http.StatusBadRequest, w.Code)
		})
	}
}

func TestRegisterCreateUserError(t *testing.T) {
	// Setup test environment
	cleanup := setupAuthTest()
	defer cleanup()
	
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	
	// Mock CreateUser to return an error
	mockDB.EXPECT().
		CreateUser(gomock.Any(), gomock.Any(), gomock.Any()).
		Return(errors.New("database error"))
	
	handler := NewHandler(mockDB)
	
	// Set up routes
	api := router.Group("/api")
	api.POST("/register", handler.Register)
	
	// Create a valid registration payload
	reg := map[string]interface{}{
		"username": "test_user",
		"password": "password123",
		"is_staff": false,
	}
	body, _ := json.Marshal(reg)
	
	// Create request
	req, _ := http.NewRequest("POST", "/api/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	
	// Test
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Verify - should fail with 500 Internal Server Error
	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestRegisterSuccess(t *testing.T) {
	// Setup test environment
	cleanup := setupAuthTest()
	defer cleanup()
	
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	
	// Expected arguments for CreateUser
	username := "test_user"
	userType := "public"
	
	// Mock the CreateUser call to succeed
	mockDB.EXPECT().
		CreateUser(username, gomock.Any(), userType).
		Return(nil)
	
	handler := NewHandler(mockDB)
	
	// Set up routes
	api := router.Group("/api")
	api.POST("/register", handler.Register)
	
	// Create a valid registration payload
	reg := map[string]interface{}{
		"username": username,
		"password": "password123",
		"is_staff": false,
	}
	body, _ := json.Marshal(reg)
	
	// Create request
	req, _ := http.NewRequest("POST", "/api/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	
	// Test
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Verify - should succeed with 200 OK
	assert.Equal(t, http.StatusOK, w.Code)
	
	// Verify response body contains token
	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Logf("JSON unmarshal error: %v", err)
	}
	assert.NoError(t, err)
	assert.Contains(t, response, "token")
	
	// Validate the token by parsing it
	tokenString := response["token"]

	// Parse the token
	claims := &middleware.UserClaims{}
	// Use the exact same secret that was set in setupAuthTest
	testSecret := "test_secret_key_for_testing"
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(testSecret), nil
	})

	if err != nil {
		t.Logf("Token validation error: %v", err)
	}
	assert.NoError(t, err)
	assert.True(t, token.Valid)
	assert.Equal(t, username, claims.UserID)
	assert.Equal(t, userType, claims.UserType)
}

func TestRegisterStaffUser(t *testing.T) {
	// Setup test environment
	cleanup := setupAuthTest()
	defer cleanup()
	
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	
	mockDB := dbMock.NewMockDatabaseOperations(ctrl)
	
	// Expected arguments for CreateUser
	username := "staffuser"
	userType := "staff"
	
	// Mock the CreateUser call to succeed
	mockDB.EXPECT().
		CreateUser(username, gomock.Any(), userType).
		Return(nil)
	
	handler := NewHandler(mockDB)
	
	// Set up routes
	api := router.Group("/api")
	api.POST("/register", handler.Register)
	
	// Create a valid registration payload for staff user
	reg := map[string]interface{}{
		"username": username,
		"password": "password123",
		"is_staff": true,
	}
	body, _ := json.Marshal(reg)
	
	// Create request
	req, _ := http.NewRequest("POST", "/api/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	
	// Test
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Verify - should succeed with 200 OK
	assert.Equal(t, http.StatusOK, w.Code)
	
	// Verify response body contains token
	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Logf("JSON unmarshal error: %v", err)
	}
	assert.NoError(t, err)
	assert.Contains(t, response, "token")
	
	// Validate the token by parsing it
	tokenString := response["token"]

	// Parse the token
	claims := &middleware.UserClaims{}
	// Use the exact same secret that was set in setupAuthTest
	testSecret := "test_secret_key_for_testing"
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(testSecret), nil
	})

	if err != nil {
		t.Logf("Token validation error: %v", err)
	}
	assert.NoError(t, err)
	assert.True(t, token.Valid)
	assert.Equal(t, username, claims.UserID)
	assert.Equal(t, userType, claims.UserType)
}
