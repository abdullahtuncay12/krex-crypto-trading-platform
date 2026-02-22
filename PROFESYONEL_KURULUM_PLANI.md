# Profesyonel Domain ve Kurulum Planı

## 🎯 Hedef: Tam Profesyonel Kurulum

```
www.yourdomain.com     → Ana uygulama (Frontend + Backend)
api.yourdomain.com     → API endpoint (opsiyonel, önerilen)
admin.yourdomain.com   → Admin panel (gelecek için)
```

---

## 📅 Tam Kurulum Takvimi (3 Gün)

### GÜN 1: Domain ve Hosting Hazırlığı (2-3 saat)

#### Sabah (1 saat): Domain Satın Alma
**Önerilen Sağlayıcılar:**

1. **Cloudflare** (En İyi Seçim) ⭐
   - **Fiyat**: $8-10/yıl
   - **Avantajlar**: 
     - Ücretsiz SSL
     - Ücretsiz CDN
     - DDoS koruması
     - Hızlı DNS
   - **Link**: [cloudflare.com/products/registrar](https://www.cloudflare.com/products/registrar/)
   
2. **Namecheap** (İyi Alternatif)
   - **Fiyat**: $10-15/yıl
   - **Avantajlar**:
     - Kolay kullanım
     - Ücretsiz WHOIS privacy
     - Türkçe destek
   - **Link**: [namecheap.com](https://www.namecheap.com)

3. **Porkbun** (En Ucuz)
   - **Fiyat**: $7-9/yıl
   - **Avantajlar**:
     - Çok ucuz
     - Ücretsiz WHOIS
   - **Link**: [porkbun.com](https://porkbun.com)

**Domain İsimleri Önerileri:**
```
✅ cryptosignals.io
✅ tradingbot.app
✅ signalbot.io
✅ cryptobot.trade
✅ aitrading.app
✅ smartsignals.io
```

**Domain Satın Alma Adımları:**
```bash
1. Cloudflare'e git
2. "Register Domain" tıkla
3. Domain ara (örn: cryptosignals.io)
4. Müsait mi kontrol et
5. Sepete ekle
6. Ödeme yap ($8-10)
7. Email doğrulama yap
8. Hazır! ✅
```

#### Öğleden Sonra (1-2 saat): VPS Satın Alma ve Kurulum

**Önerilen VPS Sağlayıcıları:**

1. **DigitalOcean** (En Popüler) ⭐
   - **Fiyat**: $24/ay (4GB RAM, 2 vCPU)
   - **Avantajlar**:
     - Kolay kullanım
     - Harika dokümantasyon
     - Türkiye datacenter
   - **Link**: [digitalocean.com](https://www.digitalocean.com)
   - **Promo**: İlk $200 ücretsiz credit (yeni kullanıcılar)

2. **Hetzner** (En Ucuz) 💰
   - **Fiyat**: €9/ay (~320₺)
   - **Avantajlar**:
     - Çok ucuz
     - Güçlü donanım
     - Almanya datacenter
   - **Link**: [hetzner.com](https://www.hetzner.com)

3. **Linode/Akamai** (Güvenilir)
   - **Fiyat**: $24/ay
   - **Avantajlar**:
     - Stabil
     - İyi performans
   - **Link**: [linode.com](https://www.linode.com)

**VPS Satın Alma Adımları (DigitalOcean):**
```bash
1. digitalocean.com → Sign Up
2. Email doğrula
3. Kredi kartı ekle (veya PayPal)
4. "Create Droplet" tıkla
5. Ubuntu 22.04 LTS seç
6. Plan seç: 4GB RAM, 2 vCPU ($24/ay)
7. Datacenter: Frankfurt (Türkiye'ye yakın)
8. SSH Key ekle (veya password)
9. Hostname: crypto-signals-prod
10. Create Droplet
11. IP adresini not et: 123.456.789.012
```

---

### GÜN 2: Sunucu Kurulumu ve Deployment (3-4 saat)

#### Adım 1: Sunucuya Bağlan (5 dakika)

```bash
# Windows PowerShell'de
ssh root@123.456.789.012

# İlk giriş şifresini gir (email'de geldi)
# Yeni şifre oluştur
```

#### Adım 2: Otomatik Kurulum Script'i Çalıştır (30 dakika)

```bash
# Sunucuda
cd /root

# Deploy script'ini indir
wget https://raw.githubusercontent.com/yourusername/crypto-signals/main/deploy.sh

# Çalıştırılabilir yap
chmod +x deploy.sh

# Çalıştır
./deploy.sh

# Domain ve email gir
Domain: cryptosignals.io
Email: your@email.com

# Script otomatik olarak kurar:
# ✓ Node.js
# ✓ Docker
# ✓ PostgreSQL
# ✓ Redis
# ✓ Nginx
# ✓ SSL (Let's Encrypt)
# ✓ PM2
```

#### Adım 3: Proje Dosyalarını Yükle (15 dakika)

**Seçenek A: Git ile (Önerilen)**
```bash
cd /var/www
git clone https://github.com/yourusername/crypto-signals.git
cd crypto-signals
```

**Seçenek B: SFTP ile**
```bash
# WinSCP veya FileZilla kullan
# Host: 123.456.789.012
# Username: root
# Password: your_password
# Dosyaları /var/www/crypto-signals/ yükle
```

#### Adım 4: Environment Variables (10 dakika)

```bash
cd /var/www/crypto-signals/backend

# .env dosyası oluştur
nano .env
```

**Backend .env içeriği:**
```bash
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://postgres:changeme123@localhost:5432/crypto_signals

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long_change_this

# Exchange APIs (Binance, Coinbase, Bybit)
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret
COINBASE_API_KEY=your_coinbase_api_key
COINBASE_API_SECRET=your_coinbase_api_secret
BYBIT_API_KEY=your_bybit_api_key
BYBIT_API_SECRET=your_bybit_api_secret

# Stripe (Payment)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (SendGrid)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@cryptosignals.io

# CORS
CORS_ORIGIN=https://cryptosignals.io,https://www.cryptosignals.io
```

**Frontend .env.production:**
```bash
cd /var/www/crypto-signals/frontend

nano .env.production
```

```bash
VITE_API_BASE_URL=https://cryptosignals.io
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

#### Adım 5: Database Migration (5 dakika)

```bash
cd /var/www/crypto-signals/backend

# Dependencies kur
npm ci --production

# Migration çalıştır
npm run migrate

# Başarılı mesajı görmeli:
# ✓ All migrations completed successfully!
```

#### Adım 6: Backend Başlat (5 dakika)

```bash
cd /var/www/crypto-signals/backend

# PM2 ile başlat
pm2 start npm --name "crypto-backend" -- start

# Otomatik başlatma
pm2 save
pm2 startup

# Durumu kontrol et
pm2 status

# Logları kontrol et
pm2 logs crypto-backend
```

#### Adım 7: Frontend Build (10 dakika)

```bash
cd /var/www/crypto-signals/frontend

# Dependencies kur
npm ci

# Production build
npm run build

# Build çıktısını Nginx'e kopyala
rm -rf /var/www/html/*
cp -r dist/* /var/www/html/

# Dosya izinleri
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
```

#### Adım 8: Nginx Konfigürasyonu (10 dakika)

```bash
nano /etc/nginx/sites-available/crypto-signals
```

**Nginx config:**
```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name cryptosignals.io www.cryptosignals.io;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name cryptosignals.io www.cryptosignals.io;
    
    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/cryptosignals.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cryptosignals.io/privkey.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Root directory
    root /var/www/html;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Siteyi aktifleştir
ln -sf /etc/nginx/sites-available/crypto-signals /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test
nginx -t

# Restart
systemctl restart nginx
```

---

### GÜN 3: DNS Ayarları ve SSL (1-2 saat)

#### Adım 1: DNS Ayarları (15 dakika)

**Cloudflare'de:**
```bash
1. Cloudflare Dashboard → DNS
2. A Record ekle:
   Type: A
   Name: @
   Content: 123.456.789.012 (sunucu IP)
   Proxy: Enabled (turuncu bulut)
   TTL: Auto

3. A Record ekle (www):
   Type: A
   Name: www
   Content: 123.456.789.012
   Proxy: Enabled
   TTL: Auto

4. CNAME Record ekle (api - gelecek için):
   Type: CNAME
   Name: api
   Content: cryptosignals.io
   Proxy: Enabled
   TTL: Auto
```

**SSL/TLS Ayarları:**
```bash
Cloudflare → SSL/TLS
Mode: Full (strict)

Edge Certificates:
✓ Always Use HTTPS: On
✓ Automatic HTTPS Rewrites: On
✓ Minimum TLS Version: 1.2
```

#### Adım 2: Let's Encrypt SSL (10 dakika)

```bash
# Sunucuda
certbot --nginx -d cryptosignals.io -d www.cryptosignals.io

# Email gir
# Şartları kabul et
# Otomatik yapılandırma: Yes

# Test et
certbot renew --dry-run

# Otomatik yenileme (cron)
crontab -e
# Ekle:
0 0 * * * certbot renew --quiet
```

#### Adım 3: Firewall Ayarları (5 dakika)

```bash
# UFW firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Durumu kontrol et
ufw status
```

#### Adım 4: Test ve Doğrulama (30 dakika)

```bash
# 1. Backend health check
curl https://cryptosignals.io/api/health

# Beklenen: {"status":"ok","timestamp":"..."}

# 2. Frontend test
curl -I https://cryptosignals.io

# Beklenen: 200 OK

# 3. SSL test
curl -I https://cryptosignals.io | grep -i ssl

# 4. Database test
docker exec crypto-signals-postgres psql -U postgres -c "SELECT 1"

# 5. Redis test
docker exec crypto-signals-redis redis-cli ping

# Beklenen: PONG

# 6. PM2 status
pm2 status

# 7. Nginx status
systemctl status nginx

# 8. Disk kullanımı
df -h

# 9. Memory kullanımı
free -h

# 10. CPU kullanımı
top
```

---

## 🔒 Güvenlik Sertleştirme (Bonus)

### 1. SSH Güvenliği
```bash
# Password authentication kapat
nano /etc/ssh/sshd_config

# Değiştir:
PasswordAuthentication no
PermitRootLogin no

# Restart
systemctl restart sshd
```

### 2. Fail2Ban Kurulumu
```bash
apt install -y fail2ban

# Konfigürasyon
nano /etc/fail2ban/jail.local
```

```ini
[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
```

```bash
systemctl enable fail2ban
systemctl start fail2ban
```

### 3. Otomatik Güncellemeler
```bash
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

---

## 📊 Monitoring ve Bakım

### 1. Günlük Kontroller
```bash
# PM2 status
pm2 status

# Loglar
pm2 logs crypto-backend --lines 50

# Disk kullanımı
df -h

# Memory
free -h
```

### 2. Haftalık Bakım
```bash
# Sistem güncellemeleri
apt update && apt upgrade -y

# Docker temizlik
docker system prune -f

# Log rotation
journalctl --vacuum-time=7d
```

### 3. Aylık Backup
```bash
# Database backup script
nano /root/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Database backup
docker exec crypto-signals-postgres pg_dump -U postgres crypto_signals > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Delete old backups (30 days)
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: db_$DATE.sql.gz"
```

```bash
chmod +x /root/backup.sh

# Cron job (her gün 2:00)
crontab -e
0 2 * * * /root/backup.sh
```

---

## 💰 Toplam Maliyet Özeti

### İlk Yıl:
```
Domain (Cloudflare):     $10
VPS (DigitalOcean):      $288 ($24 x 12)
SSL:                     $0 (Let's Encrypt)
─────────────────────────────
Toplam:                  $298/yıl (~10,700₺)
```

### Aylık:
```
VPS:                     $24/ay (~850₺)
```

### Opsiyonel Eklentiler:
```
Stripe (Payment):        %2.9 + $0.30 per transaction
SendGrid (Email):        $15/ay (40,000 email)
Cloudflare Pro:          $20/ay (gelişmiş özellikler)
```

---

## ✅ Kurulum Checklist

### Gün 1:
- [ ] Domain satın aldım (Cloudflare)
- [ ] VPS satın aldım (DigitalOcean)
- [ ] SSH ile sunucuya bağlandım
- [ ] Deploy script'ini çalıştırdım

### Gün 2:
- [ ] Proje dosyalarını yükledim
- [ ] Environment variables ayarladım
- [ ] Database migration çalıştırdım
- [ ] Backend başlattım (PM2)
- [ ] Frontend build aldım
- [ ] Nginx yapılandırdım

### Gün 3:
- [ ] DNS ayarlarını yaptım
- [ ] SSL sertifikası kurdum
- [ ] Firewall ayarladım
- [ ] Tüm servisleri test ettim
- [ ] Güvenlik sertleştirmesi yaptım
- [ ] Backup sistemi kurdum

### Test:
- [ ] https://cryptosignals.io açılıyor
- [ ] Kayıt olabiliyorum
- [ ] Giriş yapabiliyorum
- [ ] Bot trading çalışıyor
- [ ] Sinyaller geliyor
- [ ] SSL aktif (yeşil kilit)

---

## 🎯 Sonraki Adımlar

### Hemen Sonra:
1. Test kullanıcıları ekle
2. Gerçek kullanıcılarla test et
3. Geri bildirim topla

### İlk Hafta:
1. Monitoring kur (UptimeRobot)
2. Analytics ekle (Google Analytics)
3. SEO optimizasyonu yap

### İlk Ay:
1. Stripe entegrasyonu tamamla
2. Email servisi aktifleştir
3. Sosyal medya hesapları aç
4. Marketing başlat

---

## 📞 Destek Kaynakları

- **DigitalOcean Docs**: [docs.digitalocean.com](https://docs.digitalocean.com)
- **Nginx Docs**: [nginx.org/en/docs](https://nginx.org/en/docs/)
- **Let's Encrypt**: [letsencrypt.org](https://letsencrypt.org/)
- **Cloudflare Docs**: [developers.cloudflare.com](https://developers.cloudflare.com/)

---

**Başarılar! Profesyonel kurulumunuz hazır! 🚀**
