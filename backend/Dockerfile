# Build stage
FROM golang:1.19-alpine AS builder

# Install necessary build tools
RUN apk add --no-cache make git

# Set working directory
WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN make build

# Final stage
FROM alpine:3.16

# Install necessary runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/bin/chalkstone-api .

# Copy any necessary files
COPY --from=builder /app/config ./config
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/swagger ./swagger

# Expose the port
EXPOSE 8080

# Run the application
CMD ["./chalkstone-api"]