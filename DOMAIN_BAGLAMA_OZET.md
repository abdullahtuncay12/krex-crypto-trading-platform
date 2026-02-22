# Domain Bağlama - Hızlı Özet

## 🎯 En Hızlı Yöntem (Önerilen)

### 1. Railway ile Deploy (5 dakika)
```
1. railway.app'e git
2. GitHub ile giriş yap
3. "New Project" → Repository seç
4. PostgreSQL ve Redis ekle
5. Environment variables ayarla
6. Custom domain ekle
7. DNS ayarlarını yap
8. Bitti! ✅
```

**Maliyet**: $20/ay (~240₺)  
**Zorluk**: ⭐ Çok Kolay  
**Süre**: 5-10 dakika

---

## 💰 En Ucuz Yöntem

### 2. Hetzner VPS (Avrupa)
```
1. hetzner.com'dan VPS al (€9/ay)
2. Ubuntu 22.04 kur
3. deploy.sh script'ini çalıştır
4. Domain DNS ayarlarını yap
5. Bitti! ✅
```

**Maliyet**: €9/ay (~320₺)  
**Zorluk**: ⭐⭐ Orta  
**Süre**: 30-60 dakika

---

## 🚀 Dengeli Yöntem (Önerilen)

### 3. DigitalOcean Droplet
```
1. digitalocean.com'dan Droplet oluştur ($24/ay)
2. SSH ile bağlan
3. deploy.sh script'ini çalıştır
4. Proje dosyalarını yükle
5. Domain DNS ayarlarını yap
6. Bitti! ✅
```

**Maliyet**: $24/ay (~850₺)  
**Zorluk**: ⭐⭐ Orta  
**Süre**: 30-60 dakika

---

## 📋 Adım Adım (DigitalOcean Örneği)

### Adım 1: Domain Al (5 dakika)
- **Namecheap**: cryptosignals.com ($10/yıl)
- **Cloudflare**: cryptosignals.com ($8/yıl)

### Adım 2: VPS Al (5 dakika)
1. digitalocean.com → Create Droplet
2. Ubuntu 22.04 seç
3. 4GB RAM, 2 vCPU ($24/ay)
4. SSH key ekle
5. Create

### Adım 3: Sunucu Kurulumu (30 dakika)
```bash
# SSH ile bağlan
ssh root@your_server_ip

# Deploy script'ini indir
wget https://raw.githubusercontent.com/yourusername/crypto-signals/main/deploy.sh
chmod +x deploy.sh

# Çalıştır
./deploy.sh
# Domain ve email gir
```

### Adım 4: Proje Yükle (10 dakika)
```bash
# Git ile
cd /var/www/crypto-signals
git clone https://github.com/yourusername/crypto-signals.git .

# Veya SFTP ile dosyaları yükle
```

### Adım 5: Backend Ayarla (10 dakika)
```bash
cd /var/www/crypto-signals/backend

# .env oluştur
nano .env
# Gerekli değişkenleri gir

# Dependencies
npm ci --production

# Migration
npm run migrate

# PM2 ile başlat
pm2 start npm --name crypto-backend -- start
pm2 save
pm2 startup
```

### Adım 6: Frontend Build (5 dakika)
```bash
cd /var/www/crypto-signals/frontend

# .env.production oluştur
echo "VITE_API_BASE_URL=https://yourdomain.com" > .env.production

# Build
npm ci
npm run build

# Nginx'e kopyala
cp -r dist/* /var/www/html/
```

### Adım 7: DNS Ayarları (5 dakika)
Domain sağlayıcınızda:
```
Type: A
Host: @
Value: your_server_ip
TTL: 3600

Type: A
Host: www
Value: your_server_ip
TTL: 3600
```

### Adım 8: Test (5 dakika)
```bash
# Backend çalışıyor mu?
pm2 status

# Nginx çalışıyor mu?
systemctl status nginx

# SSL aktif mi?
curl -I https://yourdomain.com
```

**Toplam Süre**: ~1 saat  
**Toplam Maliyet**: $34/yıl (domain) + $24/ay (VPS) = ~$322/yıl

---

## 🔧 Gerekli Environment Variables

### Backend (.env)
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/crypto_signals
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_key_min_32_chars
BINANCE_API_KEY=your_binance_key
BINANCE_API_SECRET=your_binance_secret
COINBASE_API_KEY=your_coinbase_key
COINBASE_API_SECRET=your_coinbase_secret
BYBIT_API_KEY=your_bybit_key
BYBIT_API_SECRET=your_bybit_secret
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@yourdomain.com
```

### Frontend (.env.production)
```bash
VITE_API_BASE_URL=https://yourdomain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
```

---

## 🎓 Önerilen Sıralama (İlk Kez Deploy Ediyorsanız)

### Başlangıç: Railway (Test için)
1. Railway ile deploy et (5 dakika)
2. Test et, kullanıcı geri bildirimi al
3. Sistemi optimize et

### Büyüme: VPS'e Geç
1. Kullanıcı sayısı arttıkça
2. DigitalOcean/Hetzner VPS al
3. Daha fazla kontrol ve maliyet tasarrufu

### Ölçekleme: Cloud'a Geç
1. Büyük kullanıcı tabanı
2. AWS/GCP/Azure
3. Auto-scaling, load balancing

---

## 📞 Destek

Sorun yaşarsanız:
1. `DEPLOYMENT_REHBERI.md` dosyasını okuyun (detaylı)
2. Backend logları: `pm2 logs crypto-backend`
3. Nginx logları: `tail -f /var/log/nginx/error.log`
4. Database: `docker-compose logs postgres`

---

## ✅ Checklist

- [ ] Domain satın aldım
- [ ] VPS/Hosting seçtim
- [ ] Sunucu kurulumu yaptım
- [ ] Proje dosyalarını yükledim
- [ ] Environment variables ayarladım
- [ ] Database migration çalıştırdım
- [ ] Backend başlattım (PM2)
- [ ] Frontend build aldım
- [ ] DNS ayarlarını yaptım
- [ ] SSL sertifikası kurdum
- [ ] Test ettim - çalışıyor! 🎉

---

**Başarılar! 🚀**

Detaylı bilgi için: `DEPLOYMENT_REHBERI.md`
