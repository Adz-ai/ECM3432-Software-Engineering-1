package models

import (
	"time"
)

type IssueStatus string

const (
	StatusNew        IssueStatus = "NEW"
	StatusInProgress IssueStatus = "IN_PROGRESS"
	StatusResolved   IssueStatus = "RESOLVED"
	StatusClosed     IssueStatus = "CLOSED"
)

type IssueType string

const (
	TypePothole      IssueType = "POTHOLE"
	TypeStreetLight  IssueType = "STREET_LIGHT"
	TypeGraffiti     IssueType = "GRAFFITI"
	TypeAntiSocial   IssueType = "ANTI_SOCIAL"
	TypeFlyTipping   IssueType = "FLY_TIPPING"
	TypeBlockedDrain IssueType = "BLOCKED_DRAIN"
)

func ValidateIssueType(t IssueType) bool {
	switch t {
	case TypePothole, TypeStreetLight, TypeGraffiti, TypeAntiSocial, TypeFlyTipping, TypeBlockedDrain:
		return true
	}
	return false
}

func ValidateIssueStatus(s IssueStatus) bool {
	switch s {
	case StatusNew, StatusInProgress, StatusResolved, StatusClosed:
		return true
	}
	return false
}

type Issue struct {
	ID          int64       `json:"id" db:"id"`
	Type        IssueType   `json:"type" db:"type"`
	Status      IssueStatus `json:"status" db:"status"`
	Description string      `json:"description" db:"description"`
	Location    struct {
		Latitude  float64 `json:"latitude" db:"latitude"`
		Longitude float64 `json:"longitude" db:"longitude"`
	} `json:"location"`
	Images     []string  `json:"images" db:"images"`
	ReportedBy string    `json:"reported_by" db:"reported_by"`
	AssignedTo *string   `json:"assigned_to,omitempty" db:"assigned_to"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`
}

type IssueCreate struct {
	Type        IssueType `json:"type" binding:"required"`
	Description string    `json:"description" binding:"required"`
	Location    struct {
		Latitude  float64 `json:"latitude" binding:"required"`
		Longitude float64 `json:"longitude" binding:"required"`
	} `json:"location" binding:"required"`
	Images     []string `json:"images"`
	ReportedBy string   `json:"reported_by" binding:"required"`
}

type IssueUpdate struct {
	Status     *IssueStatus `json:"status,omitempty"`
	AssignedTo *string      `json:"assigned_to,omitempty"`
}
