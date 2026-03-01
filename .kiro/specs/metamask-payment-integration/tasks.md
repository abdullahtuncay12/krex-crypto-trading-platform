# Implementation Plan: MetaMask Payment Integration

## Overview

Bu implementation plan, kullanıcıların MetaMask cüzdanları ile kripto para (USDT ve ETH) ödemesi yapabilmelerini sağlayan entegrasyon sisteminin adım adım kodlama görevlerini içerir. Sistem, bakiye yükleme, abonelik ödemesi, blockchain doğrulama ve gerçek zamanlı fiyat dönüşümü özelliklerini kapsar.

## Tasks

- [ ] 1. Database schema ve migrations oluştur
  - Database migration dosyası oluştur (012_create_crypto_payment_tables.sql)
  - crypto_transactions, crypto_wallets, crypto_price_cache ve refund_requests tablolarını oluştur
  - subscriptions tablosuna payment_method ve crypto_transaction_id kolonlarını ekle
  - Gerekli index'leri ve constraint'leri tanımla
  - _Requirements: 2.7, 3.1, 4.5, 5.1, 6.1, 7.7, 8.4, 10.1_

- [ ] 2. Environment configuration ve Web3 provider setup
  - Environment variables tanımla (.env.example güncelle)
  - Web3Provider utility class'ı oluştur (backend/src/services/Web3Provider.ts)
  - Blockchain network provider'larını initialize et (Ethereum, Polygon, BSC)
  - Platform wallet adreslerini validate et
  - Gas fee estimation fonksiyonlarını implement et
  - _Requirements: 1.7, 2.4, 6.2, 8.1, 8.2, 8.3_


- [ ]* 2.1 Write property test for Web3Provider
  - **Property 25: Platform Wallet Validasyonu**
  - **Validates: Requirements 6.2**

- [ ] 3. Price conversion service implementation
  - [ ] 3.1 PriceConversionService class'ı oluştur (backend/src/services/PriceConversionService.ts)
    - CoinGecko/CoinMarketCap API client entegrasyonu
    - Redis cache entegrasyonu
    - USD to Crypto ve Crypto to USD dönüşüm fonksiyonları
    - Slippage protection ile dönüşüm
    - Fallback price mechanism
    - _Requirements: 2.3, 9.1, 9.2, 9.3, 9.4_

  - [ ]* 3.2 Write property tests for PriceConversionService
    - **Property 6: Fiyat Dönüşüm Doğruluğu**
    - **Property 30: Fiyat API Entegrasyonu**
    - **Property 31: Fiyat Fallback Mekanizması**
    - **Validates: Requirements 2.3, 9.1, 9.3, 9.4**

  - [ ]* 3.3 Write unit tests for PriceConversionService
    - Test API failure scenarios
    - Test cache hit/miss scenarios
    - Test slippage calculation
    - _Requirements: 9.3, 9.4_

- [ ] 4. Transaction verifier service implementation
  - [ ] 4.1 TransactionVerifier class'ı oluştur (backend/src/services/TransactionVerifier.ts)
    - Transaction doğrulama fonksiyonları
    - Blok onay kontrolü (minimum 3 blok)
    - Adres ve miktar doğrulama
    - Pending transactions işleme
    - Timeout kontrolü (30 dakika)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.9_

  - [ ]* 4.2 Write property tests for TransactionVerifier
    - **Property 12: Blockchain Doğrulama**
    - **Property 13: Blok Onay Eşiği**
    - **Property 14: Adres Doğrulama Reddi**
    - **Property 16: Doğrulama Sonrası Durum Geçişi**
    - **Validates: Requirements 3.1, 3.2, 3.4, 3.5, 3.7**

  - [ ]* 4.3 Write unit tests for TransactionVerifier
    - Test wrong recipient address scenario
    - Test wrong sender address scenario
    - Test insufficient confirmations
    - Test timeout handling
    - _Requirements: 3.4, 3.5, 3.9_


- [ ] 5. Data models ve repositories oluştur
  - [ ] 5.1 CryptoTransaction model ve repository oluştur
    - CryptoTransaction interface tanımla (backend/src/models/CryptoTransaction.ts)
    - CryptoTransactionRepository class'ı oluştur (backend/src/models/CryptoTransactionRepository.ts)
    - CRUD operations implement et
    - Transaction hash uniqueness kontrolü
    - Status update fonksiyonları
    - _Requirements: 2.7, 3.7, 4.5, 5.1, 7.7_

  - [ ]* 5.2 Write property tests for CryptoTransactionRepository
    - **Property 9: Transaction Hash Kayıt Round-Trip**
    - **Property 11: Transaction Hash Uniqueness**
    - **Property 29: Ağ Bilgisi Persistance**
    - **Validates: Requirements 2.7, 7.7, 8.4**

  - [ ] 5.3 CryptoWallet model ve repository oluştur
    - CryptoWallet interface tanımla (backend/src/models/CryptoWallet.ts)
    - CryptoWalletRepository class'ı oluştur (backend/src/models/CryptoWalletRepository.ts)
    - Wallet kaydetme ve sorgulama fonksiyonları
    - _Requirements: 1.4, 8.3_

  - [ ]* 5.4 Write property tests for CryptoWalletRepository
    - **Property 2: Cüzdan Adresi Session Round-Trip**
    - **Property 28: Ağ Bazlı Wallet Yönetimi**
    - **Validates: Requirements 1.4, 8.3**

  - [ ] 5.5 RefundRequest model ve repository oluştur (opsiyonel)
    - RefundRequest interface tanımla (backend/src/models/RefundRequest.ts)
    - RefundRequestRepository class'ı oluştur (backend/src/models/RefundRequestRepository.ts)
    - Geri ödeme talep yönetimi fonksiyonları
    - _Requirements: 10.1, 10.2_

- [ ] 6. Balance manager service implementation
  - [ ] 6.1 BalanceManager service'i güncelle veya genişlet
    - Crypto deposit'ten gelen bakiye artırma fonksiyonu
    - Atomic transaction handling
    - Audit logging entegrasyonu
    - _Requirements: 3.6, 7.5_

  - [ ]* 6.2 Write property tests for BalanceManager
    - **Property 15: Bakiye Artış Doğruluğu**
    - **Property 26: Audit Log Bütünlüğü**
    - **Validates: Requirements 3.6, 7.5**

  - [ ]* 6.3 Write unit tests for BalanceManager
    - Test balance update with slippage tolerance
    - Test atomic transaction rollback
    - Test audit log creation
    - _Requirements: 3.6, 7.5_


- [ ] 7. Crypto payment service implementation
  - [ ] 7.1 CryptoPaymentService class'ı oluştur (backend/src/services/CryptoPaymentService.ts)
    - Deposit request oluşturma
    - Subscription payment oluşturma
    - Transaction geçmişi sorgulama
    - Fiyat hesaplama fonksiyonları
    - Rate limiting entegrasyonu
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.8, 4.1, 4.2, 4.4, 4.6, 5.1, 7.9_

  - [ ]* 7.2 Write property tests for CryptoPaymentService
    - **Property 5: Minimum Tutar Validasyonu**
    - **Property 8: Platform Wallet Invariant**
    - **Property 10: Yeni İşlem Durumu Invariant**
    - **Property 18: Abonelik Fiyat Hesaplama**
    - **Property 21: İşlem Listeleme Bütünlüğü**
    - **Property 27: Rate Limiting**
    - **Validates: Requirements 2.1, 2.6, 2.8, 4.2, 4.4, 4.6, 5.1, 7.9, 8.5**

  - [ ]* 7.3 Write unit tests for CryptoPaymentService
    - Test deposit creation with valid data
    - Test subscription payment creation
    - Test transaction filtering and sorting
    - Test rate limit enforcement
    - _Requirements: 2.1, 4.1, 5.4, 7.9_

- [ ] 8. Subscription manager integration
  - [ ] 8.1 SubscriptionManager service'i güncelle
    - Crypto payment ile subscription activation
    - User role güncelleme (premium)
    - Subscription start/end date hesaplama
    - Atomic transaction handling
    - _Requirements: 4.7, 4.8, 4.9_

  - [ ]* 8.2 Write property tests for SubscriptionManager
    - **Property 20: Abonelik Aktivasyon Zinciri**
    - **Validates: Requirements 4.7, 4.8, 4.9**

  - [ ]* 8.3 Write unit tests for SubscriptionManager
    - Test subscription activation with crypto payment
    - Test user role update
    - Test date calculation for monthly/yearly plans
    - _Requirements: 4.7, 4.8, 4.9_

- [ ] 9. Checkpoint - Backend services tamamlandı
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 10. API routes implementation
  - [ ] 10.1 Crypto payment routes oluştur (backend/src/routes/crypto.ts)
    - POST /api/crypto/connect - Wallet bağlantısı kaydet
    - GET /api/crypto/price - Fiyat bilgisi al
    - POST /api/crypto/deposit - Deposit request oluştur
    - GET /api/crypto/deposit/:requestId - Deposit durumu sorgula
    - POST /api/crypto/subscription-payment - Subscription payment oluştur
    - GET /api/crypto/transactions - Transaction geçmişi
    - GET /api/crypto/gas-estimate - Gas fee tahmini
    - Rate limiting middleware ekle
    - Authentication middleware ekle
    - _Requirements: 1.4, 2.1, 2.3, 2.5, 3.1, 4.3, 5.1, 5.4, 7.9_

  - [ ]* 10.2 Write integration tests for crypto routes
    - Test full deposit flow
    - Test full subscription payment flow
    - Test authentication requirements
    - Test rate limiting
    - Test error responses
    - _Requirements: 2.1, 4.1, 7.9_

  - [ ]* 10.3 Write unit tests for route handlers
    - Test input validation
    - Test error handling
    - Test response formatting
    - _Requirements: 2.1, 4.1, 5.1_

- [ ] 11. Background jobs implementation
  - [ ] 11.1 Crypto jobs oluştur (backend/src/jobs/cryptoJobs.ts)
    - Transaction verification job (her 30 saniye)
    - Timeout check job (her 5 dakika)
    - Price update job (her 60 saniye)
    - node-cron ile schedule et
    - Error handling ve logging
    - _Requirements: 3.1, 3.8, 3.9, 9.1, 9.2_

  - [ ]* 11.2 Write unit tests for crypto jobs
    - Test job execution
    - Test error handling
    - Test scheduling
    - _Requirements: 3.1, 3.9, 9.2_

- [ ] 12. Notification service integration
  - [ ] 12.1 NotificationService'i güncelle
    - Deposit success notification
    - Transaction timeout notification
    - Subscription activation notification
    - _Requirements: 3.8, 3.9, 4.7_

  - [ ]* 12.2 Write unit tests for notification integration
    - Test notification sending
    - Test notification content
    - _Requirements: 3.8, 3.9_


- [x] 13. Frontend - MetaMask connection implementation
  - [x] 13.1 MetaMask utility fonksiyonları oluştur (frontend/src/utils/metamask.ts)
    - MetaMask detection
    - Wallet connection request
    - Network detection
    - Account change listener
    - Network change listener
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7, 7.4_

  - [ ]* 13.2 Write property tests for MetaMask utilities
    - **Property 1: MetaMask Varlık Kontrolü**
    - **Property 3: Adres Formatlama**
    - **Property 4: Ağ Tespiti**
    - **Validates: Requirements 1.1, 1.5, 1.7**

  - [ ]* 13.3 Write unit tests for MetaMask utilities
    - Test MetaMask not installed scenario
    - Test user rejection scenario
    - Test disconnection handling
    - _Requirements: 1.2, 1.6, 7.4_

- [x] 14. Frontend - Redux slice for crypto payments
  - [x] 14.1 cryptoPaymentSlice oluştur (frontend/src/store/slices/cryptoPaymentSlice.ts)
    - State interface tanımla
    - Wallet connection actions
    - Price update actions
    - Transaction tracking actions
    - Async thunks (API calls)
    - _Requirements: 1.4, 1.5, 2.3, 5.1_

  - [ ]* 14.2 Write unit tests for cryptoPaymentSlice
    - Test state updates
    - Test async thunks
    - Test error handling
    - _Requirements: 1.4, 2.3, 5.1_

- [x] 15. Frontend - MetaMaskConnectButton component
  - [x] 15.1 MetaMaskConnectButton component oluştur (frontend/src/components/MetaMaskConnectButton.tsx)
    - MetaMask detection ve install prompt
    - Connect/Disconnect button
    - Wallet address display (kısaltılmış format)
    - Network display
    - Error handling ve user feedback
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ]* 15.2 Write unit tests for MetaMaskConnectButton
    - Test install prompt display
    - Test connection flow
    - Test address formatting display
    - Test rejection message
    - _Requirements: 1.2, 1.5, 1.6_


- [ ] 16. Frontend - CryptoDepositForm component
  - [ ] 16.1 CryptoDepositForm component oluştur (frontend/src/components/CryptoDepositForm.tsx)
    - USD amount input ve validation (minimum 10 USD)
    - Currency selector (USDT/ETH)
    - Real-time price conversion display
    - Gas fee estimate display
    - Deposit button ve MetaMask transaction trigger
    - Transaction status tracking
    - Error handling (insufficient balance, high gas fee)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.9, 7.1, 7.2, 7.3_

  - [ ]* 16.2 Write property tests for CryptoDepositForm
    - **Property 7: Gas Fee Pozitifliği**
    - **Property 19: MetaMask Bağlantı Kontrolü**
    - **Validates: Requirements 2.4, 4.3**

  - [ ]* 16.3 Write unit tests for CryptoDepositForm
    - Test minimum amount validation
    - Test currency selection
    - Test insufficient balance warning
    - Test high gas fee warning
    - _Requirements: 2.1, 2.2, 7.1, 7.2, 7.3_

- [ ] 17. Frontend - SubscriptionPaymentModal component
  - [ ] 17.1 SubscriptionPaymentModal component oluştur (frontend/src/components/SubscriptionPaymentModal.tsx)
    - Subscription plan display (monthly/yearly)
    - Price display (USD ve crypto equivalent)
    - Currency selector (USDT/ETH)
    - Payment button ve MetaMask transaction trigger
    - Transaction status tracking
    - Success/error feedback
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 17.2 Write unit tests for SubscriptionPaymentModal
    - Test plan display
    - Test price calculation display
    - Test payment flow
    - Test error handling
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 18. Frontend - TransactionHistoryList component
  - [ ] 18.1 TransactionHistoryList component oluştur (frontend/src/components/TransactionHistoryList.tsx)
    - Transaction list display
    - Transaction details (date, amount, currency, hash, status)
    - Status badges (pending, completed, failed, timeout)
    - Blockchain explorer link
    - Filtering ve sorting controls
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 18.2 Write property tests for TransactionHistoryList
    - **Property 22: İşlem Detay Bütünlüğü**
    - **Property 23: Explorer Link Oluşturma**
    - **Property 24: İşlem Filtreleme ve Sıralama**
    - **Validates: Requirements 5.2, 5.3, 5.4**

  - [ ]* 18.3 Write unit tests for TransactionHistoryList
    - Test transaction list rendering
    - Test status badge colors
    - Test explorer link generation
    - Test filtering
    - Test sorting
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_


- [ ] 19. Frontend - CryptoDepositPage integration
  - [ ] 19.1 CryptoDepositPage oluştur veya güncelle (frontend/src/pages/CryptoDepositPage.tsx)
    - MetaMaskConnectButton entegrasyonu
    - CryptoDepositForm entegrasyonu
    - TransactionHistoryList entegrasyonu
    - Page layout ve styling
    - _Requirements: 1.1, 2.1, 5.1_

  - [ ]* 19.2 Write integration tests for CryptoDepositPage
    - Test full page flow
    - Test component interactions
    - _Requirements: 1.1, 2.1, 5.1_

- [ ] 20. Frontend - Subscription page crypto payment integration
  - [ ] 20.1 Subscription page'i güncelle
    - "MetaMask ile Öde" button ekle
    - SubscriptionPaymentModal entegrasyonu
    - Payment success handling
    - _Requirements: 4.1, 4.3, 4.7_

  - [ ]* 20.2 Write integration tests for subscription crypto payment
    - Test payment modal opening
    - Test payment flow
    - Test subscription activation
    - _Requirements: 4.1, 4.7_

- [ ] 21. Checkpoint - Frontend components tamamlandı
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. WebSocket real-time notifications
  - [ ] 22.1 WebSocket server setup (backend/src/websocket/cryptoSocket.ts)
    - Socket.io connection handling
    - Transaction update events
    - User-specific rooms
    - _Requirements: 3.8_

  - [ ] 22.2 Frontend WebSocket client (frontend/src/utils/cryptoSocket.ts)
    - Socket.io client connection
    - Transaction update listener
    - Redux state update on events
    - _Requirements: 3.8_

  - [ ]* 22.3 Write integration tests for WebSocket
    - Test connection establishment
    - Test event emission and reception
    - Test room subscription
    - _Requirements: 3.8_


- [ ] 23. Error handling ve security implementation
  - [ ] 23.1 Error handler middleware güncelle
    - Crypto-specific error types ekle
    - User-friendly error messages
    - Error logging
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 23.2 Input validation middleware
    - Wallet address validation
    - Transaction hash validation
    - Amount validation
    - Network validation
    - _Requirements: 2.1, 6.2, 7.7, 8.2_

  - [ ] 23.3 Security measures implementation
    - Rate limiting configuration
    - SQL injection prevention (parameterized queries)
    - Audit logging for critical operations
    - Private key protection verification
    - _Requirements: 7.5, 7.6, 7.7, 7.9_

  - [ ]* 23.4 Write security tests
    - Test rate limiting enforcement
    - Test SQL injection prevention
    - Test audit log creation
    - Test private key non-exposure
    - _Requirements: 7.5, 7.6, 7.7, 7.9_

- [ ] 24. Admin panel integration (opsiyonel)
  - [ ] 24.1 Platform wallet dashboard (opsiyonel)
    - Platform wallet balance display
    - Total deposit revenue
    - Total subscription revenue
    - _Requirements: 6.3, 6.4_

  - [ ] 24.2 Refund management (opsiyonel)
    - Refund request list
    - Refund approval/rejection
    - Refund processing
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 25. End-to-end integration tests
  - [ ]* 25.1 Write E2E test for deposit flow
    - Test complete deposit flow from wallet connection to balance update
    - Test transaction verification
    - Test notification delivery
    - _Requirements: 1.1, 2.1, 3.1, 3.6, 3.8_

  - [ ]* 25.2 Write E2E test for subscription payment flow
    - Test complete subscription payment flow
    - Test subscription activation
    - Test user role update
    - _Requirements: 4.1, 4.7, 4.8, 4.9_

  - [ ]* 25.3 Write E2E test for error scenarios
    - Test insufficient balance scenario
    - Test wrong network scenario
    - Test transaction timeout scenario
    - _Requirements: 3.9, 7.1, 7.2, 8.2_


- [ ] 26. Performance optimization
  - [ ] 26.1 Redis cache implementation
    - Price data caching
    - Cache invalidation strategy
    - Cache hit/miss monitoring
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ] 26.2 Database query optimization
    - Index verification
    - Query performance testing
    - Connection pooling configuration
    - _Requirements: 5.1, 5.4_

  - [ ]* 26.3 Write performance tests
    - Test concurrent price conversions (100 requests)
    - Test parallel transaction verification (50 transactions)
    - Test database query performance
    - _Requirements: 9.1, 3.1_

- [ ] 27. Documentation ve deployment preparation
  - [ ] 27.1 API documentation oluştur
    - Crypto payment endpoints documentation
    - Request/response examples
    - Error codes documentation
    - _Requirements: All API endpoints_

  - [ ] 27.2 Environment variables documentation
    - .env.example güncelle
    - Environment variables açıklamaları
    - Platform wallet setup guide
    - _Requirements: 6.1, 6.2, 8.3_

  - [ ] 27.3 Deployment checklist oluştur
    - Database migration checklist
    - Environment configuration checklist
    - Security checklist
    - Monitoring setup checklist
    - _Requirements: All_

- [ ] 28. Monitoring ve alerting setup
  - [ ] 28.1 Metrics collection
    - Pending transaction count
    - Failed transaction rate
    - Average verification time
    - Price API uptime
    - _Requirements: 3.1, 3.9, 9.1_

  - [ ] 28.2 Alert configuration
    - High pending transaction count alert
    - High failed transaction rate alert
    - Price API down alert
    - Platform wallet low balance alert
    - _Requirements: 3.9, 9.3, 6.3_


- [ ] 29. Final integration ve testing
  - [ ] 29.1 Backend integration test
    - Test all services working together
    - Test background jobs execution
    - Test error recovery mechanisms
    - _Requirements: All backend requirements_

  - [ ] 29.2 Frontend integration test
    - Test all components working together
    - Test Redux state management
    - Test WebSocket real-time updates
    - _Requirements: All frontend requirements_

  - [ ] 29.3 Full system test
    - Test complete user journey (deposit)
    - Test complete user journey (subscription)
    - Test error scenarios
    - Test concurrent users
    - _Requirements: All requirements_

- [ ] 30. Final checkpoint - System ready for deployment
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all environment variables configured
  - Verify database migrations applied
  - Verify platform wallet addresses set
  - Verify monitoring and alerting configured

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (31 properties total)
- Unit tests validate specific examples and edge cases
- Integration tests validate component interactions
- E2E tests validate complete user flows
- Background jobs run automatically for transaction verification and price updates
- WebSocket provides real-time transaction status updates
- Security measures include rate limiting, input validation, and audit logging
- Admin panel features are optional and can be implemented later

## Implementation Order Rationale

1. Database schema first - foundation for all data storage
2. Backend services - core business logic
3. API routes - expose functionality to frontend
4. Background jobs - automated processing
5. Frontend components - user interface
6. Integration - wire everything together
7. Testing - ensure correctness and reliability
8. Optimization - improve performance
9. Documentation - enable deployment and maintenance
10. Monitoring - ensure production reliability

## Testing Strategy

This feature uses a dual testing approach:

- **Property-Based Tests**: Validate universal properties across wide input ranges (31 properties from design document)
- **Unit Tests**: Validate specific examples, edge cases, and error conditions
- **Integration Tests**: Validate component interactions and API flows
- **E2E Tests**: Validate complete user journeys

All property tests reference their property number from the design document for traceability.

## Security Considerations

- Never store or handle user private keys
- All transaction signing happens in MetaMask
- Platform wallet addresses stored in environment variables only
- Input validation on all user inputs
- Rate limiting to prevent abuse
- Audit logging for all critical operations
- SQL injection prevention through parameterized queries
- Transaction hash uniqueness enforcement

## Deployment Requirements

- PostgreSQL database with migrations applied
- Redis for caching
- Node.js backend with environment variables configured
- React frontend with MetaMask support
- Blockchain RPC endpoints (Ethereum, Polygon, BSC)
- CoinGecko/CoinMarketCap API key
- Platform wallet addresses for each network
- WebSocket server for real-time updates
- Monitoring and alerting system
