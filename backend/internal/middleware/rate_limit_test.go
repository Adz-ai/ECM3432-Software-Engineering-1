package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestRateLimit(t *testing.T) {
	gin.SetMode(gin.TestMode)

	limiter := NewIPRateLimiter(1, 2)
	router := gin.New()
	router.Use(RateLimit(limiter))
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Allowed"})
	})

	for i := 0; i < 2; i++ {
		req, _ := http.NewRequest("GET", "/", nil)
		req.RemoteAddr = "127.0.0.1:1234"
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
	}

	req, _ := http.NewRequest("GET", "/", nil)
	req.RemoteAddr = "127.0.0.1:1234"
	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusTooManyRequests, resp.Code)

	time.Sleep(time.Second)

	req, _ = http.NewRequest("GET", "/", nil)
	req.RemoteAddr = "127.0.0.1:1234"
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)
}

func TestRateLimit_DifferentIPs(t *testing.T) {
	gin.SetMode(gin.TestMode)

	limiter := NewIPRateLimiter(1, 2)
	router := gin.New()
	router.Use(RateLimit(limiter))

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Allowed"})
	})

	req1, _ := http.NewRequest("GET", "/", nil)
	req1.RemoteAddr = "192.168.1.1:1234"
	resp1 := httptest.NewRecorder()
	router.ServeHTTP(resp1, req1)

	req2, _ := http.NewRequest("GET", "/", nil)
	req2.RemoteAddr = "192.168.1.2:5678"
	resp2 := httptest.NewRecorder()
	router.ServeHTTP(resp2, req2)

	assert.Equal(t, http.StatusOK, resp1.Code, "Request from IP 192.168.1.1 should be allowed")
	assert.Equal(t, http.StatusOK, resp2.Code, "Request from IP 192.168.1.2 should be allowed")
}
