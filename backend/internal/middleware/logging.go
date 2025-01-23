package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"time"
)

func Logging() gin.HandlerFunc {
	log := logrus.New()
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path

		c.Next()

		latency := time.Since(start)
		statusCode := c.Writer.Status()

		log.WithFields(logrus.Fields{
			"status":  statusCode,
			"latency": latency,
			"path":    path,
			"method":  c.Request.Method,
			"ip":      c.ClientIP(),
		}).Info("request completed")
	}
}
