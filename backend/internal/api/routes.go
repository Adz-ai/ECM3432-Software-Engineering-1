package api

import (
	"chalkstone.council/internal/database"
	"chalkstone.council/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, db database.DatabaseOperations, auth middleware.Authenticator) {
	handler := NewHandler(db)
	api := r.Group("/api")

	// Auth routes
	authGroup := api.Group("/auth")
	{
		authGroup.POST("/login", handler.Login)
		authGroup.POST("/register", handler.Register)
	}

	// Public routes
	public := api.Group("/issues")
	{
		public.GET("/map", handler.GetIssuesForMap)
	}

	// Authenticated routes
	authenticatedUser := api.Group("/issues")
	authenticatedUser.Use(auth.AuthMiddleware())
	{
		authenticatedUser.POST("", handler.CreateIssue)
		authenticatedUser.GET("/:id", handler.GetIssue)

	}

	// Staff Protected routes
	staff := api.Group("/issues")
	staff.Use(auth.AuthMiddleware(), auth.StaffOnly())
	{
		staff.PUT("/:id", handler.UpdateIssue)
		staff.GET("", handler.ListIssues)
		staff.GET("/search", handler.SearchIssues)
		staff.GET("/analytics", handler.GetIssueAnalytics)
	}
}
