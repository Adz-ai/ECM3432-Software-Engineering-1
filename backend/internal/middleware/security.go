package middleware

import "github.com/gin-gonic/gin"

// SecurityHeadersMiddleware adds common security headers to responses.
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Strict-Transport-Security (HSTS): Force HTTPS. 
		// max-age is in seconds (e.g., 1 year). Start with a lower value during testing.
		// Consider adding 'includeSubDomains' and 'preload' later if applicable.
		c.Header("Strict-Transport-Security", "max-age=63072000; includeSubDomains") // max-age=1 year

		// X-Content-Type-Options: Prevent MIME-sniffing.
		c.Header("X-Content-Type-Options", "nosniff")

		// X-Frame-Options: Prevent clickjacking. DENY is most restrictive.
		c.Header("X-Frame-Options", "DENY")

		// Content-Security-Policy (CSP): Mitigates XSS. This is a basic policy.
		// Adjust 'script-src', 'style-src', 'img-src', 'connect-src', etc., based on your frontend needs.
		// 'self' allows resources from the same origin.
		// For development, you might need 'unsafe-inline' or 'unsafe-eval' temporarily, but avoid in production.
		c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: http://localhost:9000; connect-src 'self'; frame-ancestors 'none';")
		// Note: Added 'unsafe-inline' for styles (common for UI libs), data: and http://localhost:9000 for MinIO images in img-src. Adjust as needed.

		// Referrer-Policy: Control how much referrer info is sent.
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		// Permissions-Policy: Control browser feature access. Example disables microphone/camera.
		c.Header("Permissions-Policy", "microphone=(), camera=()") 

		c.Next()
	}
}
