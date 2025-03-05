FROM golang:1.23-alpine

# Install build tools and dependencies
RUN apk add --no-cache make git

# Set working directory
WORKDIR /app

# Copy the entire codebase
COPY . .

# Remove the .env file
RUN rm .env

RUN make docker-env-file

# Install build tools
RUN make install-tools

# Generate Swagger docs and build the application
RUN make swagger && make build

# Expose the API port
EXPOSE 8080

# Start the server
CMD ["make", "run"]