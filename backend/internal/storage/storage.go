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

	// Adding this due to Docker Container Issue
	if strings.Contains(endpoint, "minio") {
		endpoint = "localhost:9000"
	}

	imageURL := fmt.Sprintf("http://%s/%s/%s", endpoint, bucketName, fileName)
	return imageURL, nil
}
