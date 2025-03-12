package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math"

	"chalkstone.council/internal/models"
	"github.com/lib/pq"
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
	GetEngineerPerformance() ([]*models.EngineerPerformance, error)
	GetUserByUsername(username string) (*models.User, error)
	CreateUser(username, passwordHash, userType string) error
	ListEngineers() ([]*models.Engineer, error)
	GetEngineerByID(id int64) (*models.Engineer, error)
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
	// Get per-type resolution times
	typeQuery := `
		SELECT type, 
		       COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))), 0) AS avg_resolution_time
		FROM issues
		WHERE status = 'RESOLVED'
		GROUP BY type;
	`

	rows, err := db.Query(typeQuery)
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

	// Get overall average resolution time
	overallQuery := `
		SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))), 0) AS overall_avg_resolution_time
		FROM issues
		WHERE status = 'RESOLVED';
	`

	var overallAvgTime float64
	err = db.QueryRow(overallQuery).Scan(&overallAvgTime)
	if err != nil {
		return nil, err
	}

	if overallAvgTime < 0 {
		overallAvgTime = 0
	}

	days := int(overallAvgTime) / 86400
	hours := (int(overallAvgTime) % 86400) / 3600
	resolutionTime["OVERALL"] = fmt.Sprintf("%dd %dh", days, hours)

	return resolutionTime, nil
}

func (db *DB) ListEngineers() ([]*models.Engineer, error) {
	query := `
		SELECT id, name, email, phone, specialization, join_date, created_at, updated_at
		FROM engineers
		ORDER BY name ASC;
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var engineers []*models.Engineer
	for rows.Next() {
		engineer := &models.Engineer{}
		err := rows.Scan(
			&engineer.ID,
			&engineer.Name,
			&engineer.Email,
			&engineer.Phone,
			&engineer.Specialization,
			&engineer.JoinDate,
			&engineer.CreatedAt,
			&engineer.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		engineers = append(engineers, engineer)
	}

	return engineers, nil
}

func (db *DB) GetEngineerByID(id int64) (*models.Engineer, error) {
	query := `
		SELECT id, name, email, phone, specialization, join_date, created_at, updated_at
		FROM engineers
		WHERE id = $1;
	`

	engineer := &models.Engineer{}
	err := db.QueryRow(query, id).Scan(
		&engineer.ID,
		&engineer.Name,
		&engineer.Email,
		&engineer.Phone,
		&engineer.Specialization,
		&engineer.JoinDate,
		&engineer.CreatedAt,
		&engineer.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Return nil, nil if no engineer found
		}
		return nil, err
	}

	return engineer, nil
}

func (db *DB) GetEngineerPerformance() ([]*models.EngineerPerformance, error) {
	// First, get all engineers
	engineers, err := db.ListEngineers()
	if err != nil {
		return nil, fmt.Errorf("error getting engineers: %w", err)
	}

	// Query for both completed and assigned issues per engineer
	query := `
		SELECT 
			e.id,
			-- Resolved issues
			COUNT(CASE WHEN i.status = 'RESOLVED' THEN 1 END) AS issues_resolved,
			AVG(EXTRACT(EPOCH FROM (i.resolved_at - i.created_at))) AS avg_resolution_time,
			-- Resolved issues by type
			COUNT(CASE WHEN i.status = 'RESOLVED' AND i.type = 'POTHOLE' THEN 1 END) AS pothole_resolved,
			COUNT(CASE WHEN i.status = 'RESOLVED' AND i.type = 'STREET_LIGHT' THEN 1 END) AS streetlight_resolved,
			COUNT(CASE WHEN i.status = 'RESOLVED' AND i.type = 'GRAFFITI' THEN 1 END) AS graffiti_resolved,
			COUNT(CASE WHEN i.status = 'RESOLVED' AND i.type = 'ANTI_SOCIAL' THEN 1 END) AS antisocial_resolved,
			COUNT(CASE WHEN i.status = 'RESOLVED' AND i.type = 'FLY_TIPPING' THEN 1 END) AS flytipping_resolved,
			COUNT(CASE WHEN i.status = 'RESOLVED' AND i.type = 'BLOCKED_DRAIN' THEN 1 END) AS blockeddrain_resolved,
			-- Currently assigned issues
			COUNT(CASE WHEN i.status != 'RESOLVED' THEN 1 END) AS issues_assigned,
			-- Currently assigned issues by type
			COUNT(CASE WHEN i.status != 'RESOLVED' AND i.type = 'POTHOLE' THEN 1 END) AS pothole_assigned,
			COUNT(CASE WHEN i.status != 'RESOLVED' AND i.type = 'STREET_LIGHT' THEN 1 END) AS streetlight_assigned,
			COUNT(CASE WHEN i.status != 'RESOLVED' AND i.type = 'GRAFFITI' THEN 1 END) AS graffiti_assigned,
			COUNT(CASE WHEN i.status != 'RESOLVED' AND i.type = 'ANTI_SOCIAL' THEN 1 END) AS antisocial_assigned,
			COUNT(CASE WHEN i.status != 'RESOLVED' AND i.type = 'FLY_TIPPING' THEN 1 END) AS flytipping_assigned,
			COUNT(CASE WHEN i.status != 'RESOLVED' AND i.type = 'BLOCKED_DRAIN' THEN 1 END) AS blockeddrain_assigned
		FROM engineers e
		LEFT JOIN issues i ON e.id = i.assigned_to
		GROUP BY e.id
		ORDER BY issues_resolved DESC;
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Create a map to look up engineers by ID
	engineerMap := make(map[int64]*models.Engineer)
	for _, e := range engineers {
		engineerMap[e.ID] = e
	}

	// Process the results
	results := []*models.EngineerPerformance{}

	for rows.Next() {
		var engineerID int64
		// Resolved issues
		var issuesResolved int
		// Use sql.NullFloat64 to handle NULL values
		var avgResolutionTimeNullable sql.NullFloat64
		var potholeResolved, streetlightResolved, graffitiResolved int
		var antisocialResolved, flytippingResolved, blockeddrainResolved int
		// Assigned issues
		var issuesAssigned int
		var potholeAssigned, streetlightAssigned, graffitiAssigned int
		var antisocialAssigned, flytippingAssigned, blockeddrainAssigned int

		if err := rows.Scan(
			&engineerID,
			// Resolved issues
			&issuesResolved,
			&avgResolutionTimeNullable,
			&potholeResolved,
			&streetlightResolved,
			&graffitiResolved,
			&antisocialResolved,
			&flytippingResolved,
			&blockeddrainResolved,
			// Assigned issues
			&issuesAssigned,
			&potholeAssigned,
			&streetlightAssigned,
			&graffitiAssigned,
			&antisocialAssigned,
			&flytippingAssigned,
			&blockeddrainAssigned,
		); err != nil {
			log.Printf("Error scanning row: %v", err)
			// Continue with the next row rather than failing the entire operation
			continue
		}

		// Handle NULL values for avgResolutionTime
		var avgResolutionTime float64
		if avgResolutionTimeNullable.Valid {
			avgResolutionTime = avgResolutionTimeNullable.Float64
		} else {
			avgResolutionTime = 0
		}

		// Look up the engineer
		engineer, found := engineerMap[engineerID]
		if !found {
			log.Printf("Engineer with ID %d not found in engineer map, skipping", engineerID)
			continue // Should never happen with our query, but just in case
		}

		// Ensure avgResolutionTime is a valid number
		if avgResolutionTime < 0 || math.IsNaN(avgResolutionTime) || math.IsInf(avgResolutionTime, 0) {
			log.Printf("Invalid avgResolutionTime value: %v, setting to 0", avgResolutionTime)
			avgResolutionTime = 0
		}

		// Format resolution time
		days := int(avgResolutionTime) / 86400
		hours := (int(avgResolutionTime) % 86400) / 3600
		avgTimeFormatted := fmt.Sprintf("%dd %dh", days, hours)

		// Calculate total issues (resolved + assigned)
		totalIssues := issuesResolved + issuesAssigned

		// Create performance data for this engineer
		performance := &models.EngineerPerformance{
			Engineer:             engineer,
			IssuesResolved:       issuesResolved,
			AvgResolutionTime:    avgTimeFormatted,
			AvgResolutionSeconds: avgResolutionTime,
			ResolvedIssuesByType: map[string]int{
				"POTHOLE":       potholeResolved,
				"STREET_LIGHT":  streetlightResolved,
				"GRAFFITI":      graffitiResolved,
				"ANTI_SOCIAL":   antisocialResolved,
				"FLY_TIPPING":   flytippingResolved,
				"BLOCKED_DRAIN": blockeddrainResolved,
			},
			IssuesAssigned: issuesAssigned,
			AssignedIssuesByType: map[string]int{
				"POTHOLE":       potholeAssigned,
				"STREET_LIGHT":  streetlightAssigned,
				"GRAFFITI":      graffitiAssigned,
				"ANTI_SOCIAL":   antisocialAssigned,
				"FLY_TIPPING":   flytippingAssigned,
				"BLOCKED_DRAIN": blockeddrainAssigned,
			},
			TotalIssues: totalIssues,
		}

		results = append(results, performance)
	}

	// Check for any errors that occurred during iteration
	if err = rows.Err(); err != nil {
		log.Printf("Error iterating over rows: %v", err)
		// Continue with what we have instead of failing completely
	}

	// If we got no results, create empty performance entries for each engineer
	if len(results) == 0 {
		for _, engineer := range engineers {
			performance := &models.EngineerPerformance{
				Engineer:             engineer,
				IssuesResolved:       0,
				AvgResolutionTime:    "0d 0h",
				AvgResolutionSeconds: 0,
				ResolvedIssuesByType: map[string]int{
					"POTHOLE":       0,
					"STREET_LIGHT":  0,
					"GRAFFITI":      0,
					"ANTI_SOCIAL":   0,
					"FLY_TIPPING":   0,
					"BLOCKED_DRAIN": 0,
				},
				IssuesAssigned: 0,
				AssignedIssuesByType: map[string]int{
					"POTHOLE":       0,
					"STREET_LIGHT":  0,
					"GRAFFITI":      0,
					"ANTI_SOCIAL":   0,
					"FLY_TIPPING":   0,
					"BLOCKED_DRAIN": 0,
				},
				TotalIssues: 0,
			}
			results = append(results, performance)
		}
	}

	return results, nil
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
			-- Get all months from created_at (reported issues)
			(SELECT jsonb_object_agg(month, jsonb_build_object('reported', reported_count, 'resolved', COALESCE(resolved_count, 0)))
			 FROM (
			   SELECT 
			     created_months.month,
			     created_months.count AS reported_count,
			     resolved_months.count AS resolved_count
			   FROM (
			     SELECT to_char(created_at, 'YYYY-MM') AS month, COUNT(*) AS count
			     FROM issues
			     WHERE ($1::date IS NULL OR created_at >= $1::date)
			     AND ($2::date IS NULL OR created_at <= $2::date)
			     GROUP BY to_char(created_at, 'YYYY-MM')
			   ) AS created_months
			   LEFT JOIN (
			     SELECT to_char(resolved_at, 'YYYY-MM') AS month, COUNT(*) AS count
			     FROM issues
			     WHERE status = 'RESOLVED'
			     AND resolved_at IS NOT NULL
			     AND ($1::date IS NULL OR resolved_at >= $1::date)
			     AND ($2::date IS NULL OR resolved_at <= $2::date)
			     GROUP BY to_char(resolved_at, 'YYYY-MM')
			   ) AS resolved_months ON created_months.month = resolved_months.month
			 ) AS monthly_stats
			) AS issues_by_month
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
	issuesByMonth := make(map[string]interface{})

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
