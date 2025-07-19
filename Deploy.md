# 🚀 HƯỚNG DẪN DEPLOY BRAVIX ERP FRONTEND

## 📋 THÔNG TIN CHUNG

### Thông tin VPS
- **IP**: 14.225.212.17
- **Username**: root
- **Password**: cLFt8mx7ePeLnENkFK7E
- **SSH Port**: 22

### Cấu hình Domain
- **Frontend**: app.bravix.vn (deploy trên VPS này)
- **Backend**: api.bravix.vn (deploy riêng biệt)

## 🎯 CHUẨN BỊ TRƯỚC KHI DEPLOY

### 1. Cài đặt DNS
```bash
# Trỏ domain về VPS
A     app         14.225.212.17
```

### 2. Kiểm tra Backend
Đảm bảo backend đã chạy tại `api.bravix.vn`

## 🚀 CÁC BƯỚC DEPLOY

### Bước 1: Deploy Tự động (Khuyến nghị)
```bash
# Từ thư mục erp_fe
chmod +x deploy.sh
./deploy.sh
```

### Bước 2: Deploy Thủ công (Nếu cần)

#### 2.1. SSH vào VPS
```bash
ssh root@14.225.212.17
```

#### 2.2. Cài đặt Docker
```bash
# Update hệ thống
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget git nano htop unzip net-tools

# Cài Docker
curl -fsSL https://get.docker.com | sh
systemctl start docker
systemctl enable docker

# Cài Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-Linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### 2.3. Cấu hình Firewall
```bash
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
```

#### 2.4. Tạo thư mục dự án
```bash
mkdir -p /opt/bravix-frontend
```

#### 2.5. Upload files từ máy local
```bash
# Từ thư mục erp_fe trên máy local
scp -r * root@14.225.212.17:/opt/bravix-frontend/
```

#### 2.6. Cấu hình environment
```bash
# SSH vào VPS
ssh root@14.225.212.17
cd /opt/bravix-frontend

# Copy file environment
cp .env.production .env

# Chỉnh sửa nếu cần
nano .env
```

#### 2.7. Build và chạy ứng dụng
```bash
cd /opt/bravix-frontend

# Build frontend
docker-compose build --no-cache frontend

# Chạy services
docker-compose up -d

# Kiểm tra status
docker-compose ps
```

## 📁 CẤU TRÚC FILES DEPLOY

### Files chính cần thiết:
```
erp_fe/
├── deploy.sh                 # Script deploy chính
├── docker-compose.yml        # Docker compose config
├── .env.production          # Environment template
├── Dockerfile               # Docker build config
├── src/                     # Source code frontend
├── public/                  # Static files
├── package.json             # NPM dependencies
└── Deploy.md                # File hướng dẫn này
```

### Files environment:
- `.env.production`: Template environment cho production
- Chỉ chứa config frontend, không có backend config

### Docker files:
- `Dockerfile`: Multi-stage build (Node.js build + Nginx serve)
- `docker-compose.yml`: Frontend + Traefik (SSL)

## 🔧 QUẢN LÝ DEPLOYMENT

### Xem logs
```bash
ssh root@14.225.212.17
cd /opt/bravix-frontend

# Logs frontend
docker-compose logs -f frontend

# Logs Traefik (SSL)
docker-compose logs -f traefik

# Logs tất cả
docker-compose logs -f
```

### Restart services
```bash
# Restart frontend
docker-compose restart frontend

# Restart tất cả
docker-compose restart
```

### Update ứng dụng
```bash
# Từ máy local, chạy lại script deploy
./deploy.sh

# Hoặc thủ công trên VPS
cd /opt/bravix-frontend
docker-compose build --no-cache frontend
docker-compose up -d
```

### Stop deployment
```bash
docker-compose down
```

## 🌐 KIỂM TRA DEPLOYMENT

### 1. Kiểm tra containers
```bash
docker-compose ps
```

### 2. Test frontend
```bash
curl -f https://app.bravix.vn/health
```

### 3. Kiểm tra SSL
```bash
curl -I https://app.bravix.vn
```

### 4. Xem resource usage
```bash
docker stats
```

## 🚨 XỬ LÝ LỖI THƯỜNG GẶP

### Frontend không load
```bash
# Kiểm tra logs
docker-compose logs frontend

# Kiểm tra container
docker-compose ps

# Restart
docker-compose restart frontend
```

### SSL không hoạt động
```bash
# Kiểm tra Traefik logs
docker-compose logs traefik

# Kiểm tra DNS
dig app.bravix.vn

# Chờ SSL certificate được tạo (có thể mất vài phút)
```

### Lỗi kết nối API
```bash
# Kiểm tra backend có chạy không
curl -f https://api.bravix.vn/health

# Kiểm tra CORS configuration trên backend
# Backend phải cho phép origin: https://app.bravix.vn
```

### Lỗi memory/disk
```bash
# Kiểm tra disk space
df -h

# Kiểm tra memory
free -h

# Cleanup Docker
docker system prune -a
```

## 📊 MONITORING

### URLs quan trọng:
- **Frontend**: https://app.bravix.vn
- **Traefik Dashboard**: https://traefik.bravix.vn:8080 (admin/admin123)

### Commands hữu ích:
```bash
# Xem resource usage real-time
htop

# Xem network connections
netstat -tulpn

# Xem Docker containers
docker ps -a

# Xem Docker images
docker images

# Cleanup unused Docker resources
docker system prune -a
```

## ✅ SUCCESS CRITERIA

Deployment thành công khi:
- ✅ Frontend loads tại https://app.bravix.vn
- ✅ SSL certificate hoạt động (HTTPS)
- ✅ Frontend container running
- ✅ Traefik container running
- ✅ Logs không có error
- ✅ API calls tới backend hoạt động

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Kiểm tra logs containers
2. Kiểm tra DNS settings
3. Kiểm tra firewall rules
4. Kiểm tra backend CORS configuration
5. Restart deployment nếu cần

**🎉 FRONTEND DEPLOYMENT COMPLETED! 🎉**