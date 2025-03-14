package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"chalkstone.council/internal/models"
	"github.com/stretchr/testify/assert"
)

func TestSearchIssuesComprehensive(t *testing.T) {
	router, mockDB, _ := setupTestRouter(t)

	// Mock data
	now := time.Now()
	mockIssues := []*models.Issue{
		{
			ID:          1,
			Type:        models.TypePothole,
			Status:      models.StatusNew,
			Description: "Large pothole on Main Street",
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			ID:          2,
			Type:        models.TypeStreetLight,
			Status:      models.StatusInProgress,
			Description: "Broken streetlight at Park Avenue",
			CreatedAt:   now,
			UpdatedAt:   now,
		},
	}

	// Test case 1: Successful search with both type and status filters
	t.Run("Success - Type and Status Filters", func(t *testing.T) {
		mockDB.EXPECT().SearchIssues(string(models.TypePothole), string(models.StatusNew)).Return([]*models.Issue{mockIssues[0]}, nil)

		req := createAuthenticatedRequest("GET", "/api/issues/search?type=POTHOLE&status=NEW", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []*models.Issue
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 1)
		assert.Equal(t, int64(1), response[0].ID)
		assert.Equal(t, models.TypePothole, response[0].Type)
		assert.Equal(t, models.StatusNew, response[0].Status)
	})

	// Test case 2: Successful search with only type filter
	t.Run("Success - Type Filter Only", func(t *testing.T) {
		mockDB.EXPECT().SearchIssues(string(models.TypeStreetLight), "").Return([]*models.Issue{mockIssues[1]}, nil)

		req := createAuthenticatedRequest("GET", "/api/issues/search?type=STREET_LIGHT", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []*models.Issue
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 1)
		assert.Equal(t, int64(2), response[0].ID)
		assert.Equal(t, models.TypeStreetLight, response[0].Type)
	})

	// Test case 3: Successful search with only status filter
	t.Run("Success - Status Filter Only", func(t *testing.T) {
		mockDB.EXPECT().SearchIssues("", string(models.StatusInProgress)).Return([]*models.Issue{mockIssues[1]}, nil)

		req := createAuthenticatedRequest("GET", "/api/issues/search?status=IN_PROGRESS", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []*models.Issue
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 1)
		assert.Equal(t, models.StatusInProgress, response[0].Status)
	})

	// Test case 4: Invalid issue type
	t.Run("Invalid Issue Type", func(t *testing.T) {
		req := createAuthenticatedRequest("GET", "/api/issues/search?type=invalid_type", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response, "error")
		assert.Equal(t, "Invalid issue type", response["error"])
	})

	// Test case 5: Invalid status
	t.Run("Invalid Status", func(t *testing.T) {
		req := createAuthenticatedRequest("GET", "/api/issues/search?status=invalid_status", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response, "error")
		assert.Equal(t, "Invalid status", response["error"])
	})

	// Test case 6: Database error
	t.Run("Database Error", func(t *testing.T) {
		mockDB.EXPECT().SearchIssues("POTHOLE", "").Return(nil, errors.New("database error"))

		req := createAuthenticatedRequest("GET", "/api/issues/search?type=POTHOLE", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response, "error")
		assert.Equal(t, "Failed to search issues", response["error"])
	})

	// Test case 7: No results found
	t.Run("No Results", func(t *testing.T) {
		mockDB.EXPECT().SearchIssues("POTHOLE", "RESOLVED").Return([]*models.Issue{}, nil)

		req := createAuthenticatedRequest("GET", "/api/issues/search?type=POTHOLE&status=RESOLVED", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []*models.Issue
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 0)
	})

	// Test case 8: Search with no parameters
	t.Run("No Parameters", func(t *testing.T) {
		mockDB.EXPECT().SearchIssues("", "").Return(mockIssues, nil)

		req := createAuthenticatedRequest("GET", "/api/issues/search", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []*models.Issue
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 2)
	})
}
