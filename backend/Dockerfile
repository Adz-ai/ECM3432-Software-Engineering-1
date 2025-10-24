# Build stage
FROM golang:1.25-bookworm AS builder

# Install build tools and dependencies
RUN apt-get update && apt-get install -y make git && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy go mod files first for better caching
COPY go.mod go.sum ./
RUN go mod download

# Copy Makefile first
COPY Makefile ./
RUN make install-tools

# Copy the rest of the codebase
COPY . .

# Use Docker-specific environment file
COPY .env.docker /app/.env

# Generate Swagger docs and build the application
RUN make swagger && CGO_ENABLED=0 GOOS=linux make build

# Verify the binary was created
RUN ls -la

# Runtime stage - using distroless for minimal image size and security
FROM debian:12-slim

# Add non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Install wget for health check
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy only the built binary and necessary files from builder
COPY --from=builder /app/chalkstone-council-api /app/server
COPY --from=builder /app/.env /app/
COPY --from=builder /app/migrations /app/migrations

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose the API port
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

# Start the server
CMD ["/app/server"]