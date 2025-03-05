# Build stage
FROM node:23-alpine AS builder

# Install make
RUN apk update && apk add --no-cache make

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Use npm install instead of npm ci to resolve dependency conflicts
RUN npm install

# Copy the source code
COPY . .

# Remove the .env file
RUN rm .env

RUN make generate-env

# Build the React application
RUN npm run build

# Production stage
FROM nginx:1.23-alpine

# Copy built assets from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]