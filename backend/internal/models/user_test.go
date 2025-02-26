package models

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUserJSON(t *testing.T) {
	user := User{
		ID:           1,
		Username:     "testuser",
		PasswordHash: "hashedpassword123",
		UserType:     "public",
	}

	data, err := json.Marshal(user)
	assert.NoError(t, err)

	expectedJSON := `{"id":1,"username":"testuser","user_type":"public"}`
	assert.JSONEq(t, expectedJSON, string(data))
}
