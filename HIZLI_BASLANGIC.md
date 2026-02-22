# 🚀 Hızlı Başlangıç Rehberi

Bu rehber, projeyi en hızlı şekilde çalıştırmanız için hazırlanmıştır.

---

## ⚡ 3 Adımda Kurulum

### 1️⃣ Gerekli Yazılımları Yükleyin

Aşağıdaki yazılımları yükleyin (henüz yüklü değilse):

| Yazılım | İndirme Linki | Açıklama |
|---------|---------------|----------|
| **Node.js** | https://nodejs.org/ | v18 veya üzeri (LTS önerilir) |
| **Docker Desktop** | https://www.docker.com/products/docker-desktop/ | PostgreSQL ve Redis için |

**Not:** Docker Desktop kurulumu sonrası bilgisayarınızı yeniden başlatın.

### 2️⃣ Otomatik Kurulum Scriptini Çalıştırın

PowerShell'i **Yönetici olarak** açın ve şu komutu çalıştırın:

```powershell
cd C:\Users\Monster\Desktop\KREX
.\kurulum.ps1
```

Bu script:
- ✅ Tüm bağımlılıkları yükler
- ✅ Environment dosyalarını oluşturur
- ✅ PostgreSQL ve Redis'i başlatır
- ✅ Veritabanı tablolarını oluşturur

### 3️⃣ Uygulamayı Başlatın

```powershell
npm run dev
```

**Tarayıcınızda açın:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/health

---

## 🎯 İlk Kullanım

### 1. Kullanıcı Kaydı

1. http://localhost:3000 adresine gidin
2. "Register" butonuna tıklayın
3. Email ve şifre ile kayıt olun

### 2. Kripto Para Seçin

1. Ana sayfada üstteki dropdown menüden bir kripto para seçin
   - Bitcoin (BTC)
   - Ethereum (ETH)
   - Cardano (ADA)
   - Solana (SOL)
   - Ripple (XRP)

### 3. Trading Sinyallerini Görün

Seçtiğiniz kripto para için:
- 📊 Alım/Satım/Bekle önerisi
- 📈 Güven seviyesi
- 📉 Teknik analiz göstergeleri (RSI, MACD, Bollinger Bands)
- 📅 Geçmiş fiyat grafiği

### 4. Premium Özellikleri Test Edin (Opsiyonel)

1. "Upgrade to Premium" butonuna tıklayın
2. Stripe test kartı kullanın:
   - Kart No: `4242 4242 4242 4242`
   - Son Kullanma: Gelecekte herhangi bir tarih (örn: 12/25)
   - CVC: Herhangi 3 rakam (örn: 123)
   - ZIP: Herhangi 5 rakam (örn: 12345)

Premium özellikler:
- 🎯 Stop-loss ve limit order önerileri
- 🔔 Fiyat hareketleri için gerçek zamanlı uyarılar
- 📊 Detaylı risk analizi
- 📈 Genişletilmiş teknik analiz

---

## 🛠️ Yararlı Komutlar

### Uygulamayı Başlatma

```powershell
# Her iki servisi birlikte başlat
npm run dev

# Sadece backend
npm run dev:backend

# Sadece frontend
npm run dev:frontend
```

### Testleri Çalıştırma

```powershell
# Tüm testler
npm test

# Sadece backend testleri
npm run test:backend

# Sadece frontend testleri
npm run test:frontend
```

### Docker Yönetimi

```powershell
# Container'ları başlat
docker-compose up -d

# Container'ları durdur
docker-compose down

# Logları görüntüle
docker-compose logs

# Çalışan container'ları listele
docker ps
```

### Veritabanı Migration'ları

```powershell
cd backend

# Migration'ları çalıştır (tabloları oluştur)
npm run migrate:up

# Migration'ları geri al (tabloları sil)
npm run migrate:down
```

---

## 🐛 Sorun Giderme

### "Port already in use" Hatası

```powershell
# Port 3000 veya 3001 kullanan process'i bul ve sonlandır
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Docker Container Başlamıyor

```powershell
# Container'ları yeniden başlat
docker-compose down
docker-compose up -d

# Docker Desktop'ın çalıştığından emin olun
```

### "Module not found" Hatası

```powershell
# node_modules'ı temizle ve yeniden yükle
Remove-Item -Recurse -Force node_modules, backend\node_modules, frontend\node_modules
npm install
```

### Veritabanı Bağlantı Hatası

1. PostgreSQL container'ının çalıştığını kontrol edin:
   ```powershell
   docker ps
   ```

2. `backend/.env` dosyasındaki DATABASE_URL'i kontrol edin:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crypto_signals
   ```

3. Migration'ları tekrar çalıştırın:
   ```powershell
   cd backend
   npm run migrate:up
   ```

---

## 📚 Daha Fazla Bilgi

- **Detaylı Kurulum:** [KURULUM_REHBERI.md](KURULUM_REHBERI.md)
- **Proje Dokümantasyonu:** [README.md](README.md)
- **API Dokümantasyonu:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Deployment:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Spec Dosyaları:** [.kiro/specs/crypto-trading-signals/](.kiro/specs/crypto-trading-signals/)

---

## 🎉 Başarılı Kurulum Kontrolü

Kurulum başarılı ise:

✅ http://localhost:3001/health → `{"status":"ok",...}` döner
✅ http://localhost:3000 → Ana sayfa açılır
✅ Backend konsolunda "Database connected successfully" görünür
✅ Backend konsolunda "Redis Client Connected" görünür
✅ Frontend konsolunda hata yok

---

## 💡 İpuçları

1. **İlk Çalıştırma:** İlk kez çalıştırırken backend'in hazır olması 10-15 saniye sürebilir
2. **Hot Reload:** Kod değişiklikleriniz otomatik olarak yansır (hem backend hem frontend)
3. **Test Verileri:** Geliştirme sırasında test kullanıcıları ve veriler oluşturabilirsiniz
4. **API Test:** Postman veya Thunder Client ile API endpoint'lerini test edebilirsiniz
5. **Loglar:** Backend konsolunda tüm API isteklerini ve hataları görebilirsiniz

---

## 🚀 Sonraki Adımlar

Kurulum tamamlandıktan sonra:

1. ✅ Kullanıcı kaydı yapın
2. ✅ Farklı kripto paralar için sinyalleri inceleyin
3. ✅ Premium'a geçip gelişmiş özellikleri test edin
4. ✅ Uyarı tercihlerini yapılandırın
5. ✅ Geçmiş performans verilerini görüntüleyin

**Keyifli kodlamalar! 🎊**
