# Cryptocurrency Trading Signals - Kurulum Rehberi

## 🚀 Hızlı Başlangıç - Gerekli Yazılımları Yükleme

Projeyi çalıştırmak için önce aşağıdaki yazılımları yüklemeniz gerekiyor:

---

## 1️⃣ Node.js ve npm Kurulumu

Node.js, backend ve frontend'i çalıştırmak için gereklidir.

### Windows için:

1. **Node.js İndir:**
   - https://nodejs.org/en/download/ adresine gidin
   - "Windows Installer (.msi)" - **LTS (Long Term Support)** versiyonunu indirin
   - Önerilen: v20.x veya v18.x

2. **Kurulumu Yapın:**
   - İndirdiğiniz .msi dosyasını çalıştırın
   - "Next" butonlarına tıklayarak kurulumu tamamlayın
   - "Automatically install necessary tools" seçeneğini işaretleyin

3. **Kurulumu Doğrulayın:**
   - Yeni bir PowerShell veya CMD penceresi açın
   - Şu komutları çalıştırın:
   ```powershell
   node --version
   npm --version
   ```
   - Versiyon numaralarını görmelisiniz (örn: v20.11.0 ve 10.2.4)

---

## 2️⃣ Docker Desktop Kurulumu (Önerilen)

Docker, PostgreSQL ve Redis'i kolayca çalıştırmak için kullanılır.

### Windows için:

1. **Docker Desktop İndir:**
   - https://www.docker.com/products/docker-desktop/ adresine gidin
   - "Download for Windows" butonuna tıklayın

2. **Kurulumu Yapın:**
   - İndirdiğiniz .exe dosyasını çalıştırın
   - Kurulum sırasında "Use WSL 2 instead of Hyper-V" seçeneğini işaretleyin
   - Kurulum tamamlandıktan sonra bilgisayarınızı yeniden başlatın

3. **Docker'ı Başlatın:**
   - Docker Desktop uygulamasını açın
   - İlk açılışta birkaç dakika bekleyin (Docker Engine başlatılıyor)
   - Sol altta yeşil "Engine running" yazısını görmelisiniz

4. **Kurulumu Doğrulayın:**
   ```powershell
   docker --version
   docker-compose --version
   ```

---

## 3️⃣ Alternatif: PostgreSQL ve Redis Manuel Kurulum

Docker kullanmak istemiyorsanız, PostgreSQL ve Redis'i manuel olarak kurabilirsiniz:

### PostgreSQL Kurulumu (Windows):

1. https://www.postgresql.org/download/windows/ adresine gidin
2. "Download the installer" linkine tıklayın
3. En son versiyonu (15.x veya 16.x) indirin
4. Kurulum sırasında:
   - Şifre belirleyin (örn: `postgres123`)
   - Port: 5432 (varsayılan)
   - Locale: Turkish, Turkey
5. Kurulum sonrası pgAdmin açılacak

### Redis Kurulumu (Windows):

Redis'in resmi Windows desteği yok, ancak:

**Seçenek 1: Memurai (Redis alternatifi)**
- https://www.memurai.com/get-memurai adresine gidin
- Ücretsiz versiyonu indirin ve kurun

**Seçenek 2: WSL2 ile Redis**
- WSL2 kurulu ise Linux komutlarıyla Redis kurabilirsiniz

**Seçenek 3: Docker kullanın (en kolay)**
- Sadece Redis için bile Docker kullanmak en pratik çözümdür

---

## 4️⃣ Proje Kurulumu

Gerekli yazılımlar kurulduktan sonra:

### Adım 1: Bağımlılıkları Yükleyin

```powershell
# Proje klasörüne gidin
cd C:\Users\Monster\Desktop\KREX

# Tüm bağımlılıkları yükleyin
npm install
```

### Adım 2: Docker ile Veritabanlarını Başlatın

```powershell
# PostgreSQL ve Redis'i başlatın
docker-compose up -d

# Kontrol edin (çalışan container'ları gösterir)
docker ps
```

Şunları görmelisiniz:
- `krex-postgres-1` (PostgreSQL)
- `krex-redis-1` (Redis)

### Adım 3: Environment Dosyalarını Oluşturun

```powershell
# Backend .env dosyası
copy backend\.env.example backend\.env

# Frontend .env dosyası
copy frontend\.env.example frontend\.env
```

### Adım 4: Veritabanı Migration'larını Çalıştırın

```powershell
cd backend
npm run migrate:up
cd ..
```

### Adım 5: Uygulamayı Başlatın

**Seçenek 1: Her iki servisi birlikte başlat**
```powershell
npm run dev
```

**Seçenek 2: Ayrı terminallerde başlat**

Terminal 1 (Backend):
```powershell
npm run dev:backend
```

Terminal 2 (Frontend):
```powershell
npm run dev:frontend
```

---

## 5️⃣ Uygulamayı Test Edin

1. **Backend API:**
   - Tarayıcıda açın: http://localhost:3001/health
   - Görmeli: `{"status":"ok","timestamp":"..."}`

2. **Frontend:**
   - Tarayıcıda açın: http://localhost:3000
   - Crypto Trading Signals ana sayfasını görmelisiniz

3. **Veritabanı:**
   - Backend konsolunda "Database connected successfully" mesajını görmelisiniz

---

## 🔧 Sorun Giderme

### "Port already in use" Hatası

Port 3000 veya 3001 kullanımda ise:

```powershell
# Port kullanan process'i bulun
netstat -ano | findstr :3000

# Process'i sonlandırın (PID'yi değiştirin)
taskkill /PID <PID> /F
```

### Docker Container Başlamıyor

```powershell
# Container'ları durdurun
docker-compose down

# Yeniden başlatın
docker-compose up -d

# Logları kontrol edin
docker-compose logs
```

### "Module not found" Hatası

```powershell
# node_modules'ı temizleyin
rmdir /s /q node_modules
rmdir /s /q backend\node_modules
rmdir /s /q frontend\node_modules

# Yeniden yükleyin
npm install
```

### PostgreSQL Bağlantı Hatası

`backend/.env` dosyasını kontrol edin:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crypto_signals
```

Docker kullanıyorsanız bu ayarlar doğru olmalı.

---

## 📋 Kurulum Kontrol Listesi

- [ ] Node.js kuruldu (v18+)
- [ ] npm kuruldu
- [ ] Docker Desktop kuruldu ve çalışıyor
- [ ] `npm install` başarıyla tamamlandı
- [ ] `docker-compose up -d` çalıştırıldı
- [ ] PostgreSQL ve Redis container'ları çalışıyor
- [ ] `.env` dosyaları oluşturuldu
- [ ] Database migration'lar çalıştırıldı
- [ ] Backend başlatıldı (port 3001)
- [ ] Frontend başlatıldı (port 3000)
- [ ] http://localhost:3001/health çalışıyor
- [ ] http://localhost:3000 açılıyor

---

## 🎯 Sonraki Adımlar

Kurulum tamamlandıktan sonra:

1. **Kullanıcı Kaydı:**
   - Frontend'de "Register" butonuna tıklayın
   - Yeni bir hesap oluşturun

2. **Kripto Para Seçin:**
   - Ana sayfada dropdown'dan bir kripto para seçin (örn: BTC)

3. **Trading Sinyallerini Görün:**
   - Seçtiğiniz kripto para için alım/satım sinyallerini görün

4. **Premium'a Geçin (Opsiyonel):**
   - Stripe test modunda premium özellikleri test edebilirsiniz

---

## 📞 Yardım

Sorun yaşarsanız:
- README.md dosyasını okuyun
- API_DOCUMENTATION.md'de endpoint'leri inceleyin
- DEPLOYMENT.md'de detaylı deployment bilgileri var

**Önemli:** İlk kurulumda tüm yazılımları yükledikten sonra bilgisayarınızı yeniden başlatmanız önerilir.
