package database

import (
	"chalkstone.council/internal/models"
	"database/sql"
	"github.com/lib/pq"
	"log"
)

func (db *DB) CreateIssue(issue *models.IssueCreate) (int64, error) {
	var id int64
	err := db.QueryRow(`
        INSERT INTO issues (type, description, latitude, longitude, images, reported_by, status)
        VALUES ($1, $2, $3, $4, $5::text[], $6, $7)
        RETURNING id`,
		issue.Type,
		issue.Description,
		issue.Location.Latitude,
		issue.Location.Longitude,
		pq.Array(issue.Images),
		issue.ReportedBy,
		models.StatusNew,
	).Scan(&id)

	if err != nil {
		return 0, err
	}
	return id, nil
}
func (db *DB) GetIssue(id int64) (*models.Issue, error) {
	var issue models.Issue
	err := db.QueryRow(`
        SELECT id, type, status, description, latitude, longitude,
               images::text[], reported_by, assigned_to, created_at, updated_at
        FROM issues WHERE id = $1`,
		id,
	).Scan(
		&issue.ID,
		&issue.Type,
		&issue.Status,
		&issue.Description,
		&issue.Location.Latitude,
		&issue.Location.Longitude,
		pq.Array(&issue.Images),
		&issue.ReportedBy,
		&issue.AssignedTo,
		&issue.CreatedAt,
		&issue.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &issue, nil
}

func (db *DB) GetIssuesForMap() ([]*models.Issue, error) {
	rows, err := db.Query(`
		SELECT type, latitude, longitude, status
		FROM issues`)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Printf("Failed to close rows: %v", err)
		}
	}(rows)

	var issues []*models.Issue
	for rows.Next() {
		var issue models.Issue
		err := rows.Scan(
			&issue.Type,
			&issue.Location.Latitude,
			&issue.Location.Longitude,
			&issue.Status,
		)
		if err != nil {
			return nil, err
		}
		issues = append(issues, &issue)
	}
	return issues, nil
}

func (db *DB) UpdateIssue(id int64, update *models.IssueUpdate) error {
	result, err := db.Exec(`
        UPDATE issues
        SET status = COALESCE($1, status),
            assigned_to = COALESCE($2, assigned_to),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3`,
		update.Status,
		update.AssignedTo,
		id,
	)

	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (db *DB) ListIssues(page, pageSize int) ([]*models.Issue, error) {
	offset := (page - 1) * pageSize
	rows, err := db.Query(`
        SELECT id, type, status, description, latitude, longitude,
               images::text[], reported_by, assigned_to, created_at, updated_at
        FROM issues
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2`,
		pageSize, offset,
	)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Printf("Failed to close rows: %v", err)
		}
	}(rows)

	var issues []*models.Issue
	for rows.Next() {
		var issue models.Issue
		err := rows.Scan(
			&issue.ID,
			&issue.Type,
			&issue.Status,
			&issue.Description,
			&issue.Location.Latitude,
			&issue.Location.Longitude,
			pq.Array(&issue.Images),
			&issue.ReportedBy,
			&issue.AssignedTo,
			&issue.CreatedAt,
			&issue.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		issues = append(issues, &issue)
	}
	return issues, rows.Err()
}

func (db *DB) SearchIssues(issueType, status string) ([]*models.Issue, error) {
	rows, err := db.Query(`
        SELECT id, type, status, description, latitude, longitude,
               images::text[], reported_by, assigned_to, created_at, updated_at
        FROM issues
        WHERE ($1 = '' OR type = $1::issue_type)
        AND ($2 = '' OR status = $2::issue_status)
        ORDER BY created_at DESC`,
		issueType, status,
	)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Printf("Failed to close rows: %v", err)
		}
	}(rows)

	var issues []*models.Issue
	for rows.Next() {
		var issue models.Issue
		err := rows.Scan(
			&issue.ID,
			&issue.Type,
			&issue.Status,
			&issue.Description,
			&issue.Location.Latitude,
			&issue.Location.Longitude,
			pq.Array(&issue.Images),
			&issue.ReportedBy,
			&issue.AssignedTo,
			&issue.CreatedAt,
			&issue.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		issues = append(issues, &issue)
	}
	return issues, rows.Err()
}

func (db *DB) CreateUser(username, passwordHash, userType string) error {
	_, err := db.Exec(`
        INSERT INTO users (username, password_hash, user_type)
        VALUES ($1, $2, $3)`,
		username, passwordHash, userType)
	return err
}

func (db *DB) GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	err := db.QueryRow(`
        SELECT id, username, password_hash, user_type
        FROM users WHERE username = $1`,
		username).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.UserType)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
