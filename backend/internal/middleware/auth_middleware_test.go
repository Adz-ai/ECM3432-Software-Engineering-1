package middleware

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

func TestAuthMiddleware_InvalidHeaderFormat(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(AuthMiddleware())

	req, _ := http.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "InvalidFormat token123") // Missing "Bearer " prefix
	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusUnauthorized, resp.Code)
	
	// Verify error message
	assert.Contains(t, resp.Body.String(), "Invalid authorization header format")
}

func TestAuthMiddleware_ExpiredToken(t *testing.T) {
	// Set JWT secret for testing
	originalSecret := os.Getenv("JWT_SECRET")
	err := os.Setenv("JWT_SECRET", "test-secret")
	if err != nil {
		t.Fatalf("Failed to set JWT_SECRET: %v", err)
	}
	defer func() {
		if originalSecret != "" {
			os.Setenv("JWT_SECRET", originalSecret)
		} else {
			os.Unsetenv("JWT_SECRET")
		}
	}()

	// Create expired token
	claims := UserClaims{
		UserID:   "user123",
		UserType: "public",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)), // Expired
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte("test-secret"))
	assert.NoError(t, err)

	// Set up router and middleware
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(AuthMiddleware())

	req, _ := http.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusUnauthorized, resp.Code)
	assert.Contains(t, resp.Body.String(), "Invalid token")
}

func TestAuthMiddleware_EmptyClaims(t *testing.T) {
	// Set JWT secret for testing
	originalSecret := os.Getenv("JWT_SECRET")
	err := os.Setenv("JWT_SECRET", "test-secret")
	if err != nil {
		t.Fatalf("Failed to set JWT_SECRET: %v", err)
	}
	defer func() {
		if originalSecret != "" {
			os.Setenv("JWT_SECRET", originalSecret)
		} else {
			os.Unsetenv("JWT_SECRET")
		}
	}()

	// Create token with empty UserID
	claims := UserClaims{
		UserID:   "", // Empty UserID
		UserType: "public",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte("test-secret"))
	assert.NoError(t, err)

	// Set up router and middleware
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(AuthMiddleware())

	req, _ := http.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusUnauthorized, resp.Code)
	assert.Contains(t, resp.Body.String(), "Invalid token")
}

func TestAuthMiddleware_EmptyUserType(t *testing.T) {
	// Set JWT secret for testing
	originalSecret := os.Getenv("JWT_SECRET")
	err := os.Setenv("JWT_SECRET", "test-secret")
	if err != nil {
		t.Fatalf("Failed to set JWT_SECRET: %v", err)
	}
	defer func() {
		if originalSecret != "" {
			os.Setenv("JWT_SECRET", originalSecret)
		} else {
			os.Unsetenv("JWT_SECRET")
		}
	}()

	// Create token with empty UserType
	claims := UserClaims{
		UserID:   "user123",
		UserType: "", // Empty UserType
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte("test-secret"))
	assert.NoError(t, err)

	// Set up router and middleware
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(AuthMiddleware())

	req, _ := http.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusUnauthorized, resp.Code)
	assert.Contains(t, resp.Body.String(), "Invalid token")
}
