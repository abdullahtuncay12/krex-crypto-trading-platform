# Git Kurulum Rehberi (Windows)

## Hızlı Kurulum

### Yöntem 1: Winget ile Kurulum (Önerilen - En Hızlı)

PowerShell'i yönetici olarak açın ve şu komutu çalıştırın:

```powershell
winget install --id Git.Git -e --source winget
```

### Yöntem 2: Manuel İndirme

1. https://git-scm.com/download/win adresine gidin
2. "Click here to download" butonuna tıklayın
3. İndirilen `.exe` dosyasını çalıştırın
4. Kurulum sırasında tüm varsayılan ayarları kabul edin (Next, Next, Next...)

## Kurulum Sonrası

### 1. Terminal'i Yeniden Başlatın
Kurulum tamamlandıktan sonra **mutlaka** PowerShell veya terminal pencerenizi kapatıp yeniden açın!

### 2. Git Kurulumunu Kontrol Edin

```bash
git --version
```

Çıktı şöyle olmalı: `git version 2.x.x`

### 3. Git Yapılandırması

```bash
# Adınızı ayarlayın
git config --global user.name "Adınız Soyadınız"

# Email adresinizi ayarlayın (GitHub email'iniz)
git config --global user.email "email@example.com"

# Ayarları kontrol edin
git config --list
```

## Kurulum Tamamlandı!

Artık GitHub'a yükleme yapabilirsiniz. `GITHUB_YUKLEME_REHBERI.md` dosyasındaki adımları takip edin.

## Hızlı Başlangıç (Git Kurulduktan Sonra)

```bash
# Proje klasörünüzde
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/[kullanıcı-adınız]/[repo-adı].git
git push -u origin main
```
