package utils

import (
	"github.com/gin-gonic/gin"
	"log"
)

func RespondWithError(c *gin.Context, code int, message string, err error) {
	if err != nil {
		log.Printf("Error: %s", err.Error())
	}
	c.JSON(code, gin.H{"error": message})
}
