package models

import (
	"time"
)

// Engineer represents a council engineer
type Engineer struct {
	ID             int64     `json:"id" db:"id"`
	Name           string    `json:"name" db:"name"`
	Email          string    `json:"email" db:"email"`
	Phone          string    `json:"phone" db:"phone"`
	Specialization string    `json:"specialization" db:"specialization"`
	JoinDate       time.Time `json:"join_date" db:"join_date"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
}

// EngineerPerformance tracks the performance metrics for an engineer
type EngineerPerformance struct {
	Engineer             *Engineer       `json:"engineer"`
	// Resolved issues
	IssuesResolved       int             `json:"issues_resolved"`
	AvgResolutionTime    string          `json:"avg_resolution_time"`
	AvgResolutionSeconds float64         `json:"avg_resolution_seconds"`
	ResolvedIssuesByType map[string]int  `json:"resolved_issues_by_type"`
	// Currently assigned issues
	IssuesAssigned       int             `json:"issues_assigned"`
	AssignedIssuesByType map[string]int  `json:"assigned_issues_by_type"`
	// Total issues (resolved + assigned)
	TotalIssues          int             `json:"total_issues"`
}
