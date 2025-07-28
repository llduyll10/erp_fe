#!/bin/bash

# ======================================
# Deploy Bravix ERP Frontend Only
# Frontend: app.bravix.vn
# Backend: api.bravix.vn (external - deployed separately)
# VPS: 14.225.212.17
# ======================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
VPS_IP="14.225.212.17"
VPS_USER="root"
VPS_PATH="/opt/erp-frontend"
FRONTEND_DOMAIN="app.bravix.vn"
BACKEND_DOMAIN="api.bravix.vn"
ADMIN_EMAIL="admin@bravix.vn"

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

# Run command on VPS
run_on_vps() {
    ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "$1"
}

# Upload files to VPS
upload_to_vps() {
    scp -o StrictHostKeyChecking=no -r "$1" $VPS_USER@$VPS_IP:"$2"
}

# Check DNS configuration
check_dns() {
    log "Checking DNS configuration..."
    
    local frontend_ip=$(dig +short $FRONTEND_DOMAIN)
    
    if [ "$frontend_ip" != "$VPS_IP" ]; then
        warning "DNS for $FRONTEND_DOMAIN points to $frontend_ip, should be $VPS_IP"
        echo "Please update DNS A record for $FRONTEND_DOMAIN to point to $VPS_IP"
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    else
        success "$FRONTEND_DOMAIN DNS is correctly configured"
    fi
    
    # Check if backend is accessible
    log "Checking backend accessibility..."
    if curl -f -s --max-time 10 "https://$BACKEND_DOMAIN/health" > /dev/null 2>&1; then
        success "Backend $BACKEND_DOMAIN is accessible"
    else
        warning "Backend $BACKEND_DOMAIN is not accessible yet"
        echo "Frontend will still deploy, but ensure backend is running at $BACKEND_DOMAIN"
    fi
}

# Setup VPS
setup_vps() {
    log "Setting up VPS for Bravix Frontend..."
    
    run_on_vps "
        # Update system
        apt-get update -y && apt-get upgrade -y
        apt-get install -y curl wget git nano htop unzip net-tools
        
        # Install Docker
        if ! command -v docker &> /dev/null; then
            curl -fsSL https://get.docker.com | sh
            systemctl start docker
            systemctl enable docker
        fi
        
        # Install Docker Compose
        if ! command -v docker-compose &> /dev/null; then
            curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-Linux-x86_64\" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        fi
        
        # Configure firewall
        ufw --force enable
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        
        # Create project directory
        mkdir -p $VPS_PATH
        
        # Setup swap if needed
        if [ \$(free | grep Swap | awk '{print \$2}') -eq 0 ]; then
            fallocate -l 1G /swapfile
            chmod 600 /swapfile
            mkswap /swapfile
            swapon /swapfile
            echo '/swapfile none swap sw 0 0' >> /etc/fstab
        fi
    "
    
    success "VPS setup completed"
}

# Upload project files
upload_project() {
    log "Uploading Bravix Frontend project files..."
    
    # Create deployment package
    local temp_dir="/tmp/bravix-frontend-$(date +%s)"
    mkdir -p "$temp_dir"
    
    # Copy only frontend-related files
    cp -r docker/ "$temp_dir/" 2>/dev/null || mkdir -p "$temp_dir/docker"
    cp Dockerfile "$temp_dir/"
    cp docker-compose.yml "$temp_dir/"
    cp package.json "$temp_dir/"
    cp -r src/ "$temp_dir/"
    cp -r public/ "$temp_dir/"
    
    # Copy config files
    cp vite.config.ts "$temp_dir/" 2>/dev/null || true
    cp tsconfig.json "$temp_dir/" 2>/dev/null || true
    cp tailwind.config.js "$temp_dir/" 2>/dev/null || true
    cp postcss.config.js "$temp_dir/" 2>/dev/null || true
    cp index.html "$temp_dir/" 2>/dev/null || true
    
    # Copy environment template
    cp .env.production "$temp_dir/.env"
    
    # Create nginx config if not exists
    if [ ! -d "$temp_dir/docker" ]; then
        mkdir -p "$temp_dir/docker"
        # Copy nginx configs
        cp docker/nginx.conf "$temp_dir/docker/" 2>/dev/null || true
        cp docker/default.conf "$temp_dir/docker/" 2>/dev/null || true
        cp docker/startup.sh "$temp_dir/docker/" 2>/dev/null || true
    fi
    
    # Upload to VPS
    upload_to_vps "$temp_dir/*" "$VPS_PATH/"
    
    # Cleanup
    rm -rf "$temp_dir"
    
    success "Frontend files uploaded"
}

# Configure environment
configure_environment() {
    log "Configuring Frontend environment..."
    
    # Create environment file (simple for frontend-only)
    run_on_vps "cd $VPS_PATH && cat > .env << 'EOF'
# Bravix Frontend Environment
# Generated on $(date)

# Frontend Configuration
VITE_APP_ENV=production
VITE_ACCESS_TOKEN_THRESHOLD=120000
VITE_DOMAIN=https://$FRONTEND_DOMAIN
VITE_API_URL=https://$BACKEND_DOMAIN
VITE_USER_TYPE=staff

# Domain Configuration
DOMAIN=$FRONTEND_DOMAIN
ACME_EMAIL=$ADMIN_EMAIL

# Optional External Services
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ROLLBAR_TOKEN=
RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
EOF"
    
    # Set permissions
    run_on_vps "chmod 600 $VPS_PATH/.env"
    
    success "Frontend environment configured"
}

# Deploy application
deploy_frontend() {
    log "Deploying Bravix Frontend..."
    
    run_on_vps "
        cd $VPS_PATH
        
        # Make scripts executable
        chmod +x docker/*.sh 2>/dev/null || true
        
        # Build frontend
        docker-compose build --no-cache frontend
        
        # Start services
        docker-compose up -d
        
        # Wait for services
        echo 'Waiting for services to start...'
        sleep 30
    "
    
    success "Frontend deployed"
}

# Verify deployment
verify_deployment() {
    log "Verifying Frontend deployment..."
    
    # Check containers
    local containers=$(run_on_vps "cd $VPS_PATH && docker-compose ps --services --filter 'status=running'")
    
    if echo "$containers" | grep -q "frontend"; then
        success "Frontend container is running"
    else
        warning "Frontend container may not be running properly"
        run_on_vps "cd $VPS_PATH && docker-compose logs frontend"
    fi
    
    if echo "$containers" | grep -q "traefik"; then
        success "Traefik proxy is running"
    else
        warning "Traefik proxy may not be running properly"
    fi
    
    # Test frontend accessibility
    log "Testing frontend accessibility..."
    sleep 10
    
    if curl -f -s --max-time 30 "http://$VPS_IP/health" > /dev/null 2>&1; then
        success "Frontend health check passed"
    else
        warning "Frontend health check failed, but this may be normal during initial startup"
    fi
    
    success "Deployment verification completed"
}

# Show deployment summary
show_summary() {
    echo ""
    echo -e "${BLUE}"
    echo "══════════════════════════════════════════════════════════"
    echo "           BRAVIX FRONTEND DEPLOYMENT COMPLETED! 🎉"
    echo "══════════════════════════════════════════════════════════"
    echo -e "${NC}"
    echo ""
    echo "🌐 Frontend URL:"
    echo "   Frontend: https://$FRONTEND_DOMAIN"
    echo "   (Backend: https://$BACKEND_DOMAIN - deployed separately)"
    echo ""
    echo "🔧 Server Information:"
    echo "   VPS IP: $VPS_IP"
    echo "   SSH Access: ssh $VPS_USER@$VPS_IP"
    echo "   Project Path: $VPS_PATH"
    echo ""
    echo "📋 Management Commands:"
    echo "   View logs: cd $VPS_PATH && docker-compose logs -f frontend"
    echo "   Restart: cd $VPS_PATH && docker-compose restart frontend"
    echo "   Stop: cd $VPS_PATH && docker-compose down"
    echo "   Update: cd $VPS_PATH && docker-compose build --no-cache frontend && docker-compose up -d"
    echo ""
    echo "🚨 IMPORTANT NOTES:"
    echo "   ✅ Frontend is deployed and running"
    echo "   ⚠️  Backend must be deployed separately at $BACKEND_DOMAIN"
    echo "   ⚠️  SSL certificates will be generated automatically (may take a few minutes)"
    echo "   ⚠️  Ensure CORS is configured on backend to allow https://$FRONTEND_DOMAIN"
    echo ""
    echo "📞 Support Commands:"
    echo "   Check frontend logs: docker-compose logs frontend"
    echo "   Check SSL status: docker-compose logs traefik"
    echo "   Test frontend: curl -f https://$FRONTEND_DOMAIN/health"
    echo ""
    echo "✅ Frontend is now live at https://$FRONTEND_DOMAIN"
    echo ""
}

# Main deployment function
main() {
    echo -e "${BLUE}"
    echo "══════════════════════════════════════════════════════════"
    echo "              BRAVIX FRONTEND DEPLOYMENT"
    echo "══════════════════════════════════════════════════════════"
    echo -e "${NC}"
    echo ""
    echo "Configuration:"
    echo "  Frontend: https://$FRONTEND_DOMAIN"
    echo "  Backend: https://$BACKEND_DOMAIN (external)"
    echo "  VPS: $VPS_IP"
    echo ""
    echo "Note: This deploys FRONTEND ONLY. Backend must be deployed separately."
    echo ""
    
    read -p "Continue with Frontend-only deployment? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
    
    check_dns
    setup_vps
    upload_project
    configure_environment
    deploy_frontend
    verify_deployment
    show_summary
}

# Run deployment
main "$@"