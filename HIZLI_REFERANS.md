# Hızlı Referans Kartı - Profesyonel Kurulum

## 🎯 3 Günde Canlıya Alma Planı

```
GÜN 1: Domain + VPS Satın Al (2 saat)
GÜN 2: Kurulum + Deployment (4 saat)
GÜN 3: DNS + SSL + Test (2 saat)
```

---

## 💳 Satın Alınacaklar

### 1. Domain ($10/yıl)
```
✅ Cloudflare: cloudflare.com/products/registrar
   Önerilen: cryptosignals.io, tradingbot.app
```

### 2. VPS ($24/ay)
```
✅ DigitalOcean: digitalocean.com
   Plan: 4GB RAM, 2 vCPU, 80GB SSD
   Datacenter: Frankfurt
```

**Toplam İlk Maliyet**: $34 (domain + ilk ay VPS)

---

## ⚡ Hızlı Kurulum Komutları

### Sunucuda (SSH ile bağlandıktan sonra):

```bash
# 1. Deploy script indir ve çalıştır
cd /root
wget https://raw.githubusercontent.com/yourusername/crypto-signals/main/deploy.sh
chmod +x deploy.sh
./deploy.sh

# Domain ve email gir
# Script her şeyi otomatik kurar (30 dakika)

# 2. Proje dosyalarını yükle
cd /var/www
git clone https://github.com/yourusername/crypto-signals.git
cd crypto-signals

# 3. Backend .env oluştur
cd backend
nano .env
# (Environment variables yapıştır)

# 4. Database migration
npm ci --production
npm run migrate

# 5. Backend başlat
pm2 start npm --name crypto-backend -- start
pm2 save
pm2 startup

# 6. Frontend build
cd ../frontend
nano .env.production
# (VITE_API_BASE_URL=https://yourdomain.com)
npm ci
npm run build
cp -r dist/* /var/www/html/

# 7. SSL kur
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 8. Test
curl https://yourdomain.com/api/health
```

---

## 🌐 DNS Ayarları (Cloudflare)

```
Type: A
Name: @
Content: YOUR_SERVER_IP
Proxy: Enabled ☁️

Type: A
Name: www
Content: YOUR_SERVER_IP
Proxy: Enabled ☁️
```

**SSL/TLS Mode**: Full (strict)

---

## 🔧 Faydalı Komutlar

### Durum Kontrol:
```bash
pm2 status                    # Backend durumu
systemctl status nginx        # Nginx durumu
docker ps                     # Database durumu
df -h                         # Disk kullanımı
free -h                       # RAM kullanımı
```

### Loglar:
```bash
pm2 logs crypto-backend       # Backend logları
tail -f /var/log/nginx/error.log  # Nginx hataları
docker-compose logs postgres  # Database logları
```

### Restart:
```bash
pm2 restart crypto-backend    # Backend restart
systemctl restart nginx       # Nginx restart
docker-compose restart        # Database restart
```

### Backup:
```bash
# Database backup
docker exec crypto-signals-postgres pg_dump -U postgres crypto_signals > backup.sql
```

---

## 🔒 Güvenlik Checklist

```
✅ SSH password authentication kapalı
✅ Firewall aktif (UFW)
✅ Fail2Ban kurulu
✅ SSL sertifikası aktif
✅ Otomatik güncellemeler aktif
✅ Güçlü JWT secret kullanıldı
✅ Database şifresi güçlü
```

---

## 📊 Test Checklist

```
✅ https://yourdomain.com açılıyor
✅ SSL aktif (yeşil kilit)
✅ Kayıt olunabiliyor
✅ Giriş yapılabiliyor
✅ Coinler görünüyor
✅ Bot trading çalışıyor
✅ Mobil uyumlu
✅ Hızlı yükleniyor (<3 saniye)
```

---

## 💰 Aylık Maliyet

```
VPS:              $24/ay
Domain:           $0.83/ay ($10/yıl)
SSL:              $0 (Let's Encrypt)
─────────────────────────
Toplam:           ~$25/ay (~900₺)
```

---

## 🆘 Sorun Giderme

### Backend çalışmıyor:
```bash
pm2 logs crypto-backend
pm2 restart crypto-backend
```

### Frontend görünmüyor:
```bash
nginx -t
systemctl restart nginx
tail -f /var/log/nginx/error.log
```

### Database bağlanamıyor:
```bash
docker ps
docker-compose restart postgres
```

### SSL hatası:
```bash
certbot renew --dry-run
systemctl restart nginx
```

---

## 📞 Destek

**Detaylı Rehberler:**
- `PROFESYONEL_KURULUM_PLANI.md` - Tam kurulum
- `DEPLOYMENT_REHBERI.md` - Deployment detayları
- `DOMAIN_BAGLAMA_OZET.md` - Domain rehberi

**Online Kaynaklar:**
- DigitalOcean: docs.digitalocean.com
- Cloudflare: developers.cloudflare.com
- Let's Encrypt: letsencrypt.org

---

## 🎯 Başarı Kriterleri

### İlk Gün:
- ✅ Domain alındı
- ✅ VPS kuruldu
- ✅ Sunucu hazır

### İlk Hafta:
- ✅ Uygulama canlı
- ✅ SSL aktif
- ✅ Test kullanıcıları eklendi

### İlk Ay:
- ✅ 100+ kullanıcı
- ✅ 10+ premium üye
- ✅ Stabil çalışıyor

---

**Başarılar! 🚀**

*Not: Tüm komutları kopyala-yapıştır yapabilirsiniz. Sadece YOUR_SERVER_IP ve yourdomain.com kısımlarını değiştirin.*
