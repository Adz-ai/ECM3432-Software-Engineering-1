package api

import (
	"chalkstone.council/internal/database"
	"chalkstone.council/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, db *database.DB) {
	handler := NewHandler(db)
	api := r.Group("/api")

	// Auth routes
	auth := api.Group("/auth")
	{
		auth.POST("/login", handler.Login)
		auth.POST("/register", handler.Register)
	}

	// Public routes
	public := api.Group("/issues")
	{
		public.POST("", handler.CreateIssue)
		public.GET("/:id", handler.GetIssue)
		public.GET("/map", handler.GetIssuesForMap)
		public.GET("/analytics", handler.GetIssueAnalytics)
	}

	// Protected routes
	staff := api.Group("/issues", middleware.AuthMiddleware(), middleware.StaffOnly())
	{
		staff.PUT("/:id", handler.UpdateIssue)
		staff.GET("", handler.ListIssues)
		staff.GET("/search", handler.SearchIssues)
	}
}
