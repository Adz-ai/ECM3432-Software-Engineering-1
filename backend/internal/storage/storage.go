package storage

import (
	"context"
	"fmt"
	"log"
	"mime/multipart"
	"os"
	"strings"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var (
	endpoint        = os.Getenv("MINIO_ENDPOINT")
	accessKeyID     = os.Getenv("MINIO_ACCESS_KEY")
	secretAccessKey = os.Getenv("MINIO_SECRET_KEY")
	bucketName      = os.Getenv("MINIO_BUCKET")
)

func UploadImage(file multipart.File, fileName string) (string, error) {
	minioClient, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: false,
	})
	if err != nil {
		log.Println("Failed to initialize MinIO client:", err)
		return "", err
	}

	contentType := "image/jpeg"

	_, err = minioClient.PutObject(context.Background(), bucketName, fileName, file, -1, minio.PutObjectOptions{ContentType: contentType})
	if err != nil {
		log.Println("Failed to upload image:", err)
		return "", err
	}

	// Create a local copy of endpoint for URL formation
	urlEndpoint := endpoint
	// For Docker: If internal endpoint contains "minio", use localhost for the URL
	if strings.Contains(urlEndpoint, "minio") {
		urlEndpoint = "localhost:9000"
	}

	imageURL := fmt.Sprintf("http://%s/%s/%s", urlEndpoint, bucketName, fileName)
	return imageURL, nil
}
