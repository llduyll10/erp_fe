#!/bin/bash

# ======================================
# AUTO DEPLOY SCRIPT FOR BRAVIX FRONTEND
# ======================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="14.225.212.17"
VPS_USER="root"
VPS_PASSWORD="cLFt8mx7ePeLnENkFK7E"
VPS_PATH="/opt/erp-frontend"
GITHUB_REPO="git@github.com:your-username/erp-frontend.git"  # UPDATE THIS
LOCAL_PATH="$(pwd)"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if sshpass is installed
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v sshpass &> /dev/null; then
        warning "sshpass not found. Installing..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install hudochenkov/sshpass/sshpass || error "Failed to install sshpass"
        else
            sudo apt-get update && sudo apt-get install -y sshpass || error "Failed to install sshpass"
        fi
    fi
    success "Dependencies checked"
}

# Execute command on VPS
run_on_vps() {
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "$1"
}

# Upload file to VPS
upload_to_vps() {
    sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no -r "$1" "$VPS_USER@$VPS_IP:$2"
}

# Initial VPS setup
setup_vps() {
    log "Setting up VPS environment..."
    
    run_on_vps "
        # Update system
        apt update && apt upgrade -y
        
        # Install Docker if not exists
        if ! command -v docker &> /dev/null; then
            curl -fsSL https://get.docker.com | sh
            systemctl start docker
            systemctl enable docker
        fi
        
        # Install Docker Compose if not exists
        if ! command -v docker-compose &> /dev/null; then
            curl -L 'https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)' -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        fi
        
        # Create Docker network if not exists
        docker network create erp_network 2>/dev/null || true
        
        # Setup firewall
        ufw --force enable
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 8080/tcp
        
        # Create project directory
        mkdir -p $VPS_PATH
        mkdir -p $VPS_PATH/logs/nginx
        mkdir -p $VPS_PATH/letsencrypt
    "
    
    success "VPS environment ready"
}

# Create required files
create_deployment_files() {
    log "Creating deployment files..."
    
    # Create .env.production
    cat > .env.production << 'EOF'
# API Configuration
VITE_API_URL=https://api.bravix.vn
VITE_APP_URL=https://app.bravix.vn

# App Settings
VITE_APP_NAME=ERP System - Bravix
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
VITE_ACCESS_TOKEN_THRESHOLD=120000
VITE_USER_TYPE=staff

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false

# External Services (Optional)
VITE_GOOGLE_MAPS_KEY=
VITE_SENTRY_DSN=
VITE_GA_ID=
VITE_ROLLBAR_TOKEN=
VITE_RECAPTCHA_SITE_KEY=
EOF

    # Create nginx.conf
    cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name app.bravix.vn;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api {
        proxy_pass https://api.bravix.vn;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        return 200 "OK";
        add_header Content-Type text/plain;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
EOF

    # Create docker-compose.yml for production
    cat > docker-compose.production.yml << 'EOF'
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    container_name: erp_frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs/nginx:/var/log/nginx
    networks:
      - erp_network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`app.bravix.vn`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.frontend.loadbalancer.server.port=80"
      # HTTP to HTTPS redirect
      - "traefik.http.routers.frontend-http.rule=Host(`app.bravix.vn`)"
      - "traefik.http.routers.frontend-http.entrypoints=web"
      - "traefik.http.routers.frontend-http.middlewares=redirect-to-https"
      - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"

  traefik:
    image: traefik:v2.10
    container_name: erp_traefik
    restart: unless-stopped
    command:
      - "--api.dashboard=true"
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@bravix.vn"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--log.level=INFO"
      - "--accesslog=true"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
    networks:
      - erp_network

networks:
  erp_network:
    external: true
EOF

    success "Deployment files created"
}

# Upload project to VPS
upload_project() {
    log "Uploading project files to VPS..."
    
    # Create a temporary directory for upload
    local temp_dir="/tmp/erp-frontend-$(date +%s)"
    mkdir -p "$temp_dir"
    
    # Copy necessary files
    cp -r src/ "$temp_dir/"
    cp -r public/ "$temp_dir/"
    cp -r docker/ "$temp_dir/" 2>/dev/null || mkdir -p "$temp_dir/docker"
    cp package.json "$temp_dir/"
    cp yarn.lock "$temp_dir/"
    cp tsconfig*.json "$temp_dir/" 2>/dev/null || true
    cp vite.config.ts "$temp_dir/" 2>/dev/null || true
    cp index.html "$temp_dir/"
    cp Dockerfile "$temp_dir/"
    cp docker-compose.yml "$temp_dir/" 2>/dev/null || true
    cp docker-compose.production.yml "$temp_dir/"
    cp nginx.conf "$temp_dir/"
    cp .env.production "$temp_dir/"
    cp tailwind.config.js "$temp_dir/" 2>/dev/null || true
    cp postcss.config.js "$temp_dir/" 2>/dev/null || true
    
    # Upload to VPS
    cd "$temp_dir"
    sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no -r . "$VPS_USER@$VPS_IP:$VPS_PATH/"
    cd "$LOCAL_PATH"
    
    # Cleanup
    rm -rf "$temp_dir"
    
    success "Project files uploaded"
}

# Deploy on VPS
deploy_on_vps() {
    log "Deploying application on VPS..."
    
    run_on_vps "
        cd $VPS_PATH
        
        # Use production docker-compose
        cp docker-compose.production.yml docker-compose.yml
        
        # Build and deploy
        echo '🏗️ Building Docker images...'
        docker-compose build --no-cache
        
        echo '🔄 Starting services...'
        docker-compose down 2>/dev/null || true
        docker-compose up -d
        
        # Wait for services to start
        sleep 10
        
        # Check status
        docker-compose ps
    "
    
    success "Application deployed"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check container status
    local status=$(run_on_vps "cd $VPS_PATH && docker-compose ps --services --filter 'status=running' | wc -l")
    
    if [ "$status" -ge 2 ]; then
        success "All services are running"
    else
        warning "Some services may not be running properly"
        run_on_vps "cd $VPS_PATH && docker-compose logs --tail=50"
    fi
    
    # Test endpoints
    log "Testing endpoints..."
    
    # Test HTTP redirect
    if curl -s -o /dev/null -w "%{http_code}" "http://$VPS_IP" | grep -q "301\|302"; then
        success "HTTP to HTTPS redirect working"
    fi
    
    # Test frontend health
    if curl -s -o /dev/null -w "%{http_code}" "http://$VPS_IP/health" | grep -q "200"; then
        success "Frontend health check passed"
    fi
    
    success "Deployment verification completed"
}

# Show deployment info
show_info() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}       🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "📌 Access Information:"
    echo "   Frontend URL: https://app.bravix.vn"
    echo "   Traefik Dashboard: http://$VPS_IP:8080"
    echo ""
    echo "🔧 Management Commands:"
    echo "   SSH to VPS: ssh $VPS_USER@$VPS_IP"
    echo "   View logs: docker-compose logs -f frontend"
    echo "   Restart: docker-compose restart"
    echo ""
    echo "📝 Notes:"
    echo "   - SSL certificates will be auto-generated"
    echo "   - Ensure DNS A record points to $VPS_IP"
    echo "   - Backend should be running at https://api.bravix.vn"
    echo ""
}

# Main deployment flow
main() {
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}        BRAVIX FRONTEND AUTO DEPLOYMENT${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Target VPS: $VPS_IP"
    echo "Frontend Domain: https://app.bravix.vn"
    echo "Backend API: https://api.bravix.vn"
    echo ""
    
    read -p "Continue with deployment? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
    
    # Run deployment steps
    check_dependencies
    setup_vps
    create_deployment_files
    upload_project
    deploy_on_vps
    verify_deployment
    show_info
}

# Run main function
main "$@"