package api

import (
	"chalkstone.council/internal/database"
	"chalkstone.council/internal/middleware"
	"chalkstone.council/internal/models"
	"chalkstone.council/internal/utils"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	db *database.DB
}

func NewHandler(db *database.DB) *Handler {
	return &Handler{db: db}
}

// @Summary Create new issue
// @Description Create a new issue report
// @Tags issues
// @Accept json
// @Produce json
// @Param issue body models.IssueCreate true "Issue details"
// @Success 201 {object} map[string]int64
// @Failure 400 {object} map[string]string
// @Security Bearer
// @Router /issues [post]
func (h *Handler) CreateIssue(c *gin.Context) {
	// Authenticate user
	_, exists := c.Get("userID")
	if !exists {
		utils.RespondWithError(c, http.StatusUnauthorized, "Unauthorized access", nil)
		return
	}

	var issue models.IssueCreate
	if err := c.ShouldBindJSON(&issue); err != nil {
		utils.RespondWithError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	if !models.ValidateIssueType(issue.Type) {
		utils.RespondWithError(c, http.StatusBadRequest, "Invalid issue type", nil)
		return
	}

	id, err := h.db.CreateIssue(&issue)
	if err != nil {
		utils.RespondWithError(c, http.StatusInternalServerError, "Failed to create issue", err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": id})
}

// @Summary Update issue
// @Description Update an existing issue
// @Tags issues
// @Accept json
// @Produce json
// @Param id path int true "Issue ID"
// @Param issue body models.IssueUpdate true "Issue update details"
// @Success 200 {object} map[string]string
// @Failure 400,404 {object} map[string]string
// @Security Bearer
// @Router /issues/{id} [put]
func (h *Handler) UpdateIssue(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		utils.RespondWithError(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	var update models.IssueUpdate
	if err := c.ShouldBindJSON(&update); err != nil {
		utils.RespondWithError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	if update.Status != nil && !models.ValidateIssueStatus(*update.Status) {
		utils.RespondWithError(c, http.StatusBadRequest, "Invalid issue status", nil)
		return
	}

	// Staff authorization check
	userType, _ := c.Get("userType")
	if userType != "staff" {
		utils.RespondWithError(c, http.StatusForbidden, "Staff access required", nil)
		return
	}

	if err := h.db.UpdateIssue(id, &update); err != nil {
		utils.RespondWithError(c, http.StatusInternalServerError, "Failed to update issue", err)
		return
	}

	c.Status(http.StatusOK)
}

// @Summary Get issue by ID
// @Description Retrieve an issue by its ID
// @Tags issues
// @Produce json
// @Param id path int true "Issue ID"
// @Success 200 {object} models.Issue
// @Failure 404 {object} map[string]string
// @Security Bearer
// @Router /issues/{id} [get]
func (h *Handler) GetIssue(c *gin.Context) {
	// Authenticate user
	_, exists := c.Get("userID")
	if !exists {
		utils.RespondWithError(c, http.StatusUnauthorized, "Unauthorized access", nil)
		return
	}

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		utils.RespondWithError(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	issue, err := h.db.GetIssue(id)
	if err != nil {
		utils.RespondWithError(c, http.StatusInternalServerError, "Failed to get issue", err)
		return
	}

	if issue == nil {
		utils.RespondWithError(c, http.StatusNotFound, "Issue not found", nil)
		return
	}

	c.JSON(http.StatusOK, issue)
}

// @Summary List issues
// @Description Get paginated list of issues
// @Tags issues
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param pageSize query int false "Page size" default(10)
// @Success 200 {array} models.Issue
// @Failure 500 {object} map[string]string
// @Security Bearer
// @Router /issues [get]
func (h *Handler) ListIssues(c *gin.Context) {
	// Authenticate user
	_, exists := c.Get("userID")
	if !exists {
		utils.RespondWithError(c, http.StatusUnauthorized, "Unauthorized access", nil)
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	// Validate pagination parameters
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	issues, err := h.db.ListIssues(page, pageSize)
	if err != nil {
		utils.RespondWithError(c, http.StatusInternalServerError, "Failed to list issues", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"page":     page,
		"pageSize": pageSize,
		"issues":   issues,
	})
}

// @Summary Get issues for map
// @Description Retrieve issue locations and types for the map view
// @Tags issues
// @Produce json
// @Success 200 {array} object{type=string,location=object{latitude=float64,longitude=float64},status=string}
// @Failure 500 {object} map[string]string
// @Router /issues/map [get]
func (h *Handler) GetIssuesForMap(c *gin.Context) {
	issues, err := h.db.GetIssuesForMap()
	if err != nil {
		utils.RespondWithError(c, http.StatusInternalServerError, "Failed to retrieve issues for map", err)
		return
	}

	mapIssues := make([]map[string]interface{}, len(issues))
	for i, issue := range issues {
		mapIssues[i] = map[string]interface{}{
			"type": issue.Type,
			"location": map[string]float64{
				"latitude":  issue.Location.Latitude,
				"longitude": issue.Location.Longitude,
			},
			"status": issue.Status,
		}
	}

	c.JSON(http.StatusOK, mapIssues)
}

// @Summary Search issues
// @Description Search issues by type and status
// @Tags issues
// @Produce json
// @Param type query string false "Issue type"
// @Param status query string false "Issue status"
// @Success 200 {array} models.Issue
// @Failure 400 {object} map[string]string
// @Security Bearer
// @Router /issues/search [get]
func (h *Handler) SearchIssues(c *gin.Context) {
	issueType := c.Query("type")
	status := c.Query("status")

	if issueType != "" && !models.ValidateIssueType(models.IssueType(issueType)) {
		utils.RespondWithError(c, http.StatusBadRequest, "Invalid issue type", nil)
		return
	}

	if status != "" && !models.ValidateIssueStatus(models.IssueStatus(status)) {
		utils.RespondWithError(c, http.StatusBadRequest, "Invalid status", nil)
		return
	}

	issues, err := h.db.SearchIssues(issueType, status)
	if err != nil {
		utils.RespondWithError(c, http.StatusInternalServerError, "Failed to search issues", err)
		return
	}

	c.JSON(http.StatusOK, issues)
}

// @Summary User login
// @Description Authenticate user and receive JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param credentials body object{username=string,password=string} true "Login credentials"
// @Success 200 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/login [post]
func (h *Handler) Login(c *gin.Context) {
	var creds struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&creds); err != nil {
		log.Printf("Invalid credentials: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.db.GetUserByUsername(creds.Username)
	if err != nil {
		log.Printf("Get user error: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if !utils.CheckPasswordHash(creds.Password, user.PasswordHash) {
		log.Printf("Invalid credentials")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := middleware.GenerateToken(user.Username, user.UserType)
	if err != nil {
		log.Printf("Generate token error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}

// @Summary Register new user
// @Description Register a new user account
// @Tags auth
// @Accept json
// @Produce json
// @Param user body object{username=string,password=string,is_staff=boolean} true "User registration details"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /auth/register [post]
func (h *Handler) Register(c *gin.Context) {
	var reg struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		IsStaff  bool   `json:"is_staff"`
	}

	if err := c.ShouldBindJSON(&reg); err != nil {
		log.Printf("Invalid registration details: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := utils.HashPassword(reg.Password)
	if err != nil {
		log.Printf("Hash password error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
		return
	}

	userType := "public"
	if reg.IsStaff {
		userType = "staff"
	}

	err = h.db.CreateUser(reg.Username, hashedPassword, userType)
	if err != nil {
		log.Printf("Create user error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	token, err := middleware.GenerateToken(reg.Username, userType)
	if err != nil {
		log.Printf("Generate token error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}
