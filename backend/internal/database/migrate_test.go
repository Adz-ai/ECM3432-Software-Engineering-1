package database

import (
	"database/sql"
	"os"
	"path/filepath"
	"testing"

	"chalkstone.council/internal/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestFindMigrationsFolder(t *testing.T) {
	// Create a temporary directory structure for testing
	tempDir, err := os.MkdirTemp("", "migrate-test")
	require.NoError(t, err, "Failed to create temp directory")
	defer os.RemoveAll(tempDir)

	// Create a migrations folder within the temp directory
	migrationsPath := filepath.Join(tempDir, "migrations")
	err = os.Mkdir(migrationsPath, 0755)
	require.NoError(t, err, "Failed to create migrations directory")

	// Save current working directory
	origWd, err := os.Getwd()
	require.NoError(t, err, "Failed to get current working directory")
	defer os.Chdir(origWd)

	// Change to the temp directory
	err = os.Chdir(tempDir)
	require.NoError(t, err, "Failed to change to temp directory")

	// Test finding the migrations folder
	foundPath, err := findMigrationsFolder()
	assert.NoError(t, err, "Should find migrations folder")
	
	// Resolve symlinks for both paths (important on macOS where /var is symlinked to /private/var)
	expectedPath, err := filepath.EvalSymlinks(migrationsPath)
	assert.NoError(t, err, "Failed to resolve symlinks in expected path")
	actualPath, err := filepath.EvalSymlinks(foundPath)
	assert.NoError(t, err, "Failed to resolve symlinks in found path")
	
	assert.Equal(t, expectedPath, actualPath, "Should find the correct migrations path")

	// Test when migrations folder doesn't exist
	// Create a subdirectory without migrations
	subDir := filepath.Join(tempDir, "subdir")
	err = os.Mkdir(subDir, 0755)
	require.NoError(t, err, "Failed to create subdirectory")

	// Change to the subdirectory
	err = os.Chdir(subDir)
	require.NoError(t, err, "Failed to change to subdirectory")

	// The function should still find the migrations folder in a parent directory
	foundPath, err = findMigrationsFolder()
	assert.NoError(t, err, "Should find migrations folder in parent directory")
	
	// Resolve symlinks for both paths (important on macOS where /var is symlinked to /private/var)
	expectedPath, err = filepath.EvalSymlinks(migrationsPath)
	assert.NoError(t, err, "Failed to resolve symlinks in expected path")
	actualPath, err = filepath.EvalSymlinks(foundPath)
	assert.NoError(t, err, "Failed to resolve symlinks in found path")
	
	assert.Equal(t, expectedPath, actualPath, "Should find the correct migrations path in parent")

	// Test when no migrations folder exists anywhere in the path
	// Remove the migrations directory
	err = os.RemoveAll(migrationsPath)
	require.NoError(t, err, "Failed to remove migrations directory")

	// Should now fail to find the migrations folder
	_, err = findMigrationsFolder()
	assert.Error(t, err, "Should fail to find migrations folder")
	assert.Contains(t, err.Error(), "migrations folder not found", "Error should indicate migrations folder not found")
}

// Mock implementation of DatabaseOperations for testing RunMigrations
type mockDB struct {
	*sql.DB
}

func (m *mockDB) CreateIssue(issue *models.IssueCreate) (int64, error) {
	return 0, nil
}

func (m *mockDB) GetIssue(id int64) (*models.Issue, error) {
	return nil, nil
}

func (m *mockDB) UpdateIssue(id int64, issue *models.IssueUpdate) error {
	return nil
}

func (m *mockDB) ListIssues(page, pageSize int) ([]*models.Issue, error) {
	return nil, nil
}

func (m *mockDB) SearchIssues(issueType, status string) ([]*models.Issue, error) {
	return nil, nil
}

func (m *mockDB) GetIssuesForMap() ([]*models.Issue, error) {
	return nil, nil
}

func (m *mockDB) CreateUser(username, passwordHash, userType string) error {
	return nil
}

func (m *mockDB) GetUserByUsername(username string) (*models.User, error) {
	return nil, nil
}

func (m *mockDB) GetAverageResolutionTime() (map[string]string, error) {
	return nil, nil
}

func (m *mockDB) ListEngineers() ([]*models.Engineer, error) {
	return nil, nil
}

func (m *mockDB) GetEngineerByID(id int64) (*models.Engineer, error) {
	return nil, nil
}

func (m *mockDB) GetEngineerPerformance() ([]*models.EngineerPerformance, error) {
	return nil, nil
}

func (m *mockDB) GetIssueAnalytics(startDate, endDate string) (map[string]interface{}, error) {
	return nil, nil
}

func TestRunMigrations(t *testing.T) {
	// Test with invalid database type
	mockDb := &mockDB{nil}
	err := RunMigrations(mockDb)
	assert.Error(t, err, "RunMigrations should fail with invalid DB type")
	assert.Contains(t, err.Error(), "invalid database type", "Error should indicate invalid DB type")

	// The rest of the function is difficult to test in isolation because it requires a real database
	// connection and migrations directory. Most of it is already covered by other integration tests.
}
