#!/bin/sh
set -e

echo "Setting up Minio..."

# Configure Minio client
/usr/bin/mc alias set myminio http://minio:9000 minioadmin minioadmin

# Create bucket (ignore error if it already exists)
/usr/bin/mc mb myminio/issues-bucket || true

# Set public access for the bucket
/usr/bin/mc anonymous set public myminio/issues-bucket

echo "Uploading sample images to Minio..."
cd /sample-images

# Loop through all files in the sample-images directory
for file in *; do
  if [ -f "$file" ]; then
    echo "Uploading $file..."
    /usr/bin/mc cp "/sample-images/$file" myminio/issues-bucket/
  fi
done

echo "All sample images uploaded successfully!"
