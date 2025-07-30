#!/bin/bash

# ====================================================
# DEPLOY ERP FRONTEND TO VPS WITH NGINX AND HTTPS
# VPS: 14.225.212.17 | Domain: app.bravix.vn
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
VPS_USER="ubuntu"
DOMAIN="app.bravix.vn"
PROJECT_DIR="/home/ubuntu/erp_fe"

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

# Main deployment function
main() {
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo -e "${BLUE}     ERP FRONTEND NGINX HTTPS DEPLOYMENT${NC}"
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo ""
    echo "🎯 Target VPS: $VPS_IP"
    echo "🌐 Domain: $DOMAIN"
    echo "📁 Project Dir: $PROJECT_DIR"
    echo ""
    
    # Step 1: Push changes to git
    log "Pushing latest changes to git..."
    git add .
    git commit -m "Deploy: Configure Nginx with HTTPS support" || echo "No changes to commit"
    git push origin main
    success "Code pushed to repository"
    
    # Step 2: Deploy to VPS
    log "Deploying to VPS..."
    ssh ubuntu@$VPS_IP << 'ENDSSH'
        set -e
        
        # Navigate to project directory
        cd /home/ubuntu/erp_fe
        
        echo "📥 Pulling latest changes..."
        git pull origin main
        
        # Stop existing containers
        echo "🛑 Stopping existing containers..."
        docker-compose down || true
        
        # Clean up old images
        echo "🧹 Cleaning up old images..."
        docker image prune -f || true
        
        # Build and start containers
        echo "🏗️  Building and starting containers..."
        docker-compose up -d --build
        
        echo "✅ Deployment completed!"
        echo "📊 Container status:"
        docker-compose ps
ENDSSH
    
    success "Application deployed successfully!"
    
    # Show next steps
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo -e "${GREEN}    🎉 DEPLOYMENT COMPLETED! 🎉${NC}"
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo ""
    echo "📝 Next steps for HTTPS setup:"
    echo ""
    echo "1. Install Certbot on VPS:"
    echo "   sudo apt update"
    echo "   sudo apt install certbot -y"
    echo ""
    echo "2. Stop containers temporarily:"
    echo "   docker-compose down"
    echo ""
    echo "3. Get SSL certificate:"
    echo "   sudo certbot certonly --standalone -d $DOMAIN"
    echo ""
    echo "4. Start containers again:"
    echo "   docker-compose up -d"
    echo ""
    echo "🌐 Your application will be available at:"
    echo "   HTTP:  http://$DOMAIN"
    echo "   HTTPS: https://$DOMAIN (after SSL setup)"
    echo ""
    echo "🔧 Management commands on VPS:"
    echo "   ssh ubuntu@$VPS_IP"
    echo "   cd $PROJECT_DIR"
    echo "   docker-compose logs -f"
    echo "   docker-compose restart"
    echo ""
}

# Run main function
main "$@"