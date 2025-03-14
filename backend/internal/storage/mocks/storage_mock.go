package mocks

import (
	"mime/multipart"
)

// Mock functions for storage package
var MockUploadImage func(file multipart.File, fileName string) (string, error)

// Original function references for restore
var OriginalUploadImage func(file multipart.File, fileName string) (string, error)

// SetupMocks saves original functions and replaces them with mocks
func SetupMocks() {
	// Save original functions
	OriginalUploadImage = UploadImage

	// Replace with mocks
	UploadImage = MockUploadImage
}

// RestoreMocks restores the original functions
func RestoreMocks() {
	UploadImage = OriginalUploadImage
}

// UploadImage is the mock variable that will be assigned in tests
var UploadImage func(file multipart.File, fileName string) (string, error)
