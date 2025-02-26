package database

import (
	"errors"
	"fmt"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"os"
	"path/filepath"
)

// findMigrationsFolder searches for the directory where migrations are stored.
func findMigrationsFolder() (string, error) {
	wd, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("failed to get working directory: %v", err)
	}

	for {
		migrationsPath := filepath.Join(wd, "migrations")
		if _, err := os.Stat(migrationsPath); err == nil {
			return migrationsPath, nil
		}

		parent := filepath.Dir(wd)
		if parent == wd {
			return "", fmt.Errorf("migrations folder not found")
		}
		wd = parent
	}
}

// RunMigrations applies database migrations to ensure the correct schema.
func RunMigrations(db DatabaseOperations) error {
	migrationsPath, err := findMigrationsFolder()
	if err != nil {
		return fmt.Errorf("failed to locate migrations directory: %v", err)
	}

	migrationsPath = "file://" + migrationsPath

	rawDB, ok := db.(*DB)
	if !ok {
		return fmt.Errorf("invalid database type")
	}

	driver, err := postgres.WithInstance(rawDB.DB, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("could not create postgres driver: %v", err)
	}

	m, err := migrate.NewWithDatabaseInstance(migrationsPath, "postgres", driver)
	if err != nil {
		return fmt.Errorf("migration init error: %v", err)
	}

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("migration up error: %v", err)
	}

	return nil
}
