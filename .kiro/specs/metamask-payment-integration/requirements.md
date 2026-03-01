# Requirements Document

## Introduction

Bu belge, kullanıcıların bakiye yükleme ve abonelik ödemeleri için MetaMask cüzdan entegrasyonu özelliğinin gereksinimlerini tanımlar. Sistem, kullanıcıların kripto para (USDT veya ETH) ile ödeme yapmalarını sağlayacak ve tüm ödemeler platform sahibinin MetaMask cüzdanına otomatik olarak aktarılacaktır.

## Glossary

- **Payment_System**: Kullanıcı ödemelerini işleyen ve blockchain üzerinde transfer gerçekleştiren sistem bileşeni
- **MetaMask_Wallet**: Kullanıcının Ethereum tabanlı kripto para cüzdanı tarayıcı eklentisi
- **Platform_Wallet**: Platform sahibinin ödemeleri topladığı MetaMask cüzdan adresi
- **Transaction_Hash**: Blockchain üzerinde gerçekleşen transferin benzersiz kimlik numarası
- **Web3_Provider**: Blockchain ile etkileşim sağlayan JavaScript kütüphanesi (ethers.js veya web3.js)
- **Smart_Contract**: Blockchain üzerinde çalışan, ödeme işlemlerini yöneten programlanabilir sözleşme (opsiyonel)
- **Gas_Fee**: Blockchain işlemi için ödenen ağ ücreti
- **USDT**: Tether USD stablecoin kripto parası
- **ETH**: Ethereum blockchain'in native kripto parası
- **Balance_Manager**: Kullanıcı bakiyelerini yöneten backend servisi
- **Transaction_Verifier**: Blockchain üzerindeki işlemleri doğrulayan servis
- **Deposit_Request**: Kullanıcının bakiye yükleme talebi
- **Subscription_Payment**: Kullanıcının abonelik satın alma ödemesi

## Requirements

### Requirement 1: MetaMask Cüzdan Bağlantısı

**User Story:** As a kullanıcı, I want to MetaMask cüzdanımı platforma bağlamak, so that kripto para ile ödeme yapabileyim

#### Acceptance Criteria

1. WHEN kullanıcı "MetaMask ile Bağlan" butonuna tıklar, THE Payment_System SHALL MetaMask eklentisinin yüklü olup olmadığını kontrol etmeli
2. IF MetaMask yüklü değilse, THEN THE Payment_System SHALL kullanıcıya MetaMask yükleme sayfasına yönlendirme linki göstermeli
3. WHEN MetaMask yüklüyse, THE Payment_System SHALL kullanıcıdan cüzdan bağlantısı için izin istemeli
4. WHEN kullanıcı bağlantıyı onaylar, THE Payment_System SHALL kullanıcının cüzdan adresini almalı ve session'da saklamalı
5. THE Payment_System SHALL bağlı cüzdan adresini kullanıcı arayüzünde kısaltılmış formatta (0x1234...5678) göstermeli
6. WHEN kullanıcı cüzdan bağlantısını reddeder, THE Payment_System SHALL kullanıcıya bilgilendirme mesajı göstermeli
7. THE Payment_System SHALL kullanıcının bağlı olduğu blockchain ağını (Ethereum Mainnet, Polygon, BSC) tespit etmeli

### Requirement 2: Bakiye Yükleme İşlemi

**User Story:** As a kullanıcı, I want to hesabıma kripto para ile bakiye yüklemek, so that platform özelliklerini kullanabileyim

#### Acceptance Criteria

1. WHEN kullanıcı bakiye yükleme sayfasında miktar girer, THE Payment_System SHALL minimum yükleme tutarını (10 USD) kontrol etmeli
2. THE Payment_System SHALL kullanıcıya USDT ve ETH seçeneklerini sunmalı
3. WHEN kullanıcı kripto para türünü seçer, THE Payment_System SHALL güncel döviz kurunu kullanarak eşdeğer kripto miktarını hesaplamalı
4. THE Payment_System SHALL tahmini gas fee miktarını kullanıcıya göstermeli
5. WHEN kullanıcı "Yatır" butonuna tıklar, THE Payment_System SHALL MetaMask üzerinden transfer işlemini başlatmalı
6. THE Payment_System SHALL transfer işleminde alıcı adres olarak Platform_Wallet adresini kullanmalı
7. WHEN kullanıcı MetaMask'ta işlemi onaylar, THE Payment_System SHALL transaction hash'i almalı ve veritabanına kaydetmeli
8. THE Payment_System SHALL işlem durumunu "pending" olarak işaretlemeli
9. WHEN kullanıcı MetaMask'ta işlemi reddeder, THE Payment_System SHALL kullanıcıya iptal mesajı göstermeli

### Requirement 3: İşlem Doğrulama ve Bakiye Güncelleme

**User Story:** As a sistem, I want to blockchain üzerindeki işlemleri doğrulamak, so that kullanıcı bakiyesini güvenli şekilde güncelleyebileyim

#### Acceptance Criteria

1. WHEN bir Deposit_Request oluşturulur, THE Transaction_Verifier SHALL transaction hash'i kullanarak blockchain'den işlem detaylarını sorgulamalı
2. THE Transaction_Verifier SHALL işlemin en az 3 blok onayı almasını beklemelidir
3. WHEN işlem 3 blok onayı alır, THE Transaction_Verifier SHALL gönderen adresi, alıcı adresi ve miktarı doğrulamalı
4. IF alıcı adres Platform_Wallet ile eşleşmezse, THEN THE Transaction_Verifier SHALL işlemi "failed" olarak işaretlemeli ve kullanıcıyı bilgilendirmeli
5. IF gönderen adres kullanıcının bağlı cüzdan adresi ile eşleşmezse, THEN THE Transaction_Verifier SHALL işlemi "failed" olarak işaretlemeli
6. WHEN tüm doğrulamalar başarılı olur, THE Balance_Manager SHALL kullanıcının bakiyesini USD karşılığı kadar artırmalı
7. THE Transaction_Verifier SHALL işlem durumunu "completed" olarak güncellemeli
8. THE Payment_System SHALL kullanıcıya başarılı yükleme bildirimi göndermelidir
9. IF işlem 30 dakika içinde onaylanmazsa, THEN THE Transaction_Verifier SHALL işlemi "timeout" olarak işaretlemeli

### Requirement 4: Abonelik Ödemesi

**User Story:** As a kullanıcı, I want to premium abonelik satın almak için kripto para ile ödeme yapmak, so that premium özelliklere erişebileyim

#### Acceptance Criteria

1. WHEN kullanıcı premium abonelik satın alma sayfasında, THE Payment_System SHALL abonelik planlarını (aylık, yıllık) ve fiyatlarını göstermeli
2. THE Payment_System SHALL her plan için USDT ve ETH karşılıklarını hesaplamalı
3. WHEN kullanıcı bir plan seçer ve "MetaMask ile Öde" butonuna tıklar, THE Payment_System SHALL MetaMask bağlantısını kontrol etmeli
4. THE Payment_System SHALL abonelik ücretini Platform_Wallet adresine transfer işlemini başlatmalı
5. WHEN kullanıcı işlemi onaylar, THE Payment_System SHALL transaction hash'i Subscription_Payment kaydına bağlamalı
6. THE Payment_System SHALL ödeme durumunu "pending" olarak işaretlemeli
7. WHEN Transaction_Verifier ödemeyi doğrular, THE Payment_System SHALL kullanıcının aboneliğini aktif etmeli
8. THE Payment_System SHALL kullanıcının rolünü "premium" olarak güncellemeli
9. THE Payment_System SHALL abonelik başlangıç ve bitiş tarihlerini kaydetmeli

### Requirement 5: İşlem Geçmişi ve Raporlama

**User Story:** As a kullanıcı, I want to kripto para işlem geçmişimi görmek, so that ödemelerimi takip edebilleyim

#### Acceptance Criteria

1. THE Payment_System SHALL kullanıcının tüm deposit ve subscription payment işlemlerini listelemelidir
2. THE Payment_System SHALL her işlem için tarih, miktar, kripto para türü, transaction hash ve durum bilgilerini göstermeli
3. WHEN kullanıcı bir transaction hash'e tıklar, THE Payment_System SHALL blockchain explorer'da (Etherscan) işlemi yeni sekmede açmalı
4. THE Payment_System SHALL işlemleri tarihe göre sıralama ve filtreleme seçenekleri sunmalı
5. THE Payment_System SHALL pending, completed, failed ve timeout durumlarını farklı renklerle göstermeli

### Requirement 6: Platform Cüzdan Yönetimi

**User Story:** As a platform sahibi, I want to toplanan ödemeleri tek bir cüzdanda görmek, so that gelir takibi yapabileyim

#### Acceptance Criteria

1. THE Payment_System SHALL Platform_Wallet adresini environment variable'dan okumalı
2. THE Payment_System SHALL Platform_Wallet adresinin geçerli bir Ethereum adresi olduğunu doğrulamalı
3. WHERE admin paneli mevcutsa, THE Payment_System SHALL Platform_Wallet bakiyesini göstermeli
4. WHERE admin paneli mevcutsa, THE Payment_System SHALL toplam deposit ve subscription gelirlerini ayrı ayrı raporlamalı
5. THE Payment_System SHALL Platform_Wallet adresini kod içinde hardcode etmemeli, sadece environment variable kullanmalı

### Requirement 7: Hata Yönetimi ve Güvenlik

**User Story:** As a sistem, I want to ödeme işlemlerinde oluşabilecek hataları yönetmek, so that kullanıcı deneyimi kesintisiz olsun

#### Acceptance Criteria

1. IF kullanıcının cüzdanında yeterli bakiye yoksa, THEN THE Payment_System SHALL işlem başlatmadan önce kullanıcıyı uyarmalı
2. IF kullanıcının cüzdanında gas fee için yeterli ETH yoksa, THEN THE Payment_System SHALL kullanıcıyı bilgilendirmeli
3. WHEN blockchain ağı yoğunsa ve gas fee yüksekse, THE Payment_System SHALL kullanıcıyı uyarmalı
4. IF MetaMask bağlantısı kesilirse, THEN THE Payment_System SHALL kullanıcıdan yeniden bağlanmasını istemeli
5. THE Payment_System SHALL tüm kritik işlemleri audit log'a kaydetmeli
6. THE Payment_System SHALL kullanıcının private key'ine asla erişmemeli, tüm imzalama işlemleri MetaMask üzerinden yapılmalı
7. THE Payment_System SHALL transaction hash'leri veritabanında unique constraint ile saklamalı
8. IF aynı transaction hash ile birden fazla işlem kaydedilmeye çalışılırsa, THEN THE Payment_System SHALL duplicate işlemi reddetmeli
9. THE Payment_System SHALL rate limiting uygulayarak spam işlemleri engellemeli

### Requirement 8: Çoklu Ağ Desteği

**User Story:** As a kullanıcı, I want to farklı blockchain ağlarında ödeme yapabilmek, so that daha düşük işlem ücretleri ödeyebilleyim

#### Acceptance Criteria

1. THE Payment_System SHALL Ethereum Mainnet, Polygon ve Binance Smart Chain ağlarını desteklemeli
2. WHEN kullanıcı desteklenmeyen bir ağa bağlıysa, THE Payment_System SHALL kullanıcıdan desteklenen bir ağa geçmesini istemeli
3. THE Payment_System SHALL her ağ için farklı Platform_Wallet adresleri kullanabilmeli
4. THE Payment_System SHALL işlem kaydında hangi ağın kullanıldığını saklamalı
5. THE Payment_System SHALL her ağ için farklı minimum yükleme tutarları belirleyebilmeli

### Requirement 9: Fiyat Dönüşümü ve Kur Güncellemesi

**User Story:** As a sistem, I want to kripto para fiyatlarını güncel tutmak, so that doğru USD karşılıkları hesaplayabileyim

#### Acceptance Criteria

1. THE Payment_System SHALL USDT ve ETH fiyatlarını güvenilir bir API'den (CoinGecko, CoinMarketCap) almalı
2. THE Payment_System SHALL fiyat verilerini her 60 saniyede bir güncellemeli
3. WHEN fiyat API'si erişilemezse, THE Payment_System SHALL son bilinen fiyatları kullanmalı ve kullanıcıyı bilgilendirmeli
4. THE Payment_System SHALL fiyat dönüşümlerinde %2 tolerans payı bırakmalı (slippage protection)
5. THE Payment_System SHALL kullanıcıya işlem anında kullanılan kuru göstermeli

### Requirement 10: Geri Ödeme ve İptal İşlemleri

**User Story:** As a kullanıcı, I want to hatalı ödemelerde geri ödeme talep edebilmek, so that paramı geri alabileceğim

#### Acceptance Criteria

1. WHERE kullanıcı yanlış miktar gönderirse, THE Payment_System SHALL manuel geri ödeme talebi oluşturma imkanı sunmalı
2. THE Payment_System SHALL geri ödeme taleplerini admin panelinde listelemelidir
3. WHERE admin paneli mevcutsa, THE Payment_System SHALL admin onayı ile geri ödeme işlemini başlatabilmeli
4. THE Payment_System SHALL geri ödeme işlemlerini audit log'a kaydetmeli
5. IF işlem henüz onaylanmadıysa (pending durumunda), THEN THE Payment_System SHALL kullanıcıya işlemi iptal etme seçeneği sunmalı

