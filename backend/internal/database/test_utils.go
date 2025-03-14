package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

// TestDBContainer represents the test database container.
type TestDBContainer struct {
	Container testcontainers.Container
	DB        *DB
}

func StartTestDB() (*DB, func(), error) {
	ctx := context.Background()

	// Configure PostgreSQL test container with a random name to ensure isolation
	containerName := fmt.Sprintf("test-postgres-%d", time.Now().UnixNano())
	req := testcontainers.ContainerRequest{
		Name:         containerName,
		Image:        "postgres:15",
		ExposedPorts: []string{"5432/tcp"},
		Env: map[string]string{
			"POSTGRES_USER":     "test",
			"POSTGRES_PASSWORD": "test",
			"POSTGRES_DB":       "test_db",
		},
		WaitingFor: wait.ForListeningPort("5432/tcp").WithStartupTimeout(10 * time.Second),
	}

	// Create the container
	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		return nil, nil, fmt.Errorf("failed to start test container: %w", err)
	}

	// Get database host and port
	host, err := container.Host(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get container host: %w", err)
	}
	port, err := container.MappedPort(ctx, "5432")
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get mapped port: %w", err)
	}

	// Create PostgreSQL connection string
	connStr := fmt.Sprintf(
		"host=%s port=%s user=test password=test dbname=test_db sslmode=disable",
		host, port.Port(),
	)

	// Connect to database
	rawDB, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to connect to test DB: %w", err)
	}

	// Ensure the DB is reachable
	if err := rawDB.Ping(); err != nil {
		return nil, nil, fmt.Errorf("failed to ping test DB: %w", err)
	}

	testDB := &DB{rawDB}

	if err := RunMigrations(testDB); err != nil {
		return nil, nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	// Cleanup function to close DB and terminate the container
	cleanup := func() {
		if err := rawDB.Close(); err != nil {
			log.Printf("failed to close test DB: %v", err)
		}
		if err := container.Terminate(ctx); err != nil {
			log.Printf("failed to stop test container: %v", err)
		}
	}

	return testDB, cleanup, nil
}
