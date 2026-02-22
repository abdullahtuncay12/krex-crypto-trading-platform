# GitHub'a Proje Yükleme Rehberi

## Adım 1: GitHub Hesabı ve Repository Oluşturma

### 1.1 GitHub Hesabı Açın (Eğer yoksa)
1. https://github.com adresine gidin
2. "Sign up" butonuna tıklayın
3. Email, kullanıcı adı ve şifre belirleyin
4. Hesabınızı doğrulayın

### 1.2 Yeni Repository Oluşturun
1. GitHub'da oturum açın
2. Sağ üst köşedeki "+" işaretine tıklayın
3. "New repository" seçin
4. Repository bilgilerini doldurun:
   - **Repository name**: `crypto-trading-platform` (veya istediğiniz isim)
   - **Description**: "Cryptocurrency Trading Signals and Auto Trading Bot Platform"
   - **Visibility**: Private veya Public (tercihinize göre)
   - ⚠️ **ÖNEMLİ**: "Add a README file", "Add .gitignore", "Choose a license" seçeneklerini **İŞARETLEMEYİN** (boş bırakın)
5. "Create repository" butonuna tıklayın

## Adım 2: Git Kurulumu (Eğer yoksa)

### Windows için Git Kurulumu
1. https://git-scm.com/download/win adresine gidin
2. İndirilen dosyayı çalıştırın
3. Kurulum sırasında tüm varsayılan ayarları kabul edin
4. Kurulum tamamlandıktan sonra terminali yeniden başlatın

### Git Kurulumunu Kontrol Edin
```bash
git --version
```

## Adım 3: Git Yapılandırması

Terminal'de (proje klasörünüzde) şu komutları çalıştırın:

```bash
# Git kullanıcı bilgilerinizi ayarlayın
git config --global user.name "Adınız Soyadınız"
git config --global user.email "github-email@example.com"
```

## Adım 4: Projeyi GitHub'a Yükleyin

### 4.1 Git Repository'sini Başlatın
Proje klasörünüzde terminal açın ve şu komutları sırayla çalıştırın:

```bash
# Git repository'sini başlat
git init

# Tüm dosyaları staging area'ya ekle
git add .

# İlk commit'i oluştur
git commit -m "Initial commit - Crypto Trading Platform"

# Ana branch'i 'main' olarak ayarla
git branch -M main
```

### 4.2 GitHub Repository'sine Bağlanın

GitHub'da oluşturduğunuz repository sayfasında gösterilen URL'yi kopyalayın.
URL şu formatta olacak: `https://github.com/[kullanıcı-adınız]/[repo-adı].git`

```bash
# Remote repository ekle (URL'yi kendi repository URL'nizle değiştirin)
git remote add origin https://github.com/[kullanıcı-adınız]/crypto-trading-platform.git

# Kodu GitHub'a yükle
git push -u origin main
```

### 4.3 GitHub Kimlik Doğrulama

İlk push işleminde GitHub kimlik bilgilerinizi isteyecek:

**Seçenek 1: Personal Access Token (Önerilen)**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)" tıklayın
3. Token'a bir isim verin (örn: "Crypto Trading Platform")
4. "repo" yetkisini seçin
5. "Generate token" tıklayın
6. Oluşan token'ı kopyalayın (bir daha göremezsiniz!)
7. Git push yaparken şifre yerine bu token'ı kullanın

**Seçenek 2: GitHub CLI (Alternatif)**
```bash
# GitHub CLI kur
winget install --id GitHub.cli

# GitHub'a giriş yap
gh auth login
```

## Adım 5: Yüklemeyi Doğrulayın

1. GitHub repository sayfanızı yenileyin
2. Tüm dosyalarınızın yüklendiğini görmelisiniz
3. `backend/`, `frontend/`, `railway.json` gibi klasör ve dosyalar görünmeli

## Sonraki Adım: Railway Deployment

Artık projeniz GitHub'da! Railway'e deploy etmek için:

1. https://railway.app adresine gidin
2. "Login with GitHub" tıklayın
3. "New Project" → "Deploy from GitHub repo"
4. Repository'nizi seçin
5. Railway otomatik olarak `railway.json` dosyasını okuyacak

Detaylı Railway deployment için `RAILWAY_DEPLOYMENT.md` dosyasına bakın.

## Yaygın Sorunlar ve Çözümleri

### Sorun 1: "git: command not found"
**Çözüm**: Git'i kurun (Adım 2'ye bakın) ve terminali yeniden başlatın

### Sorun 2: "Permission denied (publickey)"
**Çözüm**: Personal Access Token kullanın (Adım 4.3'e bakın)

### Sorun 3: "remote origin already exists"
**Çözüm**: 
```bash
git remote remove origin
git remote add origin https://github.com/[kullanıcı-adınız]/[repo-adı].git
```

### Sorun 4: Çok fazla dosya var, yükleme uzun sürüyor
**Çözüm**: Normal, ilk yükleme biraz zaman alabilir. Bekleyin.

### Sorun 5: "node_modules" klasörü çok büyük
**Çözüm**: `.gitignore` dosyası zaten node_modules'ü hariç tutuyor. Eğer yine de sorun varsa:
```bash
git rm -r --cached node_modules
git commit -m "Remove node_modules"
git push
```

## Hızlı Komut Özeti

```bash
# 1. Git başlat
git init

# 2. Dosyaları ekle
git add .

# 3. Commit oluştur
git commit -m "Initial commit"

# 4. Branch ayarla
git branch -M main

# 5. Remote ekle (URL'yi değiştirin!)
git remote add origin https://github.com/[kullanıcı-adınız]/[repo-adı].git

# 6. GitHub'a yükle
git push -u origin main
```

## İleride Değişiklik Yapmak İçin

Projenizde değişiklik yaptığınızda:

```bash
# Değişiklikleri ekle
git add .

# Commit oluştur
git commit -m "Değişiklik açıklaması"

# GitHub'a yükle
git push
```

Railway otomatik olarak her push'ta yeniden deploy edecek!
