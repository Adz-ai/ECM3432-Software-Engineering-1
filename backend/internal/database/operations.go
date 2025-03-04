package database

import (
	"chalkstone.council/internal/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/lib/pq"
	"log"
)

//go:generate mockgen -source=operations.go -destination=mocks/mock_operations.go -package=mocks

type DatabaseOperations interface {
	CreateIssue(issue *models.IssueCreate) (int64, error)
	UpdateIssue(id int64, update *models.IssueUpdate) error
	GetIssue(id int64) (*models.Issue, error)
	ListIssues(page, pageSize int) ([]*models.Issue, error)
	GetIssuesForMap() ([]*models.Issue, error)
	SearchIssues(issueType, status string) ([]*models.Issue, error)
	GetIssueAnalytics(startDate, endDate string) (map[string]interface{}, error)
	GetAverageResolutionTime() (map[string]string, error)
	GetEngineerPerformance() (map[string]int, error)
	GetUserByUsername(username string) (*models.User, error)
	CreateUser(username, passwordHash, userType string) error
}

var _ DatabaseOperations = (*DB)(nil)

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
		SELECT id, type, latitude, longitude, status
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
			&issue.ID,
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

func (db *DB) GetAverageResolutionTime() (map[string]string, error) {
	query := `
		SELECT type, 
		       COALESCE(AVG(EXTRACT(EPOCH FROM (closed_at - created_at))), 0) AS avg_resolution_time
		FROM issues
		WHERE closed_at IS NOT NULL
		GROUP BY type;
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	resolutionTime := make(map[string]string)
	for rows.Next() {
		var issueType string
		var avgTime float64
		if err := rows.Scan(&issueType, &avgTime); err != nil {
			return nil, err
		}

		if avgTime < 0 {
			avgTime = 0
		}

		days := int(avgTime) / 86400
		hours := (int(avgTime) % 86400) / 3600
		resolutionTime[issueType] = fmt.Sprintf("%dd %dh", days, hours)
	}

	return resolutionTime, nil
}

func (db *DB) GetEngineerPerformance() (map[string]int, error) {
	query := `SELECT assigned_to AS engineer, COUNT(*) AS issues_resolved
              FROM issues
              WHERE status = 'CLOSED' AND assigned_to IS NOT NULL
              GROUP BY assigned_to;`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	engineerPerformance := make(map[string]int)
	for rows.Next() {
		var engineer string
		var issuesResolved int
		if err := rows.Scan(&engineer, &issuesResolved); err != nil {
			return nil, err
		}
		engineerPerformance[engineer] = issuesResolved
	}

	return engineerPerformance, nil
}

// GetIssueAnalytics retrieves aggregated statistics for issues within a specified time range.
func (db *DB) GetIssueAnalytics(startDate, endDate string) (map[string]interface{}, error) {
	var start, end interface{}
	if startDate == "" {
		start = nil
	} else {
		start = startDate
	}
	if endDate == "" {
		end = nil
	} else {
		end = endDate
	}

	query := `
		SELECT 
			COUNT(*) AS total_issues,
			(SELECT jsonb_object_agg(type, count) 
			 FROM (SELECT type, COUNT(*) AS count FROM issues 
			       WHERE ($1::date IS NULL OR created_at >= $1::date) 
			       AND ($2::date IS NULL OR created_at <= $2::date) 
			       GROUP BY type) AS t) AS issues_by_type,
			(SELECT jsonb_object_agg(status, count) 
			 FROM (SELECT status, COUNT(*) AS count FROM issues 
			       WHERE ($1::date IS NULL OR created_at >= $1::date) 
			       AND ($2::date IS NULL OR created_at <= $2::date) 
			       GROUP BY status) AS s) AS issues_by_status,
			(SELECT jsonb_object_agg(month, count) 
			 FROM (SELECT to_char(created_at, 'YYYY-MM') AS month, COUNT(*) AS count 
			       FROM issues 
			       WHERE ($1::date IS NULL OR created_at >= $1::date) 
			       AND ($2::date IS NULL OR created_at <= $2::date) 
			       GROUP BY to_char(created_at, 'YYYY-MM')) AS m) 
			AS issues_by_month
		FROM issues
		WHERE ($1::date IS NULL OR created_at >= $1::date) 
		  AND ($2::date IS NULL OR created_at <= $2::date);
	`

	var totalIssues int
	var issuesByTypeJSON, issuesByStatusJSON, issuesByMonthJSON []byte

	err := db.QueryRow(query, start, end).Scan(
		&totalIssues,
		&issuesByTypeJSON,
		&issuesByStatusJSON,
		&issuesByMonthJSON,
	)
	if err != nil {
		return nil, fmt.Errorf("error fetching analytics: %v", err)
	}

	issuesByType := make(map[string]int)
	issuesByStatus := make(map[string]int)
	issuesByMonth := make(map[string]int)

	if issuesByTypeJSON != nil {
		if err := json.Unmarshal(issuesByTypeJSON, &issuesByType); err != nil {
			return nil, fmt.Errorf("error unmarshaling issues_by_type: %v", err)
		}
	}

	if issuesByStatusJSON != nil {
		if err := json.Unmarshal(issuesByStatusJSON, &issuesByStatus); err != nil {
			return nil, fmt.Errorf("error unmarshaling issues_by_status: %v", err)
		}
	}

	if issuesByMonthJSON != nil {
		if err := json.Unmarshal(issuesByMonthJSON, &issuesByMonth); err != nil {
			return nil, fmt.Errorf("error unmarshaling issues_by_month: %v", err)
		}
	}

	return map[string]interface{}{
		"total_issues":     totalIssues,
		"issues_by_type":   issuesByType,
		"issues_by_status": issuesByStatus,
		"issues_by_month":  issuesByMonth,
	}, nil
}
