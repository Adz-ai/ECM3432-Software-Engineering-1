#!/bin/bash

# Script to set up environment files for Chalkstone Council Issue Reporting System

# Display intro message
echo "Setting up environment files for Chalkstone Council Issue Reporting System..."

# Create .env from template if it doesn't exist
if [ ! -f .env ]; then
  cp .env.template .env
  echo "✅ Created .env file"
else
  echo "⚠️ .env file already exists, skipping"
fi

# Create .env.postgres from template if it doesn't exist
if [ ! -f .env.postgres ]; then
  cp .env.postgres.template .env.postgres
  echo "✅ Created .env.postgres file"
else
  echo "⚠️ .env.postgres file already exists, skipping"
fi

# Create .env.minio from template if it doesn't exist
if [ ! -f .env.minio ]; then
  cp .env.minio.template .env.minio
  echo "✅ Created .env.minio file"
else
  echo "⚠️ .env.minio file already exists, skipping"
fi

echo "Environment setup complete! You can now customize your environment variables as needed."
echo "To run the application, use: docker-compose up -d"
