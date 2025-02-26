package utils

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestRespondWithError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	RespondWithError(c, http.StatusBadRequest, "Invalid request", nil)

	assert.Equal(t, http.StatusBadRequest, w.Code, "Status code should be 400")
	expectedResponse := `{"error":"Invalid request"}`
	assert.JSONEq(t, expectedResponse, w.Body.String(), "Response should match expected JSON")
}

func TestRespondWithErrorWithLogging(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	RespondWithError(c, http.StatusInternalServerError, "Server error", assert.AnError)

	assert.Equal(t, http.StatusInternalServerError, w.Code, "Status code should be 500")
	expectedResponse := `{"error":"Server error"}`
	assert.JSONEq(t, expectedResponse, w.Body.String(), "Response should match expected JSON")
}
