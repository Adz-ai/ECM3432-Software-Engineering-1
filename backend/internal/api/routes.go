package api

import (
	"chalkstone.council/internal/database"
	"chalkstone.council/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, db database.DatabaseOperations, auth middleware.Authenticator) {
	// Add health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	handler := NewHandler(db)
	api := r.Group("/api")

	// Auth routes
	authGroup := api.Group("/auth")
	{
		authGroup.POST("/login", handler.Login)
		authGroup.POST("/register", handler.Register)
	}

	// Issues - Public routes
	public := api.Group("/issues")
	{
		public.GET("/map", handler.GetIssuesForMap)
	}

	// Issues - Authenticated routes
	authenticatedUser := api.Group("/issues")
	authenticatedUser.Use(auth.AuthMiddleware())
	{
		authenticatedUser.POST("", handler.CreateIssue)
		authenticatedUser.GET("/:id", handler.GetIssue)

	}

	// Issues - Staff Protected routes
	staff := api.Group("/issues")
	staff.Use(auth.AuthMiddleware(), auth.StaffOnly())
	{
		staff.PUT("/:id", handler.UpdateIssue)
		staff.GET("", handler.ListIssues)
		staff.GET("/search", handler.SearchIssues)
		staff.GET("/analytics", handler.GetIssueAnalytics)
	}

	// Engineers - Staff Protected routes
	engineers := api.Group("/engineers")
	engineers.Use(auth.AuthMiddleware(), auth.StaffOnly())
	{
		engineers.GET("", handler.ListEngineers)
		engineers.GET("/:id", handler.GetEngineer)
	}

	// Analytics - Staff Protected routes
	analytics := api.Group("/analytics")
	analytics.Use(auth.AuthMiddleware(), auth.StaffOnly())
	{
		analytics.GET("/engineers", handler.EngineerPerformance)
		analytics.GET("/resolution-time", handler.ResolutionTime)
	}
}
