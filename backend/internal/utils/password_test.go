package utils

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHashPassword(t *testing.T) {
	password := "securepassword"

	hashedPassword1, err := HashPassword(password)
	assert.NoError(t, err, "Hashing password should not return an error")
	assert.NotEmpty(t, hashedPassword1, "Hashed password should not be empty")

	hashedPassword2, _ := HashPassword(password)
	assert.NotEqual(t, hashedPassword1, hashedPassword2, "Hashes should be unique even for the same password")
}

func TestCheckPasswordHash(t *testing.T) {
	password := "securepassword"

	hashedPassword, _ := HashPassword(password)

	assert.True(t, CheckPasswordHash(password, hashedPassword), "Valid password should match hash")

	assert.False(t, CheckPasswordHash("wrongpassword", hashedPassword), "Incorrect password should not match hash")
}
