# Chalkstone Council Issue Reporting System

A comprehensive platform for the Chalkstone Council to manage public issue reporting, tracking, and analysis. The system allows residents to report issues (such as potholes, graffiti, street lighting problems), track their status, and enables council staff to manage and analyze issue data.

## 🌟 System Overview

This project consists of two main components:
- **Frontend**: React-based web application for residents and council staff
- **Backend**: Go (Golang) REST API with PostgreSQL database and MinIO for image storage

### Key Features

- **Interactive Issue Map**: View reported issues on a map with location markers
- **Issue Reporting**: Submit issues with descriptions, locations, and images
- **User Authentication**: Different permissions for public users and council staff
- **Staff Dashboard**: Analytics and management tools for council employees
- **Image Management**: Upload and view images associated with issues
- **Status Tracking**: Monitor the progress of reported issues

## 🚀 Project Structure

```
chalkstone-council-system/
├── frontend/                 # React frontend application
├── backend/                  # Go (Golang) API server
├── docker-compose.yml        # Docker Compose configuration
├── README.md                 # Project documentation
└── DOCKER_DEPLOYMENT.md     # Docker deployment instructions
```

## 💻 Technologies Used

### Frontend
#### Core Technologies
- **React**: UI library for building the user interface (v18+)
- **React Router**: For client-side routing and navigation
- **React Context API**: For state management across components

#### UI Framework & Components
- **Material UI (MUI)**: Comprehensive UI component library and design system
  - MUI Grid System: For responsive layouts
  - MUI Cards, Dialogs, Forms: For consistent UI elements
  - MUI Icons: For iconography throughout the application
  - MUI Theming: For customized styling with light/dark modes
  - MUI Data Grid: For tabular data presentation
- **Framer Motion**: For smooth animations and transitions

#### Data Visualization
- **Recharts**: Library for creating responsive charts and graphs in the dashboard
- **Leaflet**: Interactive maps for issue visualization with marker clustering

#### Forms & Validation
- **Formik**: For form handling and validation
- **Yup**: Schema-based form validation library
- **Custom Validators**: Specialized input validation functions with test coverage

#### Networking
- **Axios**: Promise-based HTTP client for API requests

#### Development Tools
- **ESLint**: For code linting and ensuring code quality
- **npm**: Package management

### Backend
#### Core Technologies
- **Go (Golang)**: Backend API language
- **Gin**: HTTP web framework for building the RESTful API

#### Database & Storage
- **PostgreSQL**: Relational database for persistent data storage
- **MinIO**: Object storage service for image uploads and retrieval
- **SQL Migrations**: For database schema versioning

#### Security
- **JWT**: JSON Web Tokens for authentication & authorization with role-based access control
- **Bcrypt**: Secure password hashing
- **CORS**: Cross-Origin Resource Sharing configuration
- **Role-Based Access**: Staff/Admin and Regular User permission levels

#### API Development
- **Swagger**: API documentation and OpenAPI specification
- **Go Validator**: Request validation

#### Testing
- **Go Testing**: Standard Go testing framework
- **TestContainers**: Database testing with containerization

## 🔧 Setup Instructions

### Prerequisites
- Node.js (>=14.0.0) and npm (>=6.0.0)
- Go (>=1.19)
- PostgreSQL (or Docker)
- MinIO (or Docker)

### Backend Setup

1. **Navigate to the backend directory**:
```sh
cd backend
```

2. **Configure Environment Variables**:
   Create a `.env` file with database and MinIO credentials:
```
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

3. **Run Dependencies with Docker** (optional):
```sh
# PostgreSQL
docker run --name chalkstone-db -e POSTGRES_USER=your_user -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=chalkstone -p 5432:5432 -d postgres

# MinIO
docker run -p 9000:9000 -p 9090:9090 -d --name minio \
  -e "MINIO_ROOT_USER=minioadmin" -e "MINIO_ROOT_PASSWORD=minioadmin" \
  quay.io/minio/minio server /data --console-address ":9090"
```

4. **Build and Run**:
```sh
make build
make run
```

The backend API will be available at http://localhost:8080.
Swagger documentation: http://localhost:8080/swagger/index.html

### Frontend Setup

1. **Navigate to the frontend directory**:
```sh
cd frontend
```

2. **Install Dependencies**:
```sh
npm install
```

3. **Configure Environment**:
   Create a `.env` file:
```
REACT_APP_API_URL=http://localhost:8080/api
```

4. **Start Development Server**:
```sh
npm start
```

The frontend will be available at http://localhost:3000.

## 🚀 Docker-Compose Deployment Instructions

To deploy the Chalkstone Council Issue Reporting System using Docker Compose, follow the documentation in the [Docker Deployment Instructions](DOCKER_DEPLOYMENT.md) file.

## 📱 Using the Application

### Public User Features
- View the map of reported issues
- Register a new account
- Login with existing credentials
- Report new issues with descriptions and images
- Track reported issues

### Staff Features
- All public user features
- Access to analytics dashboard
- View and manage all reported issues
- Update issue status (New, In Progress, Resolved)
- Assign issues to staff members

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` – Create a new user
- `POST /api/auth/login` – Authenticate and receive JWT token

### Issue Management
- `POST /api/issues` – Report an issue (Authenticated)
- `GET /api/issues/{id}` – Get issue details (Authenticated)
- `PUT /api/issues/{id}` – Update issue status (Staff Only)
- `GET /api/issues` – List all issues (Staff Only)
- `GET /api/issues/map` – Get issues for map view (Public)
- `GET /api/issues/search` – Search issues by filters (Staff Only)
- `GET /api/issues/analytics` – Get issue analytics (Staff Only)

### Engineers
- `GET /api/engineers` – List all engineers (Staff Only)
- `GET /api/engineers/{id}` – Get engineer details (Staff Only)

### Analytics
- `GET /api/analytics/engineers` – Get engineer performance metrics (Staff Only)
- `GET /api/analytics/resolution-time` – Get issue resolution time metrics (Staff Only)

### Image Handling
- `POST /api/issues` – Upload images with multipart form data
- MinIO endpoint for image retrieval

## 🛠️ Development

### Testing Strategy

The Chalkstone Council Issue Reporting System follows a comprehensive testing strategy outlined in detail in the [TESTING_STRATEGY.md](TESTING_STRATEGY.md) file. Our approach includes multiple testing methodologies to ensure code quality and application reliability.

#### Frontend Testing

- **Jest & React Testing Library**: For component, integration, and unit testing
- **Snapshot Testing**: To detect unexpected UI changes
- **User Event Simulation**: For testing interaction flows
- **Mock Service Worker**: For API mocking

#### Backend Testing

- **Go Testing Framework**: Built-in testing utilities
- **GoMock**: Powerful mocking framework for interface testing
- **Testcontainers**: Real database testing with isolated Docker containers
- **Integration Tests**: To verify system component interactions

### Running Tests

#### Backend Tests
```sh
cd backend
make test
make coverage
```

#### Frontend Tests
```sh
cd frontend
npm test
```

### Building for Production

#### Backend
```sh
cd backend
make build
```

#### Frontend
```sh
cd frontend
npm run build
```

## 📦 Deployment

### Docker Compose (Recommended)
The easiest way to deploy the full stack is using Docker Compose:

1. **Build and start containers**:
```sh
docker-compose up -d
```

2. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- MinIO Console: http://localhost:9090

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request