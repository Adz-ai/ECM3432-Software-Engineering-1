# Build stage
FROM node:20-alpine AS builder

# No need for make anymore

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Use npm ci for more reliable production builds
RUN npm ci --only=production

# Copy the configuration files needed for build
COPY public ./public
COPY .env.docker ./.env

# Copy the source code (leveraging Docker layer caching)
COPY src ./src

# Build with production optimizations
RUN npm run build

# Production stage
FROM nginx:1.25-alpine

# Create a custom nginx.conf for running as non-root user
RUN echo '\
daemon off;\
worker_processes auto;\
pid /tmp/nginx.pid;\
\
events {\
    worker_connections 1024;\
}\
\
http {\
    include       /etc/nginx/mime.types;\
    default_type  application/octet-stream;\
\
    sendfile        on;\
    keepalive_timeout  65;\
\
    # Custom log paths that are writable by non-root\
    access_log /tmp/nginx_access.log;\
    error_log /tmp/nginx_error.log;\
\
    server {\
        listen 80;\
        root /usr/share/nginx/html;\
        index index.html;\
        \
        # Support for SPA routing\
        location / {\
            try_files $uri $uri/ /index.html;\
        }\
        \
        # Cache static assets\
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {\
            expires 30d;\
            add_header Cache-Control "public, no-transform";\
        }\
    }\
}\
' > /etc/nginx/nginx.conf

# Remove default conf.d to avoid conflicts
RUN rm -rf /etc/nginx/conf.d/*

# Copy built assets from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install wget for health check
RUN apk add --no-cache wget

# Create temp directories for nginx
RUN mkdir -p /tmp

# Update permissions
RUN chown -R appuser:appgroup /var/cache/nginx /usr/share/nginx/html /tmp

# Use non-root user
USER appuser

# Expose port
EXPOSE 80

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

# Start Nginx using our custom configuration
CMD ["nginx"]