#!/bin/bash

# Crypto Trading Signals - Quick Deployment Script
# Bu script VPS sunucunuzda çalıştırılmalıdır

set -e

echo "🚀 Crypto Trading Signals Deployment Başlıyor..."

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Domain bilgisi al
read -p "Domain adınızı girin (örn: cryptosignals.com): " DOMAIN
read -p "Email adresinizi girin (SSL için): " EMAIL

echo -e "${GREEN}✓ Domain: $DOMAIN${NC}"
echo -e "${GREEN}✓ Email: $EMAIL${NC}"

# 1. Sistem güncellemesi
echo -e "\n${YELLOW}[1/10] Sistem güncelleniyor...${NC}"
apt update && apt upgrade -y

# 2. Node.js kurulumu
echo -e "\n${YELLOW}[2/10] Node.js kuruluyor...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi
echo -e "${GREEN}✓ Node.js $(node -v) kurulu${NC}"

# 3. Docker kurulumu
echo -e "\n${YELLOW}[3/10] Docker kuruluyor...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    apt install -y docker-compose
fi
echo -e "${GREEN}✓ Docker kurulu${NC}"

# 4. Nginx kurulumu
echo -e "\n${YELLOW}[4/10] Nginx kuruluyor...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
fi
echo -e "${GREEN}✓ Nginx kurulu${NC}"

# 5. Certbot kurulumu
echo -e "\n${YELLOW}[5/10] Certbot kuruluyor...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
fi
echo -e "${GREEN}✓ Certbot kurulu${NC}"

# 6. PM2 kurulumu
echo -e "\n${YELLOW}[6/10] PM2 kuruluyor...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
echo -e "${GREEN}✓ PM2 kurulu${NC}"

# 7. Proje dizini oluştur
echo -e "\n${YELLOW}[7/10] Proje dizini hazırlanıyor...${NC}"
mkdir -p /var/www/crypto-signals
cd /var/www/crypto-signals

# 8. PostgreSQL ve Redis başlat
echo -e "\n${YELLOW}[8/10] Veritabanları başlatılıyor...${NC}"
cat > docker-compose.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: crypto-signals-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme123}
      POSTGRES_DB: crypto_signals
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: crypto-signals-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
EOF

docker-compose up -d
echo -e "${GREEN}✓ PostgreSQL ve Redis başlatıldı${NC}"

# 9. Nginx konfigürasyonu
echo -e "\n${YELLOW}[9/10] Nginx yapılandırılıyor...${NC}"
cat > /etc/nginx/sites-available/crypto-signals << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    root /var/www/html;
    index index.html;
    
    client_max_body_size 10M;
    
    # Frontend routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeout ayarları
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
EOF

ln -sf /etc/nginx/sites-available/crypto-signals /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl restart nginx
echo -e "${GREEN}✓ Nginx yapılandırıldı${NC}"

# 10. SSL Sertifikası
echo -e "\n${YELLOW}[10/10] SSL sertifikası kuruluyor...${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Deployment tamamlandı!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"

echo -e "\n${YELLOW}Sonraki Adımlar:${NC}"
echo "1. Proje dosyalarınızı /var/www/crypto-signals/ dizinine yükleyin"
echo "2. Backend .env dosyasını oluşturun"
echo "3. npm install && npm run migrate (backend)"
echo "4. npm install && npm run build (frontend)"
echo "5. pm2 start npm --name crypto-backend -- start"
echo "6. Frontend build'i /var/www/html/ dizinine kopyalayın"

echo -e "\n${YELLOW}Faydalı Komutlar:${NC}"
echo "- pm2 status              # Process durumu"
echo "- pm2 logs crypto-backend # Backend logları"
echo "- docker-compose logs     # Database logları"
echo "- nginx -t                # Nginx test"
echo "- certbot renew --dry-run # SSL yenileme testi"

echo -e "\n${GREEN}Website: https://$DOMAIN${NC}"
echo -e "${GREEN}Başarılar! 🚀${NC}\n"
