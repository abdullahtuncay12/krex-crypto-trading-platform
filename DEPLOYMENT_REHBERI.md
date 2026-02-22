# Deployment Rehberi - Gerçek Domain'e Bağlama

Bu rehber, Crypto Trading Signals platformunu gerçek bir domain'e nasıl deploy edeceğinizi adım adım açıklar.

## İçindekiler
1. [Gereksinimler](#gereksinimler)
2. [Hosting Seçenekleri](#hosting-seçenekleri)
3. [Domain Satın Alma](#domain-satın-alma)
4. [Production Build](#production-build)
5. [Deployment Adımları](#deployment-adımları)
6. [SSL Sertifikası](#ssl-sertifikası)
7. [Environment Variables](#environment-variables)
8. [Veritabanı Migration](#veritabanı-migration)

---

## Gereksinimler

### Minimum Sunucu Gereksinimleri
- **CPU**: 2 vCPU
- **RAM**: 4 GB
- **Disk**: 50 GB SSD
- **İşletim Sistemi**: Ubuntu 22.04 LTS (önerilen)
- **Node.js**: v18 veya üzeri
- **PostgreSQL**: v15
- **Redis**: v7
- **Docker**: v24 (opsiyonel ama önerilen)

---

## Hosting Seçenekleri

### 1. VPS (Virtual Private Server) - Önerilen
**Avantajlar**: Tam kontrol, maliyet etkin, ölçeklenebilir

**Popüler Sağlayıcılar**:
- **DigitalOcean** (Droplet): $12-24/ay
  - 2 vCPU, 4GB RAM, 80GB SSD
  - Kolay kurulum, iyi dokümantasyon
  - [https://www.digitalocean.com](https://www.digitalocean.com)

- **Linode** (Akamai): $12-24/ay
  - Benzer özellikler
  - [https://www.linode.com](https://www.linode.com)

- **Vultr**: $12-24/ay
  - Global lokasyonlar
  - [https://www.vultr.com](https://www.vultr.com)

- **Hetzner**: €9-20/ay (Avrupa)
  - Çok uygun fiyat
  - [https://www.hetzner.com](https://www.hetzner.com)

### 2. Platform as a Service (PaaS)
**Avantajlar**: Kolay deployment, otomatik scaling

**Seçenekler**:
- **Railway**: $5-20/ay
  - Otomatik deployment
  - [https://railway.app](https://railway.app)

- **Render**: $7-25/ay
  - Free tier mevcut
  - [https://render.com](https://render.com)

- **Heroku**: $7-25/ay
  - Kolay kullanım
  - [https://www.heroku.com](https://www.heroku.com)

### 3. Cloud Providers (Gelişmiş)
- **AWS** (EC2, RDS, ElastiCache)
- **Google Cloud Platform**
- **Microsoft Azure**

---

## Domain Satın Alma

### Domain Sağlayıcıları
1. **Namecheap**: [https://www.namecheap.com](https://www.namecheap.com)
   - Uygun fiyat: $8-15/yıl
   - Free WHOIS privacy

2. **GoDaddy**: [https://www.godaddy.com](https://www.godaddy.com)
   - Popüler, Türkçe destek

3. **Cloudflare**: [https://www.cloudflare.com](https://www.cloudflare.com)
   - En ucuz: $8-10/yıl
   - Free CDN ve DDoS koruması

4. **Google Domains**: [https://domains.google](https://domains.google)
   - Basit, güvenilir

### Domain Önerileri
- `cryptosignals.com`
- `tradingsignals.io`
- `cryptobot.trade`
- `signalbot.app`

---

## Production Build

### 1. Frontend Build

```bash
cd frontend

# Environment variables ayarla
cat > .env.production << EOF
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
EOF

# Build
npm run build

# Build çıktısı: frontend/dist/
```

### 2. Backend Hazırlık

```bash
cd backend

# Production dependencies
npm ci --production

# TypeScript compile
npm run build
```

---

## Deployment Adımları

### Seçenek 1: VPS ile Deployment (DigitalOcean Örneği)

#### Adım 1: Droplet Oluştur
1. DigitalOcean'a kaydol
2. "Create Droplet" tıkla
3. Ubuntu 22.04 LTS seç
4. 4GB RAM, 2 vCPU plan seç ($24/ay)
5. SSH key ekle veya password oluştur
6. Create tıkla

#### Adım 2: Sunucuya Bağlan
```bash
ssh root@your_server_ip
```

#### Adım 3: Sunucu Kurulumu
```bash
# Sistem güncelle
apt update && apt upgrade -y

# Node.js kur
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Docker kur
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose kur
apt install -y docker-compose

# Nginx kur (reverse proxy için)
apt install -y nginx

# Certbot kur (SSL için)
apt install -y certbot python3-certbot-nginx

# PM2 kur (process manager)
npm install -g pm2
```

#### Adım 4: Proje Dosyalarını Yükle
```bash
# Git ile (önerilen)
cd /var/www
git clone https://github.com/yourusername/crypto-signals.git
cd crypto-signals

# Veya SFTP/SCP ile dosyaları yükle
```

#### Adım 5: Environment Variables
```bash
# Backend .env
cd /var/www/crypto-signals/backend
cat > .env << EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/crypto_signals
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key_change_this
BINANCE_API_KEY=your_binance_key
BINANCE_API_SECRET=your_binance_secret
COINBASE_API_KEY=your_coinbase_key
COINBASE_API_SECRET=your_coinbase_secret
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@yourdomain.com
EOF
```

#### Adım 6: PostgreSQL ve Redis Başlat
```bash
cd /var/www/crypto-signals

# Docker Compose ile
docker-compose up -d postgres redis

# Veritabanı migration
cd backend
npm install
npm run migrate
```

#### Adım 7: Backend Başlat
```bash
cd /var/www/crypto-signals/backend

# Dependencies kur
npm ci --production

# PM2 ile başlat
pm2 start npm --name "crypto-backend" -- start
pm2 save
pm2 startup
```

#### Adım 8: Frontend Build ve Deploy
```bash
cd /var/www/crypto-signals/frontend

# Build
npm ci
npm run build

# Nginx'e kopyala
rm -rf /var/www/html/*
cp -r dist/* /var/www/html/
```

#### Adım 9: Nginx Konfigürasyonu
```bash
cat > /etc/nginx/sites-available/crypto-signals << 'EOF'
# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    root /var/www/html;
    index index.html;
    
    # Frontend routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# Siteyi aktifleştir
ln -s /etc/nginx/sites-available/crypto-signals /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Nginx test ve restart
nginx -t
systemctl restart nginx
```

#### Adım 10: Domain DNS Ayarları
1. Domain sağlayıcınıza giriş yapın (Namecheap, GoDaddy, vb.)
2. DNS Management bölümüne gidin
3. A Record ekleyin:
   - **Type**: A
   - **Host**: @ (veya boş)
   - **Value**: Sunucu IP adresiniz
   - **TTL**: 3600

4. WWW için A Record:
   - **Type**: A
   - **Host**: www
   - **Value**: Sunucu IP adresiniz
   - **TTL**: 3600

5. DNS propagation bekleyin (5-48 saat)

#### Adım 11: SSL Sertifikası (HTTPS)
```bash
# Certbot ile otomatik SSL
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Email girin ve şartları kabul edin
# Certbot otomatik olarak Nginx'i yapılandırır

# Otomatik yenileme testi
certbot renew --dry-run
```

---

### Seçenek 2: Railway ile Kolay Deployment

#### Adım 1: Railway Hesabı
1. [https://railway.app](https://railway.app) adresine git
2. GitHub ile giriş yap

#### Adım 2: Yeni Proje
1. "New Project" tıkla
2. "Deploy from GitHub repo" seç
3. Repository'nizi seçin

#### Adım 3: Services Ekle
1. PostgreSQL ekle: "New" → "Database" → "PostgreSQL"
2. Redis ekle: "New" → "Database" → "Redis"

#### Adım 4: Environment Variables
Backend service için:
```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=your_secret
BINANCE_API_KEY=your_key
# ... diğer variables
```

#### Adım 5: Custom Domain
1. Settings → Domains
2. "Custom Domain" tıkla
3. Domain'inizi girin
4. DNS ayarlarını yapın (Railway size gösterir)

---

## SSL Sertifikası

### Let's Encrypt (Ücretsiz)
```bash
# Certbot ile otomatik
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Otomatik yenileme (cron)
0 0 * * * certbot renew --quiet
```

### Cloudflare (Ücretsiz + CDN)
1. Domain'i Cloudflare'e ekle
2. Nameserver'ları değiştir
3. SSL/TLS → Full (strict) seç
4. Otomatik HTTPS aktif

---

## Güvenlik Önerileri

### 1. Firewall Ayarları
```bash
# UFW firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### 2. SSH Güvenliği
```bash
# Password authentication kapat
nano /etc/ssh/sshd_config
# PasswordAuthentication no
systemctl restart sshd
```

### 3. Fail2Ban
```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### 4. Otomatik Güncellemeler
```bash
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

---

## Monitoring ve Bakım

### PM2 Monitoring
```bash
# Process durumu
pm2 status

# Loglar
pm2 logs crypto-backend

# Restart
pm2 restart crypto-backend

# Memory kullanımı
pm2 monit
```

### Database Backup
```bash
# Otomatik backup script
cat > /root/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec crypto-signals-postgres pg_dump -U postgres crypto_signals > /backups/db_$DATE.sql
# Eski backupları sil (30 günden eski)
find /backups -name "db_*.sql" -mtime +30 -delete
EOF

chmod +x /root/backup-db.sh

# Cron job (her gün 2:00)
crontab -e
# 0 2 * * * /root/backup-db.sh
```

---

## Maliyet Tahmini

### Minimum Setup (VPS)
- **Domain**: $10/yıl
- **VPS (DigitalOcean)**: $24/ay = $288/yıl
- **SSL**: Ücretsiz (Let's Encrypt)
- **Toplam**: ~$300/yıl

### Orta Seviye (PaaS)
- **Domain**: $10/yıl
- **Railway/Render**: $20/ay = $240/yıl
- **Toplam**: ~$250/yıl

---

## Sorun Giderme

### Backend Çalışmıyor
```bash
# Logları kontrol et
pm2 logs crypto-backend

# Port kullanımda mı?
netstat -tulpn | grep 3001

# Restart
pm2 restart crypto-backend
```

### Frontend Görünmüyor
```bash
# Nginx logları
tail -f /var/log/nginx/error.log

# Nginx test
nginx -t

# Restart
systemctl restart nginx
```

### Database Bağlantı Hatası
```bash
# PostgreSQL çalışıyor mu?
docker ps | grep postgres

# Bağlantı testi
docker exec crypto-signals-postgres psql -U postgres -c "SELECT 1"
```

---

## Destek ve Kaynaklar

- **DigitalOcean Tutorials**: [https://www.digitalocean.com/community/tutorials](https://www.digitalocean.com/community/tutorials)
- **Nginx Docs**: [https://nginx.org/en/docs/](https://nginx.org/en/docs/)
- **Let's Encrypt**: [https://letsencrypt.org/](https://letsencrypt.org/)
- **PM2 Docs**: [https://pm2.keymetrics.io/docs/](https://pm2.keymetrics.io/docs/)

---

## Sonraki Adımlar

1. ✅ Domain satın al
2. ✅ VPS/Hosting seç
3. ✅ Sunucu kurulumu yap
4. ✅ Proje deploy et
5. ✅ DNS ayarlarını yap
6. ✅ SSL sertifikası kur
7. ✅ Monitoring kur
8. ✅ Backup sistemi kur
9. ✅ Test et!

**Başarılar! 🚀**
