# Docker Deployment Instructions

This guide explains how to deploy the Chalkstone Council Issue Reporting System using Docker Compose. The application is designed for easy deployment with minimal setup required.

## Prerequisites

- Docker Engine (20.10.0+)
- Docker Compose (2.0.0+)
- Git

## Quick Start Deployment

### 1. Clone the Repository

```bash
git clone https://github.com/Adz-ai/ECM3432-Software-Engineering-1.git
cd ECM3432-Software-Engineering-1
```

### 2. Setup Environment Files

Run the setup script to create all necessary environment files:

```bash
./setup-env.sh
```

This script automatically creates these files from templates if they don't exist:

- `.env` - Main configuration (port settings)
- `.env.postgres` - PostgreSQL database configuration
- `.env.minio` - MinIO object storage configuration

### 3. Build and Start Services

```bash
docker-compose up -d
```

This command builds all the necessary images and starts the containers in detached mode.

### 4. Access the Application

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger/index.html
- **MinIO Console**: http://localhost:9090 (Login with credentials from .env.minio)

## Customization Options

### Modifying Port Settings

To change the default ports, edit the `.env` file created by the setup script:

```
# Change frontend port from 3000 to another value
FRONTEND_PORT=8000

# Change backend port from 8080 to another value
BACKPORT_PORT=9000
```

### Database Configuration

To customize database settings, edit `.env.postgres`:

```
POSTGRES_USER=custom_user
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=my_database
```

### MinIO Object Storage Configuration

To customize MinIO settings, edit `.env.minio`:

```
MINIO_ROOT_USER=custom_admin
MINIO_ROOT_PASSWORD=secure_password
```

### Backend Service Configuration

The backend service uses a Docker-specific environment file at `backend/.env.docker`. You can edit this file to customize backend settings like JWT secret and other application-specific configuration.

## Operations Guide

### Viewing Logs

To see logs for all services:

```bash
docker-compose logs -f
```

To see logs for a specific service:

```bash
docker-compose logs -f backend  # View backend logs
docker-compose logs -f frontend  # View frontend logs
docker-compose logs -f postgres  # View database logs
```

### Stopping the Application

To stop all containers while preserving data:

```bash
docker-compose down
```

To stop and completely remove all containers, networks, and volumes (this will delete all data):

```bash
docker-compose down -v
```

### Restarting Services

To restart a specific service:

```bash
docker-compose restart backend  # Restart just the backend
```

### Rebuilding After Code Changes

If you make changes to the code, rebuild the containers:

```bash
docker-compose up -d --build
```

## Container Architecture

This deployment creates the following containers:

1. **postgres**: PostgreSQL database for storing application data
   - Uses named volume for data persistence
   - Configured via `.env.postgres`

2. **minio**: MinIO object storage for images
   - Uses named volume for data persistence
   - Configured via `.env.minio`

3. **minio-setup**: One-time setup container
   - Creates buckets and uploads sample images
   - Runs only once during initial setup

4. **backend**: Go API server
   - Exposes REST API endpoints
   - Connects to PostgreSQL and MinIO
   - Configured via `backend/.env.docker`

5. **frontend**: React web application with Nginx
   - Serves the user interface
   - Optimized for production with caching

## Data Persistence

The application uses Docker named volumes for data persistence:

- **postgres_data**: Stores database tables and records
- **minio_data**: Stores uploaded images and files

These volumes are automatically created and managed by Docker - no manual directory setup is required. Your data will remain intact between container restarts and system reboots unless you explicitly remove the volumes with `docker-compose down -v`.

## Troubleshooting Guide

### Health Checks

All containers have built-in health checks. Check their status with:

```bash
docker-compose ps
```

The "State" column should show "Up (healthy)" for running containers.

### Common Issues and Solutions

#### Database Connection Issues

**Symptoms**: Backend logs show database connection errors

**Solutions**:
1. Check if the postgres container is running and healthy:
   ```bash
   docker-compose ps postgres
   ```

2. Verify the database credentials in `backend/.env.docker` match those in `.env.postgres`

3. Check postgres logs for any errors:
   ```bash
   docker-compose logs postgres
   ```

#### Missing Images or Storage Issues

**Symptoms**: Uploaded images don't appear, or errors when uploading

**Solutions**:
1. Check if MinIO initialized correctly:
   ```bash
   docker-compose logs minio-setup
   ```

2. Verify the MinIO container is healthy:
   ```bash
   docker-compose logs minio
   ```

3. Check that the backend can connect to MinIO:
   ```bash
   docker-compose logs backend | grep -i minio
   ```

4. Try accessing the MinIO console at http://localhost:9090 to verify buckets exist

#### Frontend Can't Connect to Backend

**Symptoms**: UI loads but API requests fail, or features don't work

**Solutions**:
1. Check if the backend is healthy:
   ```bash
   curl http://localhost:8080/health
   ```

2. Check browser console for CORS or network errors

3. Verify the frontend is configured to use the correct backend URL

#### Slow Performance

The Docker configuration includes resource limits to prevent any single container from consuming too many resources. If you need to adjust these limits for your environment, edit the `deploy` sections in `docker-compose.yml`.

## Security Considerations

- The default configurations use simple passwords intended for development
- For production use, modify all passwords in the environment files
- Generate a strong JWT secret in `backend/.env.docker`
- Consider restricting port bindings to localhost by setting `BIND_IP=127.0.0.1` in `.env`