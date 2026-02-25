# Railway Deployment Rehberi - 30 Dakikada Canlıya Alın!

## 🚀 Railway Nedir?

Railway, modern web uygulamalarını kolayca deploy etmenizi sağlayan bir Platform as a Service (PaaS) platformudur. GitHub'dan otomatik deploy, veritabanı yönetimi ve kolay scaling sunar.

**Avantajlar:**
- ✅ Çok hızlı kurulum (30 dakika)
- ✅ Otomatik deployment (Git push = deploy)
- ✅ Ücretsiz $5 trial credit
- ✅ Kolay veritabanı yönetimi
- ✅ Otomatik SSL
- ✅ Custom domain desteği

---

## 📋 Ön Hazırlık (5 dakika)

### 1. GitHub Repository Oluşturun

```bash
# Projenizi GitHub'a yükleyin
cd C:\Users\Monster\Desktop\KREX

# Git init (eğer yoksa)
git init

# .gitignore kontrol et
# node_modules, .env, dist klasörleri ignore edilmeli

# Commit
git add .
git commit -m "Initial commit for Railway deployment"

# GitHub'da yeni repo oluşturun: crypto-signals

# Remote ekle
git remote add origin https://github.com/YOURUSERNAME/crypto-signals.git

# Push
git push -u origin main
```

### 2. Railway Hesabı Oluşturun

```
1. https://railway.app adresine gidin
2. "Login with GitHub" tıklayın
3. GitHub ile giriş yapın ve yetkilendirin
4. Email doğrulama yapın
```

---

## 🎯 Adım Adım Deployment (25 dakika)

### ADIM 1: Yeni Proje Oluştur (2 dakika)

```
1. Railway Dashboard → "New Project"
2. "Deploy from GitHub repo" seçin
3. Repository listesinden "crypto-signals" seçin
4. "Deploy Now" tıklayın
```

Railway otomatik olarak:
- ✅ Repository'yi klonlar
- ✅ Dependencies kurar
- ✅ Build yapar
- ✅ Deploy eder

**İlk deployment 5-10 dakika sürebilir.**

---

### ADIM 2: PostgreSQL Ekle (2 dakika)

```
1. Project sayfasında "New" tıklayın
2. "Database" → "Add PostgreSQL" seçin
3. PostgreSQL servisi otomatik oluşturulur
```

Railway otomatik olarak `DATABASE_URL` environment variable'ı oluşturur.

---

### ADIM 3: Redis Ekle (2 dakika)

```
1. Project sayfasında "New" tıklayın
2. "Database" → "Add Redis" seçin
3. Redis servisi otomatik oluşturulur
```

Railway otomatik olarak `REDIS_URL` environment variable'ı oluşturur.

---

### ADIM 4: Environment Variables Ayarla (5 dakika)

**ÖNEMLİ**: Backend servisi çalışması için mutlaka bu adımları tamamlayın!

#### 4.1. PostgreSQL DATABASE_URL'i Kopyalayın
```
1. Railway dashboard'da "PostgreSQL" servisine tıklayın
2. "Connect" sekmesine gidin
3. "DATABASE_URL" değerini kopyalayın
   Örnek: postgresql://postgres:xxxxx@containers-us-west-xxx.railway.app:5432/railway
```

#### 4.2. Redis URL'i Kopyalayın
```
1. Railway dashboard'da "Redis" servisine tıklayın
2. "Connect" sekmesine gidin
3. "REDIS_URL" değerini kopyalayın
   Örnek: redis://default:xxxxx@containers-us-west-xxx.railway.internal:6379
```

#### 4.3. Backend Environment Variables Ekleyin
```
1. "backend" service'i seçin
2. "Variables" tab'ına gidin
3. "New Variable" butonuna tıklayın
4. Aşağıdaki değişkenleri TEK TEK ekleyin:
```

**Gerekli Environment Variables (HEPSİNİ EKLEYİN):**

```bash
# Node Environment
NODE_ENV=production
PORT=3001

# Database (Yukarıda kopyaladığınız değeri yapıştırın)
DATABASE_URL=postgresql://postgres:xxxxx@containers-us-west-xxx.railway.app:5432/railway

# Redis (Yukarıda kopyaladığınız değeri yapıştırın)
REDIS_URL=redis://default:xxxxx@containers-us-west-xxx.railway.internal:6379

# JWT Secret (Bu değeri olduğu gibi kullanabilirsiniz)
JWT_SECRET=krex-super-secret-jwt-key-2024-production-change-this-later-12345

# Exchange API Keys (Şimdilik mock data kullanıyoruz, opsiyonel)
BINANCE_API_KEY=optional_for_now
BINANCE_API_SECRET=optional_for_now
COINBASE_API_KEY=optional_for_now
COINBASE_API_SECRET=optional_for_now
BYBIT_API_KEY=optional_for_now
BYBIT_API_SECRET=optional_for_now

# Stripe (Demo mode için opsiyonel)
STRIPE_SECRET_KEY=sk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (Şimdilik opsiyonel)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=optional_for_now
FROM_EMAIL=noreply@yourdomain.com

# CORS (Railway URL'nizi ekleyin)
CORS_ORIGIN=https://crypto-signals-production.up.railway.app
```

**Kaydet ve redeploy olmasını bekleyin.**

---

### ADIM 5: Database Migration Çalıştır (3 dakika)

Railway'de migration çalıştırmak için:

**Seçenek A: Railway CLI (Önerilen)**

```bash
# Railway CLI kur
npm install -g @railway/cli

# Login
railway login

# Projeye bağlan
railway link

# Migration çalıştır
railway run npm run migrate --dir backend
```

**Seçenek B: package.json'a script ekle**

Backend `package.json`'a ekleyin:

```json
{
  "scripts": {
    "start": "npm run migrate && tsx src/index.ts",
    "migrate": "tsx src/db/migrate.ts",
    "build": "tsc",
    "dev": "tsx watch src/index.ts"
  }
}
```

Bu şekilde her deployment'ta otomatik migration çalışır.

---

### ADIM 6: Frontend Environment Variables (2 dakika)

```
1. Frontend service'i seçin (eğer ayrı deploy ediyorsanız)
2. "Variables" tab'ına gidin
3. Ekleyin:
```

```bash
# API Base URL (Backend Railway URL'niz)
VITE_API_BASE_URL=https://crypto-signals-backend-production.up.railway.app

# Stripe (Demo mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
```

---

### ADIM 7: Deployment Ayarları (3 dakika)

#### Backend için:

```
1. Backend service → Settings
2. "Build Command": npm ci && npm run build
3. "Start Command": npm start
4. "Root Directory": backend
5. "Watch Paths": backend/**
```

#### Frontend için:

```
1. Frontend service → Settings
2. "Build Command": npm ci && npm run build
3. "Start Command": npx serve -s dist -l 3000
4. "Root Directory": frontend
5. "Watch Paths": frontend/**
```

**Not:** Railway monorepo'ları destekler, her servis için root directory belirtebilirsiniz.

---

### ADIM 8: Public URL'leri Al (2 dakika)

```
1. Backend service → Settings → Networking
2. "Generate Domain" tıklayın
3. URL'yi kopyalayın: https://crypto-signals-backend-production.up.railway.app

4. Frontend service → Settings → Networking
5. "Generate Domain" tıklayın
6. URL'yi kopyalayın: https://crypto-signals-production.up.railway.app
```

**Frontend .env.production'ı güncelleyin:**

```bash
VITE_API_BASE_URL=https://crypto-signals-backend-production.up.railway.app
```

Commit ve push yapın, otomatik redeploy olur.

---

### ADIM 9: Test Et! (4 dakika)

```
1. Frontend URL'yi tarayıcıda açın:
   https://crypto-signals-production.up.railway.app

2. Backend health check:
   https://crypto-signals-backend-production.up.railway.app/api/health

3. Kayıt ol ve test et:
   - Yeni kullanıcı oluştur
   - Giriş yap
   - Coinleri gör
   - Bot trading sayfasını aç
```

---

## 🎨 Railway Proje Yapısı

Railway'de projeniz şöyle görünecek:

```
crypto-signals (Project)
├── backend (Service)
│   ├── Environment Variables
│   ├── Deployments
│   └── Logs
├── postgres (Database)
│   └── DATABASE_URL
└── redis (Database)
    └── REDIS_URL
```

---

## 🔧 Railway Konfigürasyon Dosyası (Opsiyonel)

Projenize `railway.json` ekleyerek deployment'ı özelleştirebilirsiniz:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 💰 Maliyet

### Trial Period:
```
İlk $5 ücretsiz credit
~500 saat çalışma süresi
Test için yeterli
```

### Sonrası:
```
Hobby Plan: $5/ay (500 saat)
Pro Plan: $20/ay (unlimited)

Database: Dahil
SSL: Ücretsiz
Custom Domain: Ücretsiz
```

**Tahmini Maliyet:** $20/ay (production için)

---

## 🌐 Custom Domain Bağlama (Bonus)

### Adım 1: Domain Satın Al
```
Cloudflare: $10/yıl
```

### Adım 2: Railway'de Domain Ekle
```
1. Service → Settings → Networking
2. "Custom Domain" tıkla
3. Domain gir: cryptosignals.io
4. DNS kayıtlarını gösterir
```

### Adım 3: DNS Ayarları (Cloudflare)
```
Type: CNAME
Name: @
Target: crypto-signals-production.up.railway.app
Proxy: Disabled (gri bulut)
```

**5-10 dakika içinde aktif olur.**

---

## 📊 Monitoring ve Logs

### Logs Görüntüleme:
```
1. Service seçin
2. "Deployments" tab
3. Son deployment'a tıklayın
4. "View Logs" tıklayın
```

### Metrics:
```
1. Service → Metrics
2. CPU, Memory, Network kullanımını görün
```

### Alerts:
```
1. Project Settings → Notifications
2. Email veya Slack entegrasyonu
3. Deployment başarısız olursa bildirim
```

---

## 🔄 Otomatik Deployment

Railway GitHub ile entegre, her push otomatik deploy olur:

```bash
# Kod değişikliği yap
git add .
git commit -m "Update feature"
git push

# Railway otomatik olarak:
# 1. Değişiklikleri algılar
# 2. Build yapar
# 3. Test eder
# 4. Deploy eder
# 5. Email gönderir
```

---

## 🆘 Sorun Giderme

### Deployment Başarısız:

```
1. Logs kontrol et
2. Environment variables kontrol et
3. package.json scripts kontrol et
4. Build command doğru mu?
```

### Database Bağlanamıyor:

```
1. DATABASE_URL doğru mu?
2. Migration çalıştı mı?
3. PostgreSQL servisi çalışıyor mu?
```

### Frontend Backend'e Bağlanamıyor:

```
1. VITE_API_BASE_URL doğru mu?
2. CORS ayarları doğru mu?
3. Backend çalışıyor mu? (/api/health)
```

### 502 Bad Gateway:

```
1. Backend başladı mı? (Logs kontrol et)
2. PORT environment variable var mı?
3. Health check endpoint çalışıyor mu?
```

---

## ✅ Deployment Checklist

### Hazırlık:
- [ ] GitHub repository oluşturdum
- [ ] Kodu push ettim
- [ ] Railway hesabı oluşturdum

### Deployment:
- [ ] Proje oluşturdum
- [ ] PostgreSQL ekledim
- [ ] Redis ekledim
- [ ] Environment variables ayarladım
- [ ] Migration çalıştırdım
- [ ] Backend deploy oldu
- [ ] Frontend deploy oldu

### Test:
- [ ] Frontend açılıyor
- [ ] Backend health check çalışıyor
- [ ] Kayıt olabiliyorum
- [ ] Giriş yapabiliyorum
- [ ] Coinler görünüyor
- [ ] Bot trading çalışıyor

### Opsiyonel:
- [ ] Custom domain bağladım
- [ ] Monitoring kurdum
- [ ] Backup sistemi kurdum

---

## 🎯 Sonraki Adımlar

### Hemen Sonra:
1. ✅ Test kullanıcıları ekle
2. ✅ Tüm özellikleri test et
3. ✅ Arkadaşlarına göster

### Bu Hafta:
1. Custom domain bağla
2. Analytics ekle
3. Monitoring kur

### Gelecek:
1. Production'a geç (DigitalOcean)
2. Daha fazla özellik ekle
3. Marketing başlat

---

## 📞 Destek

**Railway Docs:** [docs.railway.app](https://docs.railway.app)  
**Railway Discord:** [discord.gg/railway](https://discord.gg/railway)  
**Railway Status:** [status.railway.app](https://status.railway.app)

---

**Başarılar! Railway'de görüşürüz! 🚀**

*Not: Railway deployment'ı tamamlandıktan sonra URL'leri bana gönderin, birlikte test edelim!*
