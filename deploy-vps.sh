#!/bin/bash

# ====================================================
# DEPLOY SCRIPT FOR ERP FRONTEND TO VPS
# VPS: 14.225.212.17 | User: root | Path: /opt/erp-frontend
# ====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# VPS Configuration
VPS_IP="14.225.212.17"
VPS_USER="root"
VPS_PASSWORD="cLFt8mx7ePeLnENkFK7E"
VPS_PATH="/opt/erp-frontend"
GITHUB_REPO="https://github.com/llduyll10/erp_fe.git"

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

# Check dependencies
check_deps() {
    log "Checking dependencies..."
    
    if ! command -v sshpass &> /dev/null; then
        warning "Installing sshpass..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install hudochenkov/sshpass/sshpass || error "Failed to install sshpass"
        else
            sudo apt-get update && sudo apt-get install -y sshpass || error "Failed to install sshpass"
        fi
    fi
    success "Dependencies ready"
}

# Execute command on VPS
run_vps() {
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "$1"
}

# Upload file to VPS
upload_vps() {
    sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no -r "$1" "$VPS_USER@$VPS_IP:$2"
}

# Setup VPS environment
setup_vps() {
    log "Setting up VPS environment..."
    
    run_vps "
        # Update system
        apt update && apt upgrade -y
        
        # Install required packages
        apt install -y curl git nodejs npm docker.io docker-compose
        
        # Start Docker
        systemctl start docker
        systemctl enable docker
        
        # Create Docker network
        docker network create erp_network 2>/dev/null || true
        
        # Setup firewall
        ufw --force enable
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        
        # Create project directory
        mkdir -p $VPS_PATH
        chown -R $VPS_USER:$VPS_USER $VPS_PATH
    "
    
    success "VPS environment ready"
}

# Deploy application
deploy_app() {
    log "Deploying application..."
    
    run_vps "
        cd $VPS_PATH
        
        # Clone or update repository
        if [ -d '.git' ]; then
            git pull origin main
        else
            git clone $GITHUB_REPO .
        fi
        
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
EOF

        # Create docker-compose.yml for production
        cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: erp_frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - VITE_API_URL=https://api.bravix.vn
      - VITE_APP_URL=https://app.bravix.vn
    ports:
      - '80:80'
    networks:
      - erp_network
    volumes:
      - ./logs:/var/log/nginx

networks:
  erp_network:
    external: true
EOF

        # Build and start
        docker-compose down 2>/dev/null || true
        docker-compose build --no-cache
        docker-compose up -d
        
        # Check status
        sleep 5
        docker-compose ps
    "
    
    success "Application deployed"
}

# Verify deployment
verify_deploy() {
    log "Verifying deployment..."
    
    # Check container status
    local status=$(run_vps "docker ps --filter 'name=erp_frontend' --format '{{.Status}}' | grep -c 'Up'")
    
    if [ "$status" -ge 1 ]; then
        success "Frontend container is running"
    else
        warning "Frontend container may not be running"
        run_vps "cd $VPS_PATH && docker-compose logs frontend"
    fi
    
    # Test health endpoint
    sleep 5
    if curl -s -o /dev/null -w "%{http_code}" "http://$VPS_IP/health" | grep -q "200"; then
        success "Health check passed"
    else
        warning "Health check failed"
    fi
    
    success "Deployment verified"
}

# Show deployment info
show_info() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo -e "${GREEN}    🎉 DEPLOYMENT COMPLETED! 🎉${NC}"
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo ""
    echo "📌 Application URLs:"
    echo "   Frontend: http://$VPS_IP"
    echo "   Health: http://$VPS_IP/health"
    echo ""
    echo "🔧 Management Commands:"
    echo "   SSH: ssh $VPS_USER@$VPS_IP"
    echo "   Logs: docker-compose logs -f frontend"
    echo "   Restart: docker-compose restart frontend"
    echo ""
    echo "📂 Application Path: $VPS_PATH"
    echo ""
}

# Main deployment function
main() {
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo -e "${BLUE}     ERP FRONTEND VPS DEPLOYMENT${NC}"
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo ""
    echo "🎯 Target VPS: $VPS_IP"
    echo "📁 Deploy Path: $VPS_PATH"
    echo "🔗 Repository: $GITHUB_REPO"
    echo ""
    
    read -p "Continue with deployment? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
    
    # Execute deployment
    check_deps
    setup_vps
    deploy_app
    verify_deploy
    show_info
}

# Run main function
main "$@"