// cmd/api/main.go
package main

import (
	"chalkstone.council/docs"
	"chalkstone.council/internal/api"
	"chalkstone.council/internal/config"
	"chalkstone.council/internal/database"
	"chalkstone.council/internal/middleware"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           Chalkstone Council Reports API
// @version         1.0
// @description     API for managing city council reports and issues
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api

// @SecurityDefinitions.apiKey Bearer
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.
func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	db, err := database.InitDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := database.RunMigrations(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	defer func() {
		if dbInstance, ok := db.(*database.DB); ok {
			if err := dbInstance.Close(); err != nil {
				log.Fatalf("Failed to close database: %v", err)
			}
		}
	}()

	r := gin.Default()

	// Swagger docs
	docs.SwaggerInfo.BasePath = "/api"
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Middleware
	r.Use(middleware.Logging())
	r.Use(middleware.RateLimit(middleware.NewIPRateLimiter(2, 5))) // 2 requests per second, burst of 5
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:8080", "http://localhost:3000", "http://localhost:4200"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Create an instance of RealAuth
	auth := &middleware.RealAuth{}

	// Setup routes with injected authentication middleware
	api.SetupRoutes(r, db, auth)

	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
