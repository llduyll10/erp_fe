# Frontend Deployment Guide for VPS

## 📋 Thông tin VPS và Domain

```bash
# VPS Info
IP: 14.225.212.17
Username: root
Password: cLFt8mx7ePeLnENkFK7E
SSH Port: 22

# Domains
Frontend: https://app.bravix.vn
Backend API: https://api.bravix.vn
```

## 🚀 Deploy Frontend Step-by-Step

### 1. SSH vào VPS

```bash
ssh root@14.225.212.17
```

### 2. Chuẩn bị thư mục cho Frontend

```bash
# Tạo thư mục frontend
mkdir -p /opt/erp-frontend
cd /opt/erp-frontend
```

### 3. Clone Frontend Repository

```bash
# Clone repo (thay YOUR_REPO_URL)
git clone YOUR_FRONTEND_REPO_URL .
# hoặc
git clone https://github.com/your-username/erp-frontend.git .
```

### 4. Tạo file .env.production cho Frontend

```bash
nano .env.production
```

Nội dung file .env.production:

```env
# API Configuration
VITE_API_URL=https://api.bravix.vn
VITE_APP_URL=https://app.bravix.vn

# App Settings
VITE_APP_NAME="ERP System - Bravix"
VITE_APP_VERSION=1.0.0

# Storage/Upload URL
VITE_STORAGE_URL=https://api.bravix.vn/uploads

# Optional: Google Maps, Analytics, etc
VITE_GOOGLE_MAPS_KEY=your_google_maps_key
VITE_GA_ID=your_google_analytics_id
```

### 5. Tạo Dockerfile cho Frontend

```bash
nano Dockerfile
```

```dockerfile
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 6. Tạo nginx.conf

```bash
nano nginx.conf
```

```nginx
server {
    listen 80;
    server_name app.bravix.vn;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 7. Tạo docker-compose.yml cho Frontend

```bash
nano docker-compose.yml
```

```yaml
version: "3.8"

services:
  frontend:
    build: .
    container_name: erp_frontend
    restart: unless-stopped
    networks:
      - erp_network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`app.bravix.vn`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.frontend.loadbalancer.server.port=80"

networks:
  erp_network:
    external: true
```

### 8. Build và Deploy

```bash
# Build image
docker-compose build

# Start container
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 9. Setup SSL với Certbot (nếu chưa có Traefik)

```bash
# Install certbot
apt update && apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d app.bravix.vn

# Auto renew
echo "0 0 * * * root certbot renew --quiet" >> /etc/crontab
```

## 📝 Scripts hữu ích

### deploy-frontend.sh

```bash
#!/bin/bash
cd /opt/erp-frontend
git pull origin main
docker-compose build
docker-compose up -d
echo "✅ Frontend deployed successfully!"
```

### update-frontend-env.sh

```bash
#!/bin/bash
cd /opt/erp-frontend
cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)
nano .env.production
docker-compose restart
echo "✅ Environment updated!"
```

## 🔧 Maintenance Commands

```bash
# View logs
docker-compose logs -f frontend

# Restart frontend
docker-compose restart frontend

# Rebuild and deploy
docker-compose build && docker-compose up -d

# Check status
docker ps | grep frontend

# Enter container
docker exec -it erp_frontend sh
```

## ⚠️ Lưu ý quan trọng

1. **Environment Variables**:

   - Frontend dùng prefix `VITE_` cho env variables
   - Build time variables, không thể thay đổi runtime

2. **API URL**:

   - Đảm bảo `VITE_API_URL` trỏ đúng đến backend
   - Check CORS settings trên backend

3. **Nginx Config**:

   - SPA routing với `try_files`
   - Cache static assets để tăng performance

4. **Docker Network**:
   - Frontend và Backend dùng chung network `erp_network`

## 🚨 Troubleshooting

### Lỗi CORS

```bash
# Check backend CORS settings
# Trong backend .env thêm:
CORS_ORIGIN=https://app.bravix.vn
```

### Lỗi 502 Bad Gateway

```bash
# Check frontend container
docker logs erp_frontend

# Restart all services
docker-compose restart
```

### Build failed

```bash
# Clear cache and rebuild
docker-compose build --no-cache
docker-compose up -d
```

## 📞 Support

Nếu gặp vấn đề:

1. Check logs: `docker-compose logs`
2. Verify env variables
3. Test API connection: `curl https://api.bravix.vn/health`
4. Check domain DNS pointing to VPS IP
