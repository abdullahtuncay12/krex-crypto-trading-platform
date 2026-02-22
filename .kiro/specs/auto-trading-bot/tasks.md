# Implementation Plan: Otomatik Ticaret Botu

## Overview

Bu implementasyon planı, otomatik ticaret botu özelliğini ayrık, artımlı kodlama görevlerine ayırır. Yaklaşım bottom-up strateji izler: temel altyapıdan (veritabanı, modeller) başlayarak core servisleri (AI stratejisi, trade execution) oluşturur, API katmanını implement eder ve son olarak React frontend'i yaratır. Her görev önceki çalışmalar üzerine inşa edilir, orphaned kod bırakmaz ve testler aracılığıyla erken doğrulama sağlar.

Mevcut crypto-trading-signals sisteminin altyapısı (auth, exchange clients, database connection) kullanılacaktır.

## Tasks

- [x] 1. Veritabanı migration'larını ve modelleri oluştur
  - [x] 1.1 bot_investments tablosu için migration oluştur
    - id, user_id, cryptocurrency, principal_amount, trading_period_hours, start_time, end_time, status, current_value, final_value, profit, commission, risk_acknowledged_at, cancellation_reason, cancelled_at, created_at, updated_at kolonlarını tanımla
    - user_id, status, end_time, cryptocurrency üzerinde index'ler oluştur
    - user_id için foreign key constraint ekle (users tablosuna)
    - _Requirements: 10.1, 10.2_
  
  - [x] 1.2 bot_trades tablosu için migration oluştur
    - id, investment_id, trade_type, cryptocurrency, quantity, price, total_value, exchange, executed_at, strategy_confidence, created_at kolonlarını tanımla
    - investment_id, executed_at, exchange üzerinde index'ler oluştur
    - investment_id için foreign key constraint ekle (bot_investments tablosuna)
    - _Requirements: 10.3, 10.4, 10.5_
  
  - [x] 1.3 bot_positions tablosu için migration oluştur
    - id, investment_id, cryptocurrency, quantity, entry_price, current_price, stop_loss, status, opened_at, closed_at, profit_loss kolonlarını tanımla
    - investment_id ve status üzerinde index'ler oluştur
    - investment_id için foreign key constraint ekle
    - _Requirements: 4.4, 5.6_
  
  - [x] 1.4 investment_value_history tablosu için migration oluştur
    - id, investment_id, value, timestamp kolonlarını tanımla
    - investment_id ve timestamp üzerinde composite index oluştur
    - investment_id için foreign key constraint ekle
    - _Requirements: 13.5_
  
  - [x] 1.5 audit_logs tablosu için migration oluştur (eğer yoksa)
    - id, entity_type, entity_id, action, old_state, new_state, user_id, ip_address, timestamp kolonlarını tanımla
    - entity_type+entity_id composite index, timestamp ve user_id index'leri oluştur
    - _Requirements: 11.4, 14.5, 19.1, 19.2_


- [x] 2. Backend repository ve model sınıflarını implement et
  - [x] 2.1 BotInvestmentRepository oluştur
    - create, findById, findByUserId, findByStatus, update, updateValue, updateStatus metodlarını implement et
    - TypeScript interface'i tanımla (BotInvestment)
    - _Requirements: 1.5, 6.8, 8.1, 8.2_
  
  - [x] 2.2 BotTradeRepository oluştur
    - create, findByInvestmentId, findByExchange metodlarını implement et
    - TypeScript interface'i tanımla (BotTrade)
    - _Requirements: 4.5, 10.4_
  
  - [x] 2.3 BotPositionRepository oluştur
    - create, findByInvestmentId, findOpenPositions, closePosition, updatePrice metodlarını implement et
    - TypeScript interface'i tanımla (BotPosition)
    - _Requirements: 4.4, 6.3_
  
  - [x] 2.4 InvestmentValueHistoryRepository oluştur
    - create, findByInvestmentId metodlarını implement et
    - TypeScript interface'i tanımla (InvestmentValueHistory)
    - _Requirements: 13.5_
  
  - [ ]* 2.5 Repository'ler için unit testler yaz
    - Her repository için CRUD operasyonlarını test et
    - Foreign key constraint'leri test et
    - Index performansını doğrula
    - _Requirements: 10.1, 10.3_

- [x] 3. BalanceManager servisini implement et
  - [x] 3.1 BalanceManager sınıfını oluştur
    - getUserBalance metodunu implement et
    - getAvailableBalance metodunu implement et (total - locked in active investments)
    - validateSufficientBalance metodunu implement et
    - _Requirements: 1.2, 11.6_
  
  - [x] 3.2 Balance deduction ve credit metodlarını ekle
    - deductForInvestment metodunu implement et (atomic transaction)
    - creditFromInvestment metodunu implement et (atomic transaction)
    - Transaction rollback mekanizması ekle
    - Audit log kaydı ekle
    - _Requirements: 1.6, 6.7, 11.1, 11.2, 11.3, 11.4_
  
  - [ ]* 3.3 BalanceManager için property testler yaz
    - **Property 6: Balance deduction on investment creation**
    - **Property 23: Balance credit on completion**
    - **Property 37: Transaction rollback on failure**
    - **Property 38: Balance change audit logging**
    - **Property 39: Available balance calculation**
    - **Validates: Requirements 1.6, 6.7, 11.1, 11.2, 11.3, 11.4, 11.6**
  
  - [ ]* 3.4 BalanceManager için unit testler yaz
    - Başarılı balance deduction test et
    - Başarılı balance credit test et
    - Yetersiz bakiye durumunu test et
    - Transaction rollback'i test et
    - Available balance hesaplamasını test et
    - _Requirements: 1.2, 1.6, 11.1, 11.2, 11.3_


- [x] 4. AIStrategy servisini implement et
  - [x] 4.1 AIStrategy sınıfını oluştur
    - calculateRSI metodunu implement et (14 period RSI)
    - calculateMACD metodunu implement et (trend analysis)
    - calculateBollingerBands metodunu implement et (volatility)
    - calculateVolatility metodunu implement et
    - _Requirements: 5.2_
  
  - [x] 4.2 Signal generation ve risk management ekle
    - determineSignal metodunu implement et (buy/sell/hold logic)
    - calculateConfidence metodunu implement et (0-1 score)
    - calculatePositionSize metodunu implement et (max %20 of principal)
    - calculateStopLoss metodunu implement et (%5 below entry)
    - analyze metodunu implement et (main entry point)
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.6_
  
  - [x] 4.3 Volatility pause mekanizmasını ekle
    - %10 üzeri volatilite kontrolü ekle
    - 5 dakikalık zaman penceresi kontrolü
    - Pause durumunda 'hold' sinyali dön
    - _Requirements: 5.7_
  
  - [ ]* 4.4 AIStrategy için property testler yaz
    - **Property 13: Signal confidence range**
    - **Property 14: Confidence threshold for execution**
    - **Property 15: Position size limit**
    - **Property 16: Stop-loss calculation**
    - **Validates: Requirements 5.3, 5.4, 5.5, 5.6**
  
  - [ ]* 4.5 AIStrategy için unit testler yaz
    - RSI hesaplamasını test et (known values)
    - MACD hesaplamasını test et
    - Bollinger Bands hesaplamasını test et
    - High confidence signal (>0.7) test et
    - Low confidence signal (<0.7) test et
    - Position size %20 limitini test et
    - Stop-loss %5 hesaplamasını test et
    - Volatility pause trigger'ı test et (>%10)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 5. TradeExecutor servisini implement et
  - [x] 5.1 TradeExecutor sınıfını oluştur
    - executeBuy metodunu implement et (market buy order)
    - executeSell metodunu implement et (market sell order)
    - getMarketPrice metodunu implement et
    - Mevcut exchange client'ları kullan (Binance, Coinbase, Bybit)
    - _Requirements: 4.2, 4.3, 4.4, 12.1, 12.2, 12.3_
  
  - [x] 5.2 Retry ve failover mekanizmalarını ekle
    - executeWithRetry metodunu implement et (3 retry, exponential backoff: 1s, 2s, 4s)
    - selectExchange metodunu implement et
    - handleExchangeFailover metodunu implement et (10 saniye içinde)
    - Rate limit handling ekle (%20 buffer)
    - _Requirements: 4.6, 12.4, 12.6_
  
  - [x] 5.3 Circuit breaker pattern'i implement et
    - 5 ardışık hata sonrası circuit aç
    - 60 saniye wait süresi
    - Half-open state test mekanizması
    - _Requirements: 15.5, 15.6_
  
  - [x] 5.4 Trade execution audit logging ekle
    - Her trade için audit log kaydı
    - API request/response logging
    - Exchange credential verification
    - _Requirements: 12.5, 12.7, 19.2_
  
  - [ ]* 5.5 TradeExecutor için property testler yaz
    - **Property 9: Trade exchange validation**
    - **Property 10: Trade record completeness**
    - **Property 11: Retry on exchange failure**
    - **Property 12: Error logging on retry exhaustion**
    - **Property 49: Circuit breaker activation**
    - **Property 60: Trade execution audit logging**
    - **Validates: Requirements 4.2, 4.5, 4.6, 4.7, 12.7, 15.5, 19.2**
  
  - [ ]* 5.6 TradeExecutor için unit testler yaz
    - Başarılı buy order test et (Binance)
    - Başarılı sell order test et (Coinbase)
    - Exchange failover test et (Binance fail → Coinbase)
    - Retry logic test et (exponential backoff)
    - Circuit breaker activation test et (5 failures)
    - Circuit breaker recovery test et (60s wait)
    - Rate limit handling test et
    - _Requirements: 4.2, 4.3, 4.4, 4.6, 12.4, 15.5_


- [ ] 6. Checkpoint - Core trading servisleri çalışıyor mu kontrol et
  - Tüm testlerin geçtiğinden emin ol, sorular varsa kullanıcıya sor.

- [x] 7. TradingBot servisini implement et
  - [x] 7.1 TradingBot sınıfını oluştur
    - startTrading metodunu implement et
    - stopTrading metodunu implement et
    - analyzeMarket metodunu implement et (ExchangeAggregator kullan)
    - generateSignal metodunu implement et (AIStrategy kullan)
    - _Requirements: 4.1, 5.1_
  
  - [x] 7.2 Strategy execution loop'u implement et
    - executeStrategy metodunu implement et
    - Confidence >0.7 kontrolü ekle
    - TradeExecutor ile trade execution entegrasyonu
    - Position tracking ekle (BotPositionRepository)
    - Trade kayıt etme (BotTradeRepository)
    - _Requirements: 4.3, 4.4, 4.5, 5.4_
  
  - [x] 7.3 Position management ekle
    - closeAllPositions metodunu implement et
    - getCurrentValue metodunu implement et
    - Stop-loss monitoring ekle
    - Position update mekanizması
    - _Requirements: 5.6, 6.3_
  
  - [x] 7.4 Redis caching entegrasyonu ekle
    - Market data için 30 saniye TTL cache
    - Investment value cache
    - ExchangeAggregator ile entegrasyon
    - _Requirements: 16.5_
  
  - [ ]* 7.5 TradingBot için unit testler yaz
    - Strategy execution test et (confidence >0.7)
    - Trade execution test et
    - Position tracking test et
    - Stop-loss trigger test et
    - getCurrentValue hesaplamasını test et
    - closeAllPositions test et
    - _Requirements: 4.1, 4.3, 4.4, 5.4, 5.6, 6.3_

- [x] 8. NotificationService'i implement et
  - [x] 8.1 NotificationService sınıfını oluştur
    - sendInvestmentCreated metodunu implement et
    - sendInvestmentCompleted metodunu implement et
    - sendProfitMilestone metodunu implement et (>%10 profit)
    - sendLossWarning metodunu implement et (>%5 loss)
    - sendInvestmentCancelled metodunu implement et
    - sendErrorNotification metodunu implement et
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [x] 8.2 Email ve in-app notification entegrasyonu
    - Email service entegrasyonu (SendGrid/AWS SES)
    - In-app notification queue
    - User notification preferences kontrolü
    - _Requirements: 18.6, 18.7_
  
  - [ ]* 8.3 NotificationService için property testler yaz
    - **Property 53: Investment creation notification**
    - **Property 54: Investment completion notification**
    - **Property 55: Profit milestone notification**
    - **Property 56: Loss warning notification**
    - **Property 57: Cancellation notification**
    - **Property 58: Notification preference respect**
    - **Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5, 18.7**
  
  - [ ]* 8.4 NotificationService için unit testler yaz
    - Investment creation notification test et
    - Completion notification test et
    - Profit milestone notification test et (>%10)
    - Loss warning notification test et (>%5)
    - Cancellation notification test et
    - Notification preferences test et
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.7_


- [x] 9. InvestmentManager servisini implement et
  - [x] 9.1 InvestmentManager sınıfını oluştur - validation metodları
    - validateAmount metodunu implement et (100-100,000 USDT)
    - validateTradingPeriod metodunu implement et (1,2,3,4,5,6,12,24,48,60 hours)
    - validateCryptocurrency metodunu implement et (BTC, ETH, BNB, SOL, ADA)
    - validateRiskAcknowledgment metodunu implement et
    - _Requirements: 1.1, 1.3, 1.4, 3.6_
  
  - [x] 9.2 Investment creation metodunu implement et
    - createInvestment metodunu implement et
    - Premium subscription kontrolü ekle
    - BalanceManager ile balance validation
    - BalanceManager ile balance deduction
    - Investment record oluştur (status: 'active')
    - Risk acknowledgment timestamp kaydet
    - Millisecond precision timestamp
    - TradingBot.startTrading çağır
    - NotificationService.sendInvestmentCreated çağır
    - Audit log kaydı
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.7, 14.3, 19.1_
  
  - [x] 9.3 Investment query metodlarını implement et
    - getInvestments metodunu implement et (status filter)
    - getInvestmentById metodunu implement et
    - getPortfolioSummary metodunu implement et
    - Authorization kontrolü ekle (user can only access own investments)
    - _Requirements: 8.1, 8.2, 8.6, 8.7, 14.2_
  
  - [ ]* 9.4 Investment creation için property testler yaz
    - **Property 1: Investment amount validation**
    - **Property 2: Sufficient balance validation**
    - **Property 3: Trading period validation**
    - **Property 4: Cryptocurrency validation**
    - **Property 5: Initial investment status**
    - **Property 7: Timestamp precision**
    - **Property 8: Risk acknowledgment recording**
    - **Property 42: Authentication requirement**
    - **Property 43: Authorization enforcement**
    - **Property 44: Premium subscription requirement**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 3.7, 14.1, 14.2, 14.3**
  
  - [ ]* 9.5 Investment creation için unit testler yaz
    - Valid investment test et (1000 USDT, BTC, 24h)
    - Minimum amount test et (100 USDT)
    - Maximum amount test et (100,000 USDT)
    - Invalid amount test et (50 USDT, 150,000 USDT)
    - Yetersiz bakiye test et
    - Invalid trading period test et (7 hours)
    - Unsupported cryptocurrency test et (DOGE)
    - Risk not acknowledged test et
    - Premium subscription required test et
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.6, 14.3_

- [x] 10. Investment completion ve cancellation implement et
  - [x] 10.1 Investment completion metodunu implement et
    - completeInvestment metodunu implement et
    - TradingBot.closeAllPositions çağır
    - Final value hesapla
    - Profit hesapla (final_value - principal_amount)
    - Commission hesapla (profit > 0 ise profit * 0.01, değilse 0)
    - Payout hesapla (principal_amount + profit - commission)
    - BalanceManager.creditFromInvestment çağır
    - Status'u 'completed' yap
    - Platform revenue accumulation
    - NotificationService.sendInvestmentCompleted çağır
    - Audit log kaydı
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 7.1, 7.2, 7.3, 7.4, 19.1_
  
  - [x] 10.2 Completion retry mekanizması ekle
    - Retry logic ekle (5 dakika interval, 24 saat boyunca)
    - Position closure failure handling
    - Balance credit failure handling
    - Database transaction rollback
    - Administrator notification (24 saat sonra)
    - _Requirements: 15.2, 15.3_
  
  - [x] 10.3 Investment cancellation metodunu implement et
    - cancelInvestment metodunu implement et
    - Active investment kontrolü
    - Authorization kontrolü
    - TradingBot.closeAllPositions çağır
    - Current value hesapla
    - Cancellation fee hesapla (principal_amount * 0.02)
    - Refund hesapla (current_value - cancellation_fee)
    - BalanceManager.creditFromInvestment çağır
    - Status'u 'cancelled' yap, cancellation timestamp ve reason kaydet
    - NotificationService.sendInvestmentCancelled çağır
    - Audit log kaydı
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 19.1_
  
  - [ ]* 10.4 Investment completion için property testler yaz
    - **Property 17: Investment completion trigger**
    - **Property 18: Position closure on completion**
    - **Property 19: Profit calculation**
    - **Property 20: Commission calculation for profit**
    - **Property 21: Zero commission for non-profit**
    - **Property 22: Payout calculation**
    - **Property 24: Completed investment status**
    - **Property 25: Commission field presence**
    - **Property 26: Platform revenue accumulation**
    - **Property 47: Completion retry on failure**
    - **Property 59: Investment state change audit logging**
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6, 6.8, 7.1, 7.2, 7.3, 7.4, 15.2, 19.1**
  
  - [ ]* 10.5 Investment cancellation için property testler yaz
    - **Property 33: Position closure on cancellation**
    - **Property 34: Cancellation fee calculation**
    - **Property 35: Refund calculation on cancellation**
    - **Property 36: Cancelled investment status**
    - **Validates: Requirements 9.3, 9.5, 9.6, 9.7**
  
  - [ ]* 10.6 Completion ve cancellation için unit testler yaz
    - Profitable investment completion test et (profit > 0)
    - Break-even investment completion test et (profit = 0)
    - Loss investment completion test et (profit < 0)
    - Commission calculation test et (%1 of profit)
    - Payout calculation test et
    - Active investment cancellation test et
    - Cancellation fee test et (%2 of principal)
    - Refund calculation test et
    - Completion retry test et
    - _Requirements: 6.4, 6.5, 6.6, 7.1, 7.2, 9.3, 9.5, 9.6, 15.2_


- [x] 11. Investment value tracking implement et
  - [x] 11.1 Value update metodunu implement et
    - updateInvestmentValue metodunu implement et
    - InvestmentValueHistory kaydı oluştur
    - Current value update (bot_investments tablosu)
    - _Requirements: 13.2, 13.5_
  
  - [x] 11.2 Real-time monitoring metodlarını ekle
    - Value change detection (>%1 threshold)
    - Profit/loss percentage calculation
    - Profit milestone detection (>%10)
    - Loss warning detection (>%5)
    - NotificationService entegrasyonu
    - _Requirements: 13.3, 13.4, 18.3, 18.4_
  
  - [ ]* 11.3 Value tracking için property testler yaz
    - **Property 40: Value change notification threshold**
    - **Property 41: Profit/loss percentage calculation**
    - **Validates: Requirements 13.3, 13.4**
  
  - [ ]* 11.4 Value tracking için unit testler yaz
    - Value update test et
    - Value history recording test et
    - %1 change notification test et
    - Profit/loss percentage calculation test et
    - %10 profit milestone test et
    - %5 loss warning test et
    - _Requirements: 13.2, 13.3, 13.4, 13.5, 18.3, 18.4_

- [ ] 12. Checkpoint - Investment lifecycle servisleri çalışıyor mu kontrol et
  - Tüm testlerin geçtiğinden emin ol, sorular varsa kullanıcıya sor.

- [x] 13. REST API endpoint'lerini implement et
  - [x] 13.1 Bot configuration endpoint'lerini oluştur
    - GET /api/bot/supported-cryptocurrencies endpoint'i
    - GET /api/bot/trading-periods endpoint'i
    - GET /api/bot/limits endpoint'i
    - Validation middleware ekle
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [x] 13.2 Investment CRUD endpoint'lerini oluştur
    - POST /api/bot/investments endpoint'i (createInvestment)
    - GET /api/bot/investments endpoint'i (list with status filter)
    - GET /api/bot/investments/:id endpoint'i (detail)
    - POST /api/bot/investments/:id/cancel endpoint'i (cancel)
    - GET /api/bot/investments/:id/value-history endpoint'i
    - requireAuth middleware ekle
    - requireRole('premium') middleware ekle
    - Request validation middleware ekle
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 8.1, 8.2, 9.1, 9.2, 14.1, 14.3_
  
  - [x] 13.3 Analytics endpoint'lerini oluştur (Admin)
    - GET /api/bot/analytics/daily endpoint'i
    - GET /api/bot/analytics/by-cryptocurrency endpoint'i
    - requireRole('admin') middleware ekle
    - Win rate calculation
    - Average profit calculation
    - _Requirements: 17.1, 17.2, 17.3, 17.4_
  
  - [x] 13.4 Error handling middleware ekle
    - Global error handler
    - Consistent error format (ErrorResponse interface)
    - Error code mapping
    - Türkçe error messages
    - Request ID tracking
    - _Requirements: 15.4_
  
  - [ ]* 13.5 API endpoint'leri için integration testler yaz
    - Investment creation flow test et
    - Investment list test et (status filter)
    - Investment detail test et
    - Investment cancellation flow test et
    - Value history test et
    - Premium subscription requirement test et
    - Authentication requirement test et
    - Error handling test et
    - _Requirements: 1.1, 1.4, 8.1, 8.2, 9.1, 14.1, 14.3_


- [x] 14. Background job'ları implement et
  - [x] 14.1 Period monitor job'ı oluştur
    - node-cron ile 60 saniye interval schedule et
    - Expired investments bul (end_time <= now)
    - InvestmentManager.completeInvestment çağır
    - Error handling ve logging
    - _Requirements: 6.1, 6.2_
  
  - [x] 14.2 Value updater job'ı oluştur
    - node-cron ile 30 saniye interval schedule et
    - Active investments bul
    - TradingBot.getCurrentValue çağır
    - InvestmentManager.updateInvestmentValue çağır
    - WebSocket update gönder
    - _Requirements: 8.5, 13.2, 13.3_
  
  - [x] 14.3 Strategy runner job'ı oluştur
    - node-cron ile 10 saniye interval schedule et
    - Active investments bul
    - TradingBot.executeStrategy çağır
    - Error handling (critical error → pause investment)
    - _Requirements: 4.1, 5.1, 15.1_
  
  - [ ]* 14.4 Background job'lar için unit testler yaz
    - Period monitor job test et
    - Value updater job test et
    - Strategy runner job test et
    - Error handling test et
    - _Requirements: 6.1, 6.2, 13.2, 15.1_

- [ ] 15. WebSocket server'ı implement et
  - [ ] 15.1 WebSocket server setup
    - /ws/investments endpoint'i oluştur
    - JWT authentication middleware
    - Connection management (user subscription)
    - Stale connection cleanup (5 dakika inactivity)
    - _Requirements: 13.1_
  
  - [ ] 15.2 Real-time message handling
    - investment_update message type
    - trade_executed message type
    - investment_completed message type
    - Message format (type, data structure)
    - User-specific message routing
    - _Requirements: 13.1, 13.3, 13.6_
  
  - [ ] 15.3 WebSocket error handling
    - Connection failure handling
    - Authentication failure (code 4001)
    - Message parsing error
    - Automatic reconnection support (client-side)
    - _Requirements: 13.1_
  
  - [ ]* 15.4 WebSocket için unit testler yaz
    - Connection establishment test et
    - Authentication test et
    - Message sending test et
    - User-specific routing test et
    - Connection cleanup test et
    - _Requirements: 13.1, 13.3_

- [ ] 16. Checkpoint - Backend servisleri ve API tamamlandı
  - Tüm testlerin geçtiğinden emin ol, sorular varsa kullanıcıya sor.


- [x] 17. Frontend Redux store ve API client setup
  - [x] 17.1 Bot investment slice oluştur
    - Redux Toolkit ile botInvestmentSlice oluştur
    - State: investments, activeInvestments, completedInvestments, loading, error
    - Actions: createInvestment, fetchInvestments, fetchInvestmentDetail, cancelInvestment, updateInvestmentValue
    - Async thunks ile API entegrasyonu
    - _Requirements: 8.1, 8.2_
  
  - [x] 17.2 API client metodlarını ekle
    - createInvestment API call
    - getInvestments API call (status filter)
    - getInvestmentById API call
    - cancelInvestment API call
    - getValueHistory API call
    - getSupportedCryptocurrencies API call
    - getTradingPeriods API call
    - getLimits API call
    - JWT token interceptor (mevcut auth'dan)
    - _Requirements: 1.1, 2.1, 8.1, 8.2, 9.1_
  
  - [ ]* 17.3 Redux slice için unit testler yaz
    - Reducer'ları test et
    - Async thunk'ları test et
    - State update'leri test et
    - _Requirements: 8.1, 8.2_

- [x] 18. RiskDisclosureModal component'ini oluştur
  - [x] 18.1 RiskDisclosureModal component'i implement et
    - Modal UI oluştur (TailwindCSS)
    - Risk warnings göster (5 madde)
    - Explicit acknowledgment checkbox
    - onAcknowledge ve onCancel callback'leri
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ]* 18.2 RiskDisclosureModal için unit testler yaz
    - Modal rendering test et
    - Risk warnings display test et
    - Acknowledgment checkbox test et
    - Callback'leri test et
    - _Requirements: 3.1, 3.6_

- [x] 19. BotTradingPage component'ini oluştur
  - [x] 19.1 BotTradingPage component'i implement et
    - Cryptocurrency selector dropdown (BTC, ETH, BNB, SOL, ADA)
    - Amount input (100-100,000 USDT validation)
    - Trading period selector (1,2,3,4,5,6,12,24,48,60 hours)
    - RiskDisclosureModal entegrasyonu
    - Form validation
    - createInvestment dispatch
    - Loading ve error state handling
    - Success message ve redirect
    - _Requirements: 1.1, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1_
  
  - [ ]* 19.2 BotTradingPage için unit testler yaz
    - Form rendering test et
    - Cryptocurrency selection test et
    - Amount validation test et (min, max, invalid)
    - Trading period selection test et
    - Risk disclosure flow test et
    - Form submission test et
    - Error handling test et
    - _Requirements: 1.1, 1.3, 1.4, 3.1_


- [x] 20. InvestmentCard component'ini oluştur
  - [x] 20.1 InvestmentCard component'i implement et
    - Investment details display (cryptocurrency, principal, period, status)
    - Active investment için: elapsed time, current value, profit/loss, profit/loss %
    - Completed investment için: final value, profit, commission, completion timestamp
    - Real-time value updates (WebSocket)
    - Color coding (green for profit, red for loss)
    - Cancel button (active investments only)
    - Confirmation dialog for cancellation
    - _Requirements: 8.3, 8.4, 9.2, 13.4_
  
  - [ ]* 20.2 InvestmentCard için unit testler yaz
    - Active investment display test et
    - Completed investment display test et
    - Profit/loss color coding test et
    - Cancel button test et (active only)
    - Cancellation confirmation test et
    - _Requirements: 8.3, 8.4, 9.2_

- [x] 21. InvestmentValueChart component'ini oluştur
  - [x] 21.1 InvestmentValueChart component'i implement et
    - Recharts veya Chart.js kullan
    - Value history data fetch (API)
    - Time series chart (timestamp vs value)
    - Real-time updates (WebSocket)
    - Responsive design
    - _Requirements: 13.5_
  
  - [ ]* 21.2 InvestmentValueChart için unit testler yaz
    - Chart rendering test et
    - Data fetching test et
    - Real-time update test et
    - _Requirements: 13.5_

- [x] 22. InvestmentDashboard component'ini oluştur
  - [x] 22.1 InvestmentDashboard component'i implement et
    - Active investments section (InvestmentCard list)
    - Completed investments section (InvestmentCard list)
    - Portfolio summary (total portfolio value, lifetime profit/loss)
    - WebSocket connection setup
    - Real-time value updates (30 saniye interval)
    - Trade execution notifications
    - Investment completion notifications
    - Refresh button
    - Loading ve error states
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 13.1, 13.2, 13.3, 13.6_
  
  - [ ]* 22.2 InvestmentDashboard için property testler yaz
    - **Property 27: Active investments display completeness**
    - **Property 28: Completed investments display completeness**
    - **Property 29: Active investment display fields**
    - **Property 30: Completed investment display fields**
    - **Property 31: Portfolio value calculation**
    - **Property 32: Lifetime profit calculation**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.6, 8.7**
  
  - [ ]* 22.3 InvestmentDashboard için unit testler yaz
    - Active investments display test et
    - Completed investments display test et
    - Portfolio summary test et
    - WebSocket connection test et
    - Real-time updates test et
    - Refresh functionality test et
    - _Requirements: 8.1, 8.2, 8.6, 8.7, 13.1, 13.2_


- [ ] 23. WebSocket client'ı implement et
  - [ ] 23.1 WebSocket client hook oluştur
    - useWebSocket custom hook oluştur
    - Connection establishment (/ws/investments)
    - JWT authentica
- [ ] 23. WebSocket client implement et
  - [ ] 23.1 WebSocket client hook oluştur
    - useWebSocket custom hook oluştur
    - Connection establishment
    - JWT authentication
    - Message handling (investment_update, trade_executed, investment_completed)
    - Automatic reconnection (exponential backoff)
    - Connection cleanup
    - _Requirements: 13.1, 13.3_
  
  - [ ] 23.2 Redux entegrasyonu ekle
    - WebSocket message'ları Redux action'lara dönüştür
    - Investment value update action dispatch
    - Trade notification handling
    - Completion notification handling
    - _Requirements: 13.2, 13.3, 13.6_
  
  - [ ]* 23.3 WebSocket client için unit testler yaz
    - Connection test et
    - Authentication test et
    - Message handling test et
    - Reconnection test et
    - Redux dispatch test et
    - _Requirements: 13.1, 13.3_

- [x] 24. Routing ve navigation ekle
  - [x] 24.1 Bot trading route'larını ekle
    - /bot/create route (BotTradingPage)
    - /bot/dashboard route (InvestmentDashboard)
    - PrivateRoute wrapper (authentication required)
    - PremiumRoute wrapper (premium subscription required)
    - Navigation menu items ekle
    - _Requirements: 14.1, 14.3_
  
  - [ ]* 24.2 Routing için unit testler yaz
    - Route rendering test et
    - Authentication redirect test et
    - Premium subscription redirect test et
    - _Requirements: 14.1, 14.3_

- [ ] 25. Error handling ve user feedback
  - [ ] 25.1 Error display component'leri oluştur
    - ErrorMessage component
    - Toast notification component
    - Confirmation dialog component
    - _Requirements: 15.4_
  
  - [ ] 25.2 Error handling entegrasyonu
    - API error handling
    - Form validation errors
    - WebSocket connection errors
    - Türkçe error messages
    - User-friendly error display
    - _Requirements: 15.4_
  
  - [ ]* 25.3 Error handling için unit testler yaz
    - Error display test et
    - Toast notification test et
    - Confirmation dialog test et
    - _Requirements: 15.4_

- [ ] 26. Checkpoint - Frontend component'leri tamamlandı
  - Tüm testlerin geçtiğinden emin ol, sorular varsa kullanıcıya sor.


- [ ] 27. Security ve access control implement et
  - [ ] 27.1 Authentication middleware güçlendir
    - JWT token verification (mevcut auth middleware kullan)
    - Token expiration handling
    - Refresh token mekanizması (eğer yoksa)
    - _Requirements: 14.1_
  
  - [ ] 27.2 Authorization middleware ekle
    - Premium subscription verification
    - Investment ownership verification
    - Admin role verification (analytics endpoints)
    - IP address logging
    - _Requirements: 14.2, 14.3, 14.4, 14.5_
  
  - [ ] 27.3 Data encryption implement et
    - Sensitive investment data encryption (AES-256)
    - Exchange API credentials vault storage
    - _Requirements: 14.6, 14.7_
  
  - [ ]* 27.4 Security için property testler yaz
    - **Property 45: Security audit logging**
    - **Property 46: Critical error handling**
    - **Property 48: Failure recording and continuation**
    - **Property 50: Error notification to users**
    - **Validates: Requirements 14.5, 15.1, 15.3, 15.7**
  
  - [ ]* 27.5 Security için unit testler yaz
    - Authentication requirement test et
    - Premium subscription requirement test et
    - Investment ownership verification test et
    - Admin role verification test et
    - Audit logging test et
    - _Requirements: 14.1, 14.2, 14.3, 14.5_

- [ ] 28. Performance optimization implement et
  - [ ] 28.1 Database optimization
    - Index'leri verify et
    - Query optimization
    - Connection pooling (10-50 connections)
    - _Requirements: 16.6_
  
  - [ ] 28.2 Redis caching optimization
    - Market data caching (30s TTL)
    - Investment value caching
    - Frequently accessed data caching
    - Cache invalidation strategy
    - _Requirements: 16.5_
  
  - [ ] 28.3 Parallel processing implement et
    - Worker processes için trade execution
    - Multiple investment processing
    - _Requirements: 16.6_
  
  - [ ]* 28.4 Performance testleri yaz
    - 1000 concurrent investments test et
    - Investment creation latency test et (<2s)
    - Trade execution latency test et (<5s)
    - Dashboard load time test et (<1s)
    - _Requirements: 16.1, 16.2, 16.3, 16.4_


- [ ] 29. Reporting ve analytics implement et
  - [ ] 29.1 Daily report generation
    - Total investments, profit, commission calculation
    - Win rate calculation
    - Average profit percentage calculation
    - Cryptocurrency-specific metrics
    - _Requirements: 17.1, 17.2, 17.3, 17.4_
  
  - [ ] 29.2 Export functionality
    - CSV export endpoint
    - JSON export endpoint
    - Monthly performance summaries
    - Average completion time tracking
    - _Requirements: 17.5, 17.6, 17.7_
  
  - [ ]* 29.3 Analytics için property testler yaz
    - **Property 51: Win rate calculation**
    - **Property 52: Average profit calculation**
    - **Validates: Requirements 17.2, 17.3**
  
  - [ ]* 29.4 Analytics için unit testler yaz
    - Daily report generation test et
    - Win rate calculation test et
    - Average profit calculation test et
    - Export functionality test et
    - _Requirements: 17.1, 17.2, 17.3, 17.5_

- [ ] 30. Compliance ve audit trail implement et
  - [ ] 30.1 Audit logging enhancement
    - Investment state change logging
    - Trade execution logging
    - Balance change logging
    - Immutable log storage
    - 7 year retention policy
    - _Requirements: 19.1, 19.2, 19.3_
  
  - [ ] 30.2 Compliance reporting
    - Audit log export functionality
    - Monthly compliance reports
    - Risk acknowledgment tracking
    - Write-once storage implementation
    - _Requirements: 19.4, 19.5, 19.6, 19.7_
  
  - [ ]* 30.3 Audit trail için unit testler yaz
    - State change logging test et
    - Trade execution logging test et
    - Audit log export test et
    - Immutability test et
    - _Requirements: 19.1, 19.2, 19.4_

- [ ] 31. Checkpoint - Security, performance, compliance tamamlandı
  - Tüm testlerin geçtiğinden emin ol, sorular varsa kullanıcıya sor.


- [ ] 32. Integration testler - Investment lifecycle
  - [ ]* 32.1 Complete investment lifecycle test et
    - User creates investment → Bot executes trades → Period ends → Investment completes → User receives payout
    - End-to-end flow verification
    - _Requirements: 1.1, 4.1, 6.2, 6.7_
  
  - [ ]* 32.2 Profitable investment flow test et
    - Create investment → Execute profitable trades → Complete with profit → Verify commission → Verify balance credit
    - _Requirements: 6.4, 6.5, 6.6, 7.1_
  
  - [ ]* 32.3 Loss investment flow test et
    - Create investment → Execute losing trades → Complete with loss → Verify zero commission → Verify balance credit
    - _Requirements: 6.4, 7.2_
  
  - [ ]* 32.4 Early cancellation flow test et
    - Create investment → Execute trades → User cancels → Positions closed → Fee applied → Refund credited
    - _Requirements: 9.1, 9.3, 9.5, 9.6_

- [ ] 33. Integration testler - Error handling ve recovery
  - [ ]* 33.1 Exchange failover test et
    - Create investment → Binance fails → Failover to Coinbase → Trade executes successfully
    - _Requirements: 4.6, 12.4_
  
  - [ ]* 33.2 Error recovery test et
    - Investment completion fails → Retry every 5 minutes → Eventually succeeds → Balance credited
    - _Requirements: 15.2_
  
  - [ ]* 33.3 Critical error handling test et
    - Trading bot encounters critical error → Investment paused → Administrator notified
    - _Requirements: 15.1_
  
  - [ ]* 33.4 Circuit breaker test et
    - 5 consecutive exchange failures → Circuit opens → 60s wait → Recovery attempt
    - _Requirements: 15.5, 15.6_

- [ ] 34. Integration testler - Real-time features
  - [ ]* 34.1 Real-time updates test et
    - User connects via WebSocket → Investment value updates every 30s → Trade notifications pushed immediately
    - _Requirements: 13.1, 13.2, 13.3_
  
  - [ ]* 34.2 Notification flow test et
    - Investment creation → Confirmation notification
    - Investment completion → Completion notification
    - Profit >10% → Milestone notification
    - Loss >5% → Warning notification
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [ ] 35. Load ve performance testleri
  - [ ]* 35.1 Concurrent investments test et
    - 1000 concurrent active investments
    - System stability verification
    - _Requirements: 16.1_
  
  - [ ]* 35.2 Latency testleri
    - Investment creation <2s
    - Trade execution <5s
    - Dashboard load <1s
    - WebSocket message <100ms
    - _Requirements: 16.2, 16.3, 16.4_


- [ ] 36. Code coverage ve test quality
  - [ ]* 36.1 Unit test coverage verify et
    - Minimum %90 code coverage hedefine ulaş
    - Coverage report oluştur
    - _Requirements: 20.1_
  
  - [ ]* 36.2 Property-based test coverage verify et
    - 60 property'nin hepsinin test edildiğini doğrula
    - Her property test 100+ iteration ile çalışsın
    - _Requirements: 20.7_
  
  - [ ]* 36.3 Integration test coverage verify et
    - Tüm investment lifecycle senaryoları
    - Error handling ve recovery senaryoları
    - Real-time feature senaryoları
    - _Requirements: 20.2, 20.4_
  
  - [ ]* 36.4 Backtesting verify et
    - AI strategy için 2+ yıllık historical data
    - Strategy performance validation
    - _Requirements: 20.5_

- [ ] 37. Documentation oluştur
  - [ ] 37.1 API documentation
    - Tüm endpoint'leri dokümante et
    - Request/response örnekleri ekle
    - Authentication ve authorization gereksinimleri
    - Error code'ları ve mesajları
    - _Requirements: Tüm API requirements_
  
  - [ ] 37.2 Developer documentation
    - Architecture overview
    - Component diagram'ları
    - Database schema documentation
    - Setup ve installation guide
    - Testing guide
    - _Requirements: Tüm requirements_
  
  - [ ] 37.3 User documentation (Türkçe)
    - Bot trading nasıl kullanılır
    - Risk bildirimi açıklaması
    - Investment oluşturma adımları
    - Dashboard kullanımı
    - FAQ
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 38. Deployment hazırlığı
  - [ ] 38.1 Environment configuration
    - Production environment variables
    - Database connection strings
    - Redis configuration
    - Exchange API credentials (vault)
    - Email service configuration
    - WebSocket server configuration
    - _Requirements: Tüm requirements_
  
  - [ ] 38.2 Database migration scripts
    - Migration execution order
    - Rollback scripts
    - Seed data scripts (supported cryptocurrencies, trading periods)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ] 38.3 Monitoring ve logging setup
    - Application logging configuration
    - Error tracking (Sentry/similar)
    - Performance monitoring
    - Audit log storage configuration
    - _Requirements: 14.5, 19.1, 19.2, 19.3_


- [ ] 39. Final checkpoint - Tüm sistem entegrasyonu
  - [ ] 39.1 Tüm testlerin geçtiğini doğrula
    - Unit testler (%90+ coverage)
    - Property-based testler (60 property, 100+ iterations)
    - Integration testler
    - Load testler
    - _Requirements: 20.1, 20.2, 20.4, 20.6, 20.7_
  
  - [ ] 39.2 End-to-end smoke test
    - Production-like environment'ta test et
    - Complete investment lifecycle
    - Real exchange API entegrasyonu (test mode)
    - WebSocket real-time updates
    - Notification delivery
    - _Requirements: Tüm requirements_
  
  - [ ] 39.3 Security audit
    - Authentication ve authorization verify et
    - Data encryption verify et
    - Audit logging verify et
    - API credential security verify et
    - _Requirements: 14.1, 14.2, 14.3, 14.5, 14.6, 14.7_
  
  - [ ] 39.4 Performance benchmarks
    - 1000 concurrent investments
    - Investment creation <2s
    - Trade execution <5s
    - Dashboard load <1s
    - _Requirements: 16.1, 16.2, 16.3, 16.4_
  
  - [ ] 39.5 Kullanıcıya sorular sor
    - Tüm gereksinimler karşılandı mı?
    - Ek özellik veya değişiklik var mı?
    - Deployment için hazır mı?

## Notes

- `*` ile işaretli task'lar optional'dır ve daha hızlı MVP için skip edilebilir
- Her task spesifik requirement'lara referans verir (traceability için)
- Checkpoint'ler önemli milestone'larda incremental validation sağlar
- Property testler universal correctness property'leri 100+ iteration ile validate eder
- Unit testler spesifik örnekleri, edge case'leri ve error condition'ları validate eder
- Implementation bottom-up yaklaşım izler: database → models → services → API → frontend
- Tüm kod TypeScript kullanır (type safety için)
- Redis caching exchange API call'ları için performance iyileştirmesi sağlar
- Scheduled job'lar background task'ları handle eder (period monitoring, value updates, strategy execution)
- WebSocket real-time investment value updates ve trade notifications sağlar
- Mevcut crypto-trading-signals altyapısı kullanılır (auth, exchange clients, database connection)
- Türkçe error messages ve user documentation
- Security: JWT auth, Premium role check, data encryption, audit logging
- Compliance: 7 year audit retention, immutable logs, risk acknowledgment tracking
- Performance: 1000 concurrent investments, <2s creation, <5s trade execution, <1s dashboard load

