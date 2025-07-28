# ======================================
# Multi-stage Docker build for ERP Frontend
# ======================================

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files for dependency installation
COPY package.json yarn.lock ./

# Install dependencies using yarn
RUN yarn install --frozen-lockfile --network-timeout 100000 && \
    yarn cache clean

# Copy source code
COPY . .

# Build the application
RUN yarn build

# ======================================
# Stage 2: Production stage
FROM nginx:alpine AS production

# Install bash for startup scripts
RUN apk add --no-cache bash

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Copy startup script for environment variable injection
COPY docker/startup.sh /docker-entrypoint.d/startup.sh
RUN chmod +x /docker-entrypoint.d/startup.sh

# Create environment template file for runtime injection
COPY docker/env.template.js /usr/share/nginx/html/env.template.js

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]