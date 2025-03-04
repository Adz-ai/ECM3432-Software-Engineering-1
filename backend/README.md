# Chalkstone Council API

This is the backend API for the **Chalkstone Council Issue Reporting System**, allowing users to report public issues (e.g., potholes, graffiti), track their status, and access analytics for city maintenance.

## **🚀 Technologies Used**
- **Go (Golang)** – Backend API
- **Gin** – HTTP Web Framework
- **PostgreSQL** – Relational Database
- **TestContainers** – Database Testing
- **MinIO** – Object Storage for Image Uploads
- **JWT (JSON Web Tokens)** – Authentication & Authorization
- **Swagger** – API Documentation
- **Docker** – Containerization
- **Bcrypt** – Secure Password Hashing

---

## **⚙️ Setup Instructions**
### **📌 Prerequisites**
Ensure you have the following installed:
- **Go** (>=1.19)
- **PostgreSQL** (or run via Docker)
- **MinIO** (for image storage)
- **Docker** (optional for running services in containers)

---

### **📦 Installation & Running**
#### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/your-repo/chalkstone-council-api.git
cd chalkstone-council-api
```

#### **2️⃣ Configure Environment Variables**

Create a .env file in the root directory and add:
```dotenv
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=chalkstone
JWT_SECRET=your_jwt_secret

# MinIO Storage
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=my-bucket
```


#### **3️⃣ Run PostgreSQL (if not installed)**
```shell
docker run --name chalkstone-db -e POSTGRES_USER=your_user -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=chalkstone -p 5432:5432 -d postgres
```

#### **4️⃣ Run MinIO (for Image Storage)**

```shell
docker run -p 9000:9000 -p 9090:9090 -d --name minio \
  -e "MINIO_ROOT_USER=minioadmin" -e "MINIO_ROOT_PASSWORD=minioadmin" \
  quay.io/minio/minio server /data --console-address ":9090"
```

#### **5️⃣ Build the Binary**
```shell
make build
```

This will create tables and apply migrations.

#### **6️⃣ Run the API**

```shell
make run
```

Your API should now be running on http://localhost:8080 🚀

## 📖 API Documentation (Swagger)

Swagger documentation is available at:

🔗 http://localhost:8080/swagger/index.html

Use this to test endpoints and understand the API contract.

## 🛠️ Running Tests

The backend includes unit & integration tests.

To run all tests with coverage:

```shell
make test
```

To view the test coverage report:

```shell
make coverage
```

## 📜 API Endpoints

### 📝 Authentication
	•	POST /api/auth/register – Create a new user
	•	POST /api/auth/login – Authenticate and receive JWT token

### 📍 Issue Reporting
	•	POST /api/issues – Report an issue (Authenticated)
	•	GET /api/issues/{id} – Get issue details (Authenticated)
	•	PUT /api/issues/{id} – Update issue status (Staff Only)
	•	GET /api/issues – List all issues (Authenticated)
	•	GET /api/issues/map – Get issues for map view (Public)
	•	GET /api/issues/search – Search issues by filters (Authenticated)
	•	GET /api/issues/analytics – Get issue analytics (Staff Only)

### 📷 Image Uploads
	•	POST /api/issues/upload – Upload images to MinIO
	•	GET /my-bucket/{image-name} – Retrieve stored images


## 🎯 Next Steps
	•	Implement Role-based access control (RBAC)
	•	Improve error handling & logging
	•	Deploy on AWS/GCP
	•	Improve unit & integration tests

## 📜 License

This project is licensed under the MIT License.