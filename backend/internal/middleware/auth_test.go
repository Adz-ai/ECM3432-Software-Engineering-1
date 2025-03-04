package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestGenerateToken(t *testing.T) {
	err := os.Setenv("JWT_SECRET", "test-secret")
	if err != nil {
		t.Fatalf("Failed to set JWT_SECRET: %v", err)
	}

	token, err := GenerateToken("user123", "public")

	assert.NoError(t, err)
	assert.NotEmpty(t, token)
}

func TestAuthMiddleware_MissingToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(AuthMiddleware())

	req, _ := http.NewRequest("GET", "/", nil)
	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusUnauthorized, resp.Code)
}

func TestAuthMiddleware_InvalidToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(AuthMiddleware())

	req, _ := http.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer invalidtoken")
	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusUnauthorized, resp.Code)
}

func TestAuthMiddleware_ValidToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	err := os.Setenv("JWT_SECRET", "test-secret")
	if err != nil {
		return
	}

	token, _ := GenerateToken("user123", "public")

	router := gin.New()
	router.Use(AuthMiddleware())
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Success"})
	})

	req, _ := http.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)
}

func TestStaffOnly_NonStaffUser(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("userType", "public") // Simulate public user
	}, StaffOnly())

	req, _ := http.NewRequest("GET", "/", nil)
	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusForbidden, resp.Code)
}

func TestStaffOnly_StaffUser(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("userType", "staff") // Simulate staff user
	}, StaffOnly())

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Allowed"})
	})

	req, _ := http.NewRequest("GET", "/", nil)
	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)
}
