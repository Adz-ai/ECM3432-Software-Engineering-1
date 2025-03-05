# Docker Deployment Instructions

This guide explains how to deploy the Chalkstone Council Issue Reporting System using Docker Compose.

## Prerequisites

- Docker Engine (20.10.0+)
- Docker Compose (2.0.0+)
- Git

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Adz-ai/chalkstone-council-system.git
cd chalkstone-council-system
```

### 2. Environment Configuration

Both the frontend and backend environments are already configured in the Docker Compose file. However, if you need to make any changes:

- **Backend Environment**: Edit the environment variables in the `backend` service section of `docker-compose.yml`
- **Frontend Environment**: Edit the environment variables in the `frontend` service section of `docker-compose.yml`

### 3. Build and Start Services

From the project root directory, run:

```bash
docker-compose up -d
```

This command builds all the necessary images and starts the containers in detached mode.

To see the logs:

```bash
docker-compose logs -f
```

### 4. Access the Application

Once all containers are up and running, you can access:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger/index.html
- **MinIO Console**: http://localhost:9090 (Login with minioadmin/minioadmin)

### 5. Stopping the Application

To stop all containers:

```bash
docker-compose down
```

To stop and remove all containers, networks, and volumes:

```bash
docker-compose down -v
```

## Container Structure

This deployment creates the following containers:

1. **chalkstone-postgres**: PostgreSQL database
2. **chalkstone-minio**: MinIO object storage for images
3. **chalkstone-minio-setup**: One-time setup container for MinIO
4. **chalkstone-backend**: Go API server
5. **chalkstone-frontend**: React web application with Nginx

## Data Persistence

The setup includes two named volumes:

- **postgres_data**: Persists database data
- **minio_data**: Persists uploaded images

Your data will remain intact between restarts unless you explicitly remove the volumes.

## Troubleshooting

### Backend Can't Connect to Database

Check the logs:

```bash
docker-compose logs backend
```

Ensure the PostgreSQL container is healthy:

```bash
docker-compose ps postgres
```

### Images Not Showing Up

1. Verify MinIO is running correctly:

```bash
docker-compose logs minio
```

2. Check if the bucket was created successfully:

```bash
docker-compose logs minio-setup
```

3. Verify the backend can connect to MinIO:

```bash
docker-compose logs backend | grep minio
```

### Frontend Can't Connect to Backend

Check your browser console for CORS or connection errors. The Nginx configuration in the frontend container should proxy API requests to the backend.

## Rebuilding Images

If you make changes to the code, rebuild the containers:

```bash
docker-compose up -d --build
```