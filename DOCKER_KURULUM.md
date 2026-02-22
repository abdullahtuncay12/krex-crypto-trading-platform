# Docker ile PostgreSQL ve Redis Kurulumu

## Adım 1: Docker Desktop Kurulumu

Eğer Docker Desktop kurulu değilse:
1. https://www.docker.com/products/docker-desktop/ adresinden indirin
2. Kurun ve başlatın
3. Docker Desktop'ın çalıştığından emin olun (sistem tepsisinde Docker ikonu görünmeli)

## Adım 2: Veritabanı ve Redis'i Başlatın

Proje ana dizininde (docker-compose.yml dosyasının olduğu yerde):

```bash
# Docker container'ları başlat
docker-compose up -d

# Container'ların çalıştığını kontrol et
docker-compose ps
```

Çıktı şöyle görünmeli:
```
NAME                        STATUS
crypto-signals-postgres     Up (healthy)
crypto-signals-redis        Up (healthy)
```

## Adım 3: Migration'ları Çalıştırın

```bash
cd backend
npm run migrate
```

## Adım 4: Backend'i Yeniden Başlatın

Backend terminalinde:
- Ctrl+C ile durdurun
- `npm run dev` ile yeniden başlatın

## Adım 5: Test Edin

Frontend'de kayıt olmayı deneyin!

## Sorun Giderme

### Docker çalışmıyor
```bash
# Docker Desktop'ın çalıştığından emin olun
# Windows: Başlat menüsünden "Docker Desktop" açın
```

### Port zaten kullanımda
```bash
# Eğer 5432 veya 6379 portları kullanımdaysa:
docker-compose down
# Ardından tekrar:
docker-compose up -d
```

### Container'ları durdurmak için
```bash
docker-compose down
```

### Container'ları silmek için (veritabanı dahil)
```bash
docker-compose down -v
```

### Logları görmek için
```bash
docker-compose logs postgres
docker-compose logs redis
```
