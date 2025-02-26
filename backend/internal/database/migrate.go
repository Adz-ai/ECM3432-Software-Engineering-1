package database

import (
	"errors"
	"fmt"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func RunMigrations(db DatabaseOperations) error {
	// Extract the real *sql.DB from DatabaseOperations
	dbInstance, ok := db.(*DB)
	if !ok {
		return fmt.Errorf("invalid database instance, expected *database.DB")
	}

	driver, err := postgres.WithInstance(dbInstance.DB, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("could not create postgres driver: %v", err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file://migrations",
		"postgres", driver)
	if err != nil {
		return fmt.Errorf("migration init error: %v", err)
	}

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("migration up error: %v", err)
	}

	return nil
}
