package utils

import (
	"crypto/subtle"
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// SecureCompare performs a constant-time comparison of two strings to prevent timing attacks
// This is especially important when comparing secrets, passwords, or tokens
func SecureCompare(a, b string) bool {
	// Convert strings to byte slices
	bytesA := []byte(a)
	bytesB := []byte(b)
	
	// First check if the lengths are different (this is still safe as we're not exposing the actual comparison)
	if len(bytesA) != len(bytesB) {
		return false
	}
	
	// Use crypto/subtle's constant-time comparison
	// This returns 1 if equal, 0 if not equal, but in constant time regardless of where the difference occurs
	return subtle.ConstantTimeCompare(bytesA, bytesB) == 1
}
