# Cryptocurrency Trading Signals - Otomatik Kurulum Scripti
# Bu script projeyi otomatik olarak kurar ve başlatır

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Crypto Trading Signals Kurulum" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Renk fonksiyonları
function Write-Success { param($message) Write-Host "✓ $message" -ForegroundColor Green }
function Write-Error { param($message) Write-Host "✗ $message" -ForegroundColor Red }
function Write-Info { param($message) Write-Host "→ $message" -ForegroundColor Yellow }
function Write-Step { param($message) Write-Host "`n[$message]" -ForegroundColor Cyan }

# 1. Gerekli yazılımları kontrol et
Write-Step "Gerekli Yazılımlar Kontrol Ediliyor"

# Node.js kontrolü
try {
    $nodeVersion = node --version
    Write-Success "Node.js yüklü: $nodeVersion"
} catch {
    Write-Error "Node.js bulunamadı!"
    Write-Info "Lütfen Node.js'i yükleyin: https://nodejs.org/"
    Write-Info "Kurulum sonrası bu scripti tekrar çalıştırın."
    exit 1
}

# npm kontrolü
try {
    $npmVersion = npm --version
    Write-Success "npm yüklü: v$npmVersion"
} catch {
    Write-Error "npm bulunamadı!"
    exit 1
}

# Docker kontrolü
$dockerInstalled = $false
try {
    $dockerVersion = docker --version
    Write-Success "Docker yüklü: $dockerVersion"
    $dockerInstalled = $true
} catch {
    Write-Error "Docker bulunamadı!"
    Write-Info "Docker olmadan devam edilecek (PostgreSQL ve Redis manuel kurulmalı)"
    $dockerInstalled = $false
}

# 2. Bağımlılıkları yükle
Write-Step "Bağımlılıklar Yükleniyor"

Write-Info "npm install çalıştırılıyor... (Bu birkaç dakika sürebilir)"
try {
    npm install 2>&1 | Out-Null
    Write-Success "Tüm bağımlılıklar yüklendi"
} catch {
    Write-Error "Bağımlılık yüklemesi başarısız!"
    Write-Info "Manuel olarak çalıştırın: npm install"
    exit 1
}

# 3. Environment dosyalarını oluştur
Write-Step "Environment Dosyaları Oluşturuluyor"

if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Success "backend/.env oluşturuldu"
} else {
    Write-Info "backend/.env zaten mevcut"
}

if (-not (Test-Path "frontend\.env")) {
    Copy-Item "frontend\.env.example" "frontend\.env"
    Write-Success "frontend/.env oluşturuldu"
} else {
    Write-Info "frontend/.env zaten mevcut"
}

# 4. Docker ile veritabanlarını başlat
if ($dockerInstalled) {
    Write-Step "Docker Container'ları Başlatılıyor"
    
    Write-Info "PostgreSQL ve Redis başlatılıyor..."
    try {
        docker-compose up -d 2>&1 | Out-Null
        Start-Sleep -Seconds 5
        Write-Success "PostgreSQL ve Redis başlatıldı"
        
        # Container'ları kontrol et
        $containers = docker ps --format "{{.Names}}"
        Write-Info "Çalışan container'lar:"
        foreach ($container in $containers) {
            Write-Host "  - $container" -ForegroundColor Gray
        }
    } catch {
        Write-Error "Docker container'ları başlatılamadı!"
        Write-Info "Manuel olarak çalıştırın: docker-compose up -d"
    }
} else {
    Write-Step "Veritabanı Kurulumu Atlandı"
    Write-Info "Docker yüklü olmadığı için PostgreSQL ve Redis'i manuel kurmalısınız"
    Write-Info "Detaylar için KURULUM_REHBERI.md dosyasına bakın"
}

# 5. Database migration'larını çalıştır
if ($dockerInstalled) {
    Write-Step "Veritabanı Migration'ları Çalıştırılıyor"
    
    Write-Info "5 saniye bekleniyor (PostgreSQL'in hazır olması için)..."
    Start-Sleep -Seconds 5
    
    try {
        Push-Location backend
        npm run migrate:up 2>&1 | Out-Null
        Pop-Location
        Write-Success "Migration'lar başarıyla çalıştırıldı"
    } catch {
        Write-Error "Migration'lar çalıştırılamadı!"
        Write-Info "PostgreSQL'in çalıştığından emin olun"
        Write-Info "Manuel olarak çalıştırın: cd backend && npm run migrate:up"
        Pop-Location
    }
}

# 6. Kurulum özeti
Write-Step "Kurulum Tamamlandı"

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Kurulum Başarılı! 🎉" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

Write-Host "Uygulamayı başlatmak için:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Seçenek 1 (Önerilen):" -ForegroundColor Yellow
Write-Host "    npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "  Seçenek 2 (Ayrı terminallerde):" -ForegroundColor Yellow
Write-Host "    Terminal 1: npm run dev:backend" -ForegroundColor White
Write-Host "    Terminal 2: npm run dev:frontend" -ForegroundColor White
Write-Host ""

Write-Host "Uygulama başladıktan sonra:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:   http://localhost:3001" -ForegroundColor White
Write-Host "  Health:    http://localhost:3001/health" -ForegroundColor White
Write-Host ""

if (-not $dockerInstalled) {
    Write-Host "⚠️  UYARI:" -ForegroundColor Red
    Write-Host "Docker yüklü olmadığı için PostgreSQL ve Redis'i manuel kurmalısınız!" -ForegroundColor Yellow
    Write-Host "Detaylar için KURULUM_REHBERI.md dosyasına bakın." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Daha fazla bilgi için:" -ForegroundColor Cyan
Write-Host "  - README.md" -ForegroundColor White
Write-Host "  - KURULUM_REHBERI.md" -ForegroundColor White
Write-Host "  - API_DOCUMENTATION.md" -ForegroundColor White
Write-Host ""
