package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"strings"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/google/uuid"
)

var (
	endpoint        = os.Getenv("MINIO_ENDPOINT")
	accessKeyID     = os.Getenv("MINIO_ACCESS_KEY")
	secretAccessKey = os.Getenv("MINIO_SECRET_KEY")
	bucketName      = os.Getenv("MINIO_BUCKET")
)

func UploadImage(file multipart.File, fileName string) (string, error) {
	// Read the first 512 bytes to detect the content type
	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil && err != io.EOF {
		log.Printf("Error reading file for content type detection: %v", err)
		return "", fmt.Errorf("failed to read file header")
	}
	// Reset the read pointer so minio gets the full file
	_, seekErr := file.Seek(0, io.SeekStart)
	if seekErr != nil {
		log.Printf("Error seeking file pointer: %v", seekErr)
		return "", fmt.Errorf("failed to process file")
	}

	// Detect the actual content type
	contentType := http.DetectContentType(buffer[:n])

	// Validate content type - allow only common image types
	allowedTypes := map[string]string{
		"image/jpeg": ".jpg",
		"image/png":  ".png",
		"image/gif":  ".gif",
		"image/webp": ".webp",
	}
	ext, ok := allowedTypes[contentType]
	if !ok {
		log.Printf("Upload rejected: Invalid content type '%s' detected for file '%s'", contentType, fileName)
		return "", fmt.Errorf("invalid file type: %s. Only JPEG, PNG, GIF, WEBP allowed", contentType)
	}

	// Generate a unique filename using UUID + validated extension
	// This prevents path traversal and filename conflicts/overwrites
	secureFileName := uuid.New().String() + ext

	minioClient, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: false, // Assuming local dev/docker setup, use true for production HTTPS
	})
	if err != nil {
		log.Printf("Failed to initialize MinIO client: %v", err)
		return "", err
	}

	// Use file size from header if available, otherwise -1 for unknown size (streams whole file)
	// Determine file size for PutObject - important for MinIO progress/resource allocation
	// Try to get size from the file handle itself if it supports it
	var fileSize int64 = -1 // Default to unknown size
	if seeker, ok := file.(io.Seeker); ok {
		currentPos, _ := seeker.Seek(0, io.SeekCurrent) // Get current position
		size, err := seeker.Seek(0, io.SeekEnd) // Seek to end to get size
		if err == nil {
			fileSize = size
		}
		_, _ = seeker.Seek(currentPos, io.SeekStart) // Reset position to where it was
	}

	_, err = minioClient.PutObject(context.Background(), bucketName, secureFileName, file, fileSize, minio.PutObjectOptions{ContentType: contentType})
	if err != nil {
		log.Printf("Failed to upload image '%s' (original: '%s'): %v", secureFileName, fileName, err)
		return "", err
	}

	// Create a local copy of endpoint for URL formation
	urlEndpoint := endpoint
	// For Docker/local access: If internal endpoint contains "minio", use localhost for the URL
	if strings.Contains(urlEndpoint, "minio") {
		urlEndpoint = "localhost:9000" // Make sure this matches your docker-compose port mapping
	}

	imageURL := fmt.Sprintf("http://%s/%s/%s", urlEndpoint, bucketName, secureFileName)
	return imageURL, nil
}
