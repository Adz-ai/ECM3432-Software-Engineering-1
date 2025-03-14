package database

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

// ClearTestData removes all data from test tables to ensure clean state
func ClearTestData(t *testing.T, db *DB) {
	// Clear all test data in reverse order of foreign key dependencies
	_, err := db.DB.Exec(`TRUNCATE issues CASCADE;`)
	assert.NoError(t, err, "Failed to clear test data")
	
	_, err = db.DB.Exec(`TRUNCATE engineers CASCADE;`)
	assert.NoError(t, err, "Failed to clear engineers data")
	
	// Reset sequences for clean IDs in each test
	_, err = db.DB.Exec(`ALTER SEQUENCE issues_id_seq RESTART WITH 1;`)
	assert.NoError(t, err, "Failed to reset issues sequence")
	
	_, err = db.DB.Exec(`ALTER SEQUENCE engineers_id_seq RESTART WITH 1;`)
	assert.NoError(t, err, "Failed to reset engineers sequence")
}
