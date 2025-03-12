package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"chalkstone.council/internal/config"
	"chalkstone.council/internal/middleware"
)

func main() {
	// Parse command line arguments
	userType := flag.String("type", "staff", "User type (public or staff)")
	userID := flag.String("id", "test-user", "User ID")
	flag.Parse()

	// Set the exact same JWT_SECRET as used by the server
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	os.Setenv("JWT_SECRET", cfg.JWTSecret)

	// Generate the token
	token, err := middleware.GenerateToken(*userID, *userType)
	if err != nil {
		fmt.Printf("Error generating token: %v\n", err)
		os.Exit(1)
	}

	// Output the token
	fmt.Println("Generated JWT token:")
	fmt.Println(token)
}
