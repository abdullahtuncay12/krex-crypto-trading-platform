# Design Document: MetaMask Payment Integration

## Overview

Bu tasarım belgesi, kullanıcıların MetaMask cüzdanları aracılığıyla kripto para (USDT ve ETH) ile bakiye yükleme ve abonelik ödemesi yapabilmelerini sağlayan entegrasyon sisteminin teknik tasarımını tanımlar.

### Temel Özellikler

- Web3 tabanlı MetaMask cüzdan bağlantısı
- USDT ve ETH ile bakiye yükleme
- Kripto para ile premium abonelik satın alma
- Blockchain üzerinde transaction doğrulama
- Gerçek zamanlı fiyat dönüşümü (USD ↔ Crypto)
- Çoklu blockchain ağı desteği (Ethereum, Polygon, BSC)
- Transaction geçmişi ve raporlama
- Güvenli ödeme işleme ve audit logging

### Teknoloji Stack

- **Frontend**: React, TypeScript, ethers.js v6
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Blockchain**: Ethereum, Polygon, Binance Smart Chain
- **External APIs**: CoinGecko/CoinMarketCap (fiyat verileri)

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React UI Components]
        Web3[Web3Provider ethers.js]
        MetaMask[MetaMask Extension]
    end
    
    subgraph "Backend Layer"
        API[Express API Routes]
        CryptoService[CryptoPaymentService]
        TxVerifier[TransactionVerifier]
        PriceService[PriceConversionService]
        BalanceMgr[BalanceManager]
        SubMgr[SubscriptionManager]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL)]
        Cache[Redis Cache]
    end
    
    subgraph "External Services"
        Blockchain[Blockchain Networks]
        PriceAPI[Price API CoinGecko]
    end
    
    UI --> Web3
    Web3 --> MetaMask
    UI --> API
    API --> CryptoService
    CryptoService --> TxVerifier
    CryptoService --> PriceService
    CryptoService --> BalanceMgr
    CryptoService --> SubMgr
    TxVerifier --> Blockchain
    PriceService --> PriceAPI
    PriceService --> Cache
    CryptoService --> DB
    BalanceMgr --> DB
    SubMgr --> DB
```

### Component Interaction Flow

#### Bakiye Yükleme Akışı

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant MetaMask
    participant API
    participant CryptoService
    participant TxVerifier
    participant Blockchain
    participant BalanceManager
    participant DB
    
    User->>UI: Bakiye yükleme miktarı girer
    UI->>API: GET /api/crypto/price?amount=100&currency=USDT
    API->>CryptoService: calculateCryptoAmount()
    CryptoService-->>UI: {usdtAmount, ethAmount, rate}
    
    User->>UI: "Yatır" butonuna tıklar
    UI->>MetaMask: eth_sendTransaction()
    MetaMask->>User: İşlem onayı ister
    User->>MetaMask: Onaylar
    MetaMask->>Blockchain: Transaction gönderir
    Blockchain-->>MetaMask: Transaction hash
    MetaMask-->>UI: Transaction hash
    
    UI->>API: POST /api/crypto/deposit
    API->>CryptoService: createDepositRequest()
    CryptoService->>DB: Insert crypto_transactions (pending)
    CryptoService-->>UI: {requestId, status: "pending"}
    
    Note over TxVerifier: Background Job (her 30 saniye)
    TxVerifier->>DB: Pending transactions sorgula
    TxVerifier->>Blockchain: getTransaction(txHash)
    Blockchain-->>TxVerifier: Transaction details
    TxVerifier->>TxVerifier: Doğrulama (3 blok, adres, miktar)
    TxVerifier->>BalanceManager: creditBalance()
    BalanceManager->>DB: Update user balance
    TxVerifier->>DB: Update transaction (completed)
    TxVerifier->>UI: WebSocket notification
```

#### Abonelik Ödemesi Akışı

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant MetaMask
    participant API
    participant CryptoService
    participant TxVerifier
    participant SubscriptionManager
    participant DB
    
    User->>UI: Premium plan seçer
    UI->>API: GET /api/crypto/subscription-price?plan=monthly
    API->>CryptoService: calculateSubscriptionPrice()
    CryptoService-->>UI: {usdtAmount, ethAmount}
    
    User->>UI: "MetaMask ile Öde" tıklar
    UI->>MetaMask: eth_sendTransaction()
    MetaMask-->>UI: Transaction hash
    
    UI->>API: POST /api/crypto/subscription-payment
    API->>CryptoService: createSubscriptionPayment()
    CryptoService->>DB: Insert crypto_transactions (pending)
    CryptoService-->>UI: {paymentId, status: "pending"}
    
    TxVerifier->>Blockchain: Verify transaction
    TxVerifier->>SubscriptionManager: activateSubscription()
    SubscriptionManager->>DB: Insert subscription
    SubscriptionManager->>DB: Update user role to "premium"
    TxVerifier->>DB: Update transaction (completed)
```

## Components and Interfaces

### Frontend Components

#### MetaMaskConnectButton

MetaMask cüzdan bağlantısını yöneten React bileşeni.

```typescript
interface MetaMaskConnectButtonProps {
  onConnect: (address: string, chainId: number) => void;
  onDisconnect: () => void;
}

interface MetaMaskState {
  isInstalled: boolean;
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
}
```

**Sorumluluklar:**
- MetaMask varlığını kontrol etme
- Cüzdan bağlantısı isteme
- Bağlı cüzdan adresini gösterme
- Ağ değişikliklerini dinleme
- Hesap değişikliklerini dinleme

#### CryptoDepositForm

Bakiye yükleme formu bileşeni.

```typescript
interface CryptoDepositFormProps {
  walletAddress: string;
  onDepositSuccess: (txHash: string) => void;
}

interface DepositFormState {
  usdAmount: number;
  selectedCurrency: 'USDT' | 'ETH';
  cryptoAmount: string;
  estimatedGasFee: string;
  isProcessing: boolean;
}
```

**Sorumluluklar:**
- USD miktar girişi ve validasyon
- Kripto para türü seçimi
- Gerçek zamanlı fiyat dönüşümü
- Gas fee tahmini gösterme
- MetaMask transaction başlatma
- Transaction durumu takibi

#### SubscriptionPaymentModal

Abonelik ödemesi modal bileşeni.

```typescript
interface SubscriptionPaymentModalProps {
  plan: 'monthly' | 'yearly';
  price: number;
  onPaymentSuccess: () => void;
  onClose: () => void;
}

interface PaymentModalState {
  selectedCurrency: 'USDT' | 'ETH';
  cryptoAmount: string;
  isProcessing: boolean;
  txHash: string | null;
}
```

#### TransactionHistoryList

İşlem geçmişi listesi bileşeni.

```typescript
interface Transaction {
  id: string;
  type: 'deposit' | 'subscription';
  amount: number;
  currency: string;
  txHash: string;
  status: 'pending' | 'completed' | 'failed' | 'timeout';
  createdAt: Date;
  confirmedAt: Date | null;
}

interface TransactionHistoryListProps {
  userId: string;
  filter?: TransactionFilter;
}
```

### Backend Services

#### CryptoPaymentService

Kripto para ödeme işlemlerini yöneten ana servis.

```typescript
class CryptoPaymentService {
  constructor(
    private txVerifier: TransactionVerifier,
    private priceService: PriceConversionService,
    private balanceManager: BalanceManager,
    private subscriptionManager: SubscriptionManager
  ) {}

  // Deposit işlemleri
  async createDepositRequest(
    userId: string,
    walletAddress: string,
    txHash: string,
    currency: 'USDT' | 'ETH',
    cryptoAmount: string,
    network: BlockchainNetwork
  ): Promise<DepositRequest>;

  async getDepositStatus(requestId: string): Promise<DepositStatus>;

  // Subscription işlemleri
  async createSubscriptionPayment(
    userId: string,
    walletAddress: string,
    txHash: string,
    plan: SubscriptionPlan,
    currency: 'USDT' | 'ETH',
    cryptoAmount: string,
    network: BlockchainNetwork
  ): Promise<SubscriptionPayment>;

  // Transaction geçmişi
  async getUserTransactions(
    userId: string,
    filter?: TransactionFilter
  ): Promise<Transaction[]>;

  // Fiyat hesaplama
  async calculateDepositAmount(
    usdAmount: number,
    currency: 'USDT' | 'ETH'
  ): Promise<CryptoAmount>;

  async calculateSubscriptionPrice(
    plan: SubscriptionPlan,
    currency: 'USDT' | 'ETH'
  ): Promise<CryptoAmount>;
}
```

#### TransactionVerifier

Blockchain üzerindeki işlemleri doğrulayan servis.

```typescript
class TransactionVerifier {
  constructor(
    private providers: Map<BlockchainNetwork, ethers.JsonRpcProvider>
  ) {}

  // Transaction doğrulama
  async verifyTransaction(
    txHash: string,
    network: BlockchainNetwork,
    expectedRecipient: string,
    expectedAmount: string,
    expectedSender: string
  ): Promise<VerificationResult>;

  // Blok onay kontrolü
  async getConfirmationCount(
    txHash: string,
    network: BlockchainNetwork
  ): Promise<number>;

  // Transaction detayları
  async getTransactionDetails(
    txHash: string,
    network: BlockchainNetwork
  ): Promise<TransactionDetails>;

  // Background job - pending transactions işleme
  async processPendingTransactions(): Promise<void>;

  // Timeout kontrolü
  async checkTimeouts(): Promise<void>;
}
```

#### PriceConversionService

Kripto para fiyat dönüşümlerini yöneten servis.

```typescript
class PriceConversionService {
  constructor(
    private priceAPI: PriceAPIClient,
    private cache: RedisClient
  ) {}

  // Fiyat sorgulama
  async getPrice(currency: 'USDT' | 'ETH'): Promise<number>;

  // USD -> Crypto dönüşüm
  async convertUSDToCrypto(
    usdAmount: number,
    currency: 'USDT' | 'ETH'
  ): Promise<string>;

  // Crypto -> USD dönüşüm
  async convertCryptoToUSD(
    cryptoAmount: string,
    currency: 'USDT' | 'ETH'
  ): Promise<number>;

  // Slippage koruması ile dönüşüm
  async convertWithSlippage(
    usdAmount: number,
    currency: 'USDT' | 'ETH',
    slippagePercent: number
  ): Promise<CryptoAmountWithSlippage>;

  // Fiyat güncelleme (background job)
  async updatePrices(): Promise<void>;

  // Fallback fiyat yönetimi
  async getLastKnownPrice(currency: 'USDT' | 'ETH'): Promise<number>;
}
```

#### Web3Provider

Blockchain etkileşimlerini yöneten utility servis.

```typescript
class Web3Provider {
  private providers: Map<BlockchainNetwork, ethers.JsonRpcProvider>;

  constructor(config: Web3Config) {
    this.initializeProviders(config);
  }

  // Provider alma
  getProvider(network: BlockchainNetwork): ethers.JsonRpcProvider;

  // Platform wallet adresi alma
  getPlatformWallet(network: BlockchainNetwork): string;

  // Adres validasyonu
  isValidAddress(address: string): boolean;

  // Ağ validasyonu
  isSupportedNetwork(chainId: number): boolean;

  // Gas fee tahmini
  async estimateGasFee(
    network: BlockchainNetwork,
    transaction: TransactionRequest
  ): Promise<string>;

  // Wallet bakiye sorgulama
  async getWalletBalance(
    address: string,
    network: BlockchainNetwork
  ): Promise<string>;
}
```

### API Endpoints

#### POST /api/crypto/connect

MetaMask cüzdan bağlantısını kaydet.

```typescript
Request:
{
  walletAddress: string;
  chainId: number;
}

Response:
{
  success: boolean;
  supportedNetwork: boolean;
  message?: string;
}
```

#### GET /api/crypto/price

Kripto para fiyat bilgisi al.

```typescript
Query Parameters:
- amount: number (USD)
- currency: 'USDT' | 'ETH'

Response:
{
  usdAmount: number;
  cryptoAmount: string;
  currency: string;
  rate: number;
  timestamp: string;
}
```

#### POST /api/crypto/deposit

Bakiye yükleme isteği oluştur.

```typescript
Request:
{
  walletAddress: string;
  txHash: string;
  currency: 'USDT' | 'ETH';
  cryptoAmount: string;
  usdAmount: number;
  network: 'ethereum' | 'polygon' | 'bsc';
}

Response:
{
  requestId: string;
  status: 'pending';
  estimatedConfirmationTime: string;
}
```

#### GET /api/crypto/deposit/:requestId

Deposit durumu sorgula.

```typescript
Response:
{
  requestId: string;
  status: 'pending' | 'completed' | 'failed' | 'timeout';
  txHash: string;
  amount: number;
  currency: string;
  confirmations: number;
  createdAt: string;
  confirmedAt: string | null;
  errorMessage?: string;
}
```

#### POST /api/crypto/subscription-payment

Abonelik ödemesi oluştur.

```typescript
Request:
{
  walletAddress: string;
  txHash: string;
  plan: 'monthly' | 'yearly';
  currency: 'USDT' | 'ETH';
  cryptoAmount: string;
  network: 'ethereum' | 'polygon' | 'bsc';
}

Response:
{
  paymentId: string;
  status: 'pending';
  subscriptionId: string | null;
}
```

#### GET /api/crypto/transactions

Kullanıcı işlem geçmişi.

```typescript
Query Parameters:
- type?: 'deposit' | 'subscription'
- status?: 'pending' | 'completed' | 'failed' | 'timeout'
- startDate?: string
- endDate?: string
- limit?: number
- offset?: number

Response:
{
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}
```

#### GET /api/crypto/gas-estimate

Gas fee tahmini al.

```typescript
Query Parameters:
- network: 'ethereum' | 'polygon' | 'bsc'
- currency: 'USDT' | 'ETH'

Response:
{
  network: string;
  estimatedGasFee: string;
  estimatedGasFeeUSD: number;
  gasPrice: string;
}
```

## Data Models

### crypto_transactions

Tüm kripto para işlemlerini saklayan ana tablo.

```sql
CREATE TABLE crypto_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  tx_hash VARCHAR(66) NOT NULL UNIQUE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'subscription')),
  currency VARCHAR(10) NOT NULL CHECK (currency IN ('USDT', 'ETH')),
  crypto_amount DECIMAL(36, 18) NOT NULL,
  usd_amount DECIMAL(10, 2) NOT NULL,
  exchange_rate DECIMAL(20, 8) NOT NULL,
  network VARCHAR(20) NOT NULL CHECK (network IN ('ethereum', 'polygon', 'bsc')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'timeout')),
  confirmations INTEGER DEFAULT 0,
  platform_wallet_address VARCHAR(42) NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  timeout_at TIMESTAMP,
  
  INDEX idx_user_transactions (user_id, created_at DESC),
  INDEX idx_tx_hash (tx_hash),
  INDEX idx_status (status),
  INDEX idx_pending_timeout (status, created_at) WHERE status = 'pending'
);
```

### crypto_wallets

Kullanıcı cüzdan adreslerini saklayan tablo.

```sql
CREATE TABLE crypto_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  network VARCHAR(20) NOT NULL CHECK (network IN ('ethereum', 'polygon', 'bsc')),
  is_primary BOOLEAN DEFAULT false,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE (user_id, wallet_address, network),
  INDEX idx_user_wallets (user_id),
  INDEX idx_wallet_address (wallet_address)
);
```

### crypto_price_cache

Kripto para fiyat cache tablosu.

```sql
CREATE TABLE crypto_price_cache (
  id SERIAL PRIMARY KEY,
  currency VARCHAR(10) NOT NULL UNIQUE CHECK (currency IN ('USDT', 'ETH')),
  usd_price DECIMAL(20, 8) NOT NULL,
  source VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  INDEX idx_currency_updated (currency, updated_at DESC)
);
```

### refund_requests

Geri ödeme talepleri tablosu (opsiyonel).

```sql
CREATE TABLE refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES crypto_transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  refund_tx_hash VARCHAR(66),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  INDEX idx_user_refunds (user_id, created_at DESC),
  INDEX idx_status (status)
);
```

### Mevcut Tablolara Eklenmesi Gerekenler

#### users tablosu

Değişiklik gerekmez, mevcut yapı yeterli.

#### subscriptions tablosu

Kripto para ödemesi bilgisi için yeni alan:

```sql
ALTER TABLE subscriptions
ADD COLUMN payment_method VARCHAR(20) DEFAULT 'balance' CHECK (payment_method IN ('balance', 'crypto'));

ALTER TABLE subscriptions
ADD COLUMN crypto_transaction_id UUID REFERENCES crypto_transactions(id) ON DELETE SET NULL;
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

Prework analizinden sonra, aşağıdaki property'leri birleştirme ve eleme işlemi yapıldı:

**Birleştirilen Property'ler:**
- 2.6 ve 4.4: Her iki durumda da Platform_Wallet adresinin kullanılması aynı invariant'ı test eder
- 2.8 ve 4.6: Yeni işlemlerin "pending" durumunda başlaması aynı invariant
- 3.4 ve 3.5: Her ikisi de adres doğrulama hatalarını test eder, tek bir property'de birleştirilebilir
- 7.1 ve 7.2: Her ikisi de yetersiz bakiye kontrollerini test eder

**Elenen Property'ler:**
- 1.2, 1.6, 2.2, 2.9, 4.1: UI spesifik örnekler, unit test ile kapsanmalı
- 6.3, 6.4, 10.1, 10.2, 10.3: Opsiyonel admin özellikleri, unit test ile kapsanmalı
- 9.5: UI rendering testi

### Property 1: MetaMask Varlık Kontrolü

*For any* browser environment, the MetaMask detection function should correctly identify whether the MetaMask extension is installed by checking for the ethereum provider object.

**Validates: Requirements 1.1**

### Property 2: Cüzdan Adresi Session Round-Trip

*For any* valid Ethereum wallet address, when a user connects their wallet, storing the address in session and retrieving it should return the same address.

**Validates: Requirements 1.4**

### Property 3: Adres Formatlama

*For any* valid Ethereum address (42 characters starting with 0x), the address formatting function should produce a shortened format showing first 6 and last 4 characters (e.g., 0x1234...5678).

**Validates: Requirements 1.5**

### Property 4: Ağ Tespiti

*For any* supported blockchain network (Ethereum Mainnet, Polygon, BSC), the network detection function should correctly identify the network from its chain ID.

**Validates: Requirements 1.7**

### Property 5: Minimum Tutar Validasyonu

*For any* deposit amount, the validation function should reject amounts below the minimum threshold (10 USD or network-specific minimum) and accept amounts at or above the threshold.

**Validates: Requirements 2.1, 8.5**

### Property 6: Fiyat Dönüşüm Doğruluğu

*For any* positive USD amount and current exchange rate, converting USD to crypto and back to USD should yield a value within 2% of the original amount (accounting for slippage protection).

**Validates: Requirements 2.3, 9.4**

### Property 7: Gas Fee Pozitifliği

*For any* valid transaction on a supported network, the estimated gas fee should always be a positive number greater than zero.

**Validates: Requirements 2.4**

### Property 8: Platform Wallet Invariant

*For any* deposit or subscription payment transaction, the recipient address in the blockchain transaction must always be the configured Platform_Wallet address for that network.

**Validates: Requirements 2.6, 4.4**

### Property 9: Transaction Hash Kayıt Round-Trip

*For any* valid transaction hash, storing it in the database and retrieving it should return the same hash value.

**Validates: Requirements 2.7, 4.5**

### Property 10: Yeni İşlem Durumu Invariant

*For any* newly created deposit or subscription payment transaction, the initial status must be "pending".

**Validates: Requirements 2.8, 4.6**

### Property 11: Transaction Hash Uniqueness

*For any* transaction hash, attempting to insert it into the database twice should fail on the second attempt due to unique constraint.

**Validates: Requirements 7.7, 7.8**

### Property 12: Blockchain Doğrulama

*For any* transaction hash on a supported network, querying the blockchain should return transaction details including sender, recipient, amount, and confirmation count.

**Validates: Requirements 3.1**

### Property 13: Blok Onay Eşiği

*For any* transaction being verified, the system should only mark it as confirmed when it has at least 3 block confirmations.

**Validates: Requirements 3.2**

### Property 14: Adres Doğrulama Reddi

*For any* transaction where either the recipient address doesn't match Platform_Wallet or the sender address doesn't match the user's wallet, the verification should fail and mark the transaction as "failed".

**Validates: Requirements 3.4, 3.5**

### Property 15: Bakiye Artış Doğruluğu

*For any* verified deposit transaction, the user's balance increase should equal the USD equivalent of the crypto amount at the time of transaction, within the slippage tolerance.

**Validates: Requirements 3.6**

### Property 16: Doğrulama Sonrası Durum Geçişi

*For any* transaction that passes all verifications, the status should transition from "pending" to "completed".

**Validates: Requirements 3.7**

### Property 17: Bildirim Gönderimi

*For any* completed deposit transaction, a success notification should be sent to the user.

**Validates: Requirements 3.8**

### Property 18: Abonelik Fiyat Hesaplama

*For any* subscription plan (monthly or yearly), the crypto equivalent calculation should produce consistent results for the same USD price and exchange rate.

**Validates: Requirements 4.2**

### Property 19: MetaMask Bağlantı Kontrolü

*For any* subscription payment attempt, the system should verify that a wallet is connected before initiating the payment transaction.

**Validates: Requirements 4.3**

### Property 20: Abonelik Aktivasyon Zinciri

*For any* verified subscription payment, the system should activate the subscription, update user role to "premium", and set correct start/end dates in a single atomic operation.

**Validates: Requirements 4.7, 4.8, 4.9**

### Property 21: İşlem Listeleme Bütünlüğü

*For any* user, querying their transaction history should return all deposit and subscription payment transactions associated with their user ID, ordered by creation date.

**Validates: Requirements 5.1**

### Property 22: İşlem Detay Bütünlüğü

*For any* transaction record, it must contain all required fields: date, amount, currency, transaction hash, and status.

**Validates: Requirements 5.2**

### Property 23: Explorer Link Oluşturma

*For any* transaction hash and network combination, the blockchain explorer URL generation function should produce a valid URL in the format: `https://{network-explorer}/tx/{txHash}`.

**Validates: Requirements 5.3**

### Property 24: İşlem Filtreleme ve Sıralama

*For any* set of transactions and filter criteria (date range, status, type), the filtering function should return only transactions matching all criteria, sorted by the specified field.

**Validates: Requirements 5.4**

### Property 25: Platform Wallet Validasyonu

*For any* configured Platform_Wallet address, it must be a valid Ethereum address (42 characters, starting with 0x, valid hexadecimal).

**Validates: Requirements 6.2**

### Property 26: Audit Log Bütünlüğü

*For any* critical operation (deposit creation, verification, balance update, subscription activation), an audit log entry must be created with timestamp, user ID, action type, and state changes.

**Validates: Requirements 7.5, 10.4**

### Property 27: Rate Limiting

*For any* user, the number of deposit or payment requests within a 5-minute window should not exceed the configured rate limit (e.g., 10 requests).

**Validates: Requirements 7.9**

### Property 28: Ağ Bazlı Wallet Yönetimi

*For any* blockchain network, the system should maintain separate Platform_Wallet addresses and correctly route transactions to the appropriate address based on the network.

**Validates: Requirements 8.3**

### Property 29: Ağ Bilgisi Persistance

*For any* transaction, the blockchain network used must be stored in the transaction record and remain immutable.

**Validates: Requirements 8.4**

### Property 30: Fiyat API Entegrasyonu

*For any* supported cryptocurrency (USDT, ETH), the price service should successfully fetch current prices from the external API and cache them.

**Validates: Requirements 9.1**

### Property 31: Fiyat Fallback Mekanizması

*For any* cryptocurrency, when the price API is unavailable, the system should return the last known cached price and indicate that it's using cached data.

**Validates: Requirements 9.3**

### Edge Cases

The following edge cases will be handled through property test generators and specific unit tests:

- **Empty/Invalid Wallet Addresses**: Generators will include invalid address formats
- **Insufficient Balance**: Test cases for both crypto balance and gas fee insufficiency (7.1, 7.2)
- **High Gas Fees**: Test cases for gas fee threshold warnings (7.3)
- **Connection Loss**: Test cases for MetaMask disconnection handling (7.4)
- **Unsupported Networks**: Test cases for network validation (8.2)
- **Transaction Timeout**: Test cases for 30-minute timeout handling (3.9)
- **Duplicate Transaction Hash**: Covered by Property 11
- **Pending Transaction Cancellation**: Test cases for cancellation workflow (10.5)


## Error Handling

### Frontend Error Handling

#### MetaMask Bağlantı Hataları

```typescript
enum MetaMaskError {
  NOT_INSTALLED = 'METAMASK_NOT_INSTALLED',
  USER_REJECTED = 'USER_REJECTED_CONNECTION',
  ALREADY_PROCESSING = 'REQUEST_ALREADY_PROCESSING',
  UNSUPPORTED_NETWORK = 'UNSUPPORTED_NETWORK',
  DISCONNECTED = 'WALLET_DISCONNECTED'
}

class MetaMaskErrorHandler {
  handle(error: any): UserFriendlyError {
    if (error.code === 4001) {
      return {
        type: MetaMaskError.USER_REJECTED,
        message: 'Cüzdan bağlantısı reddedildi. Lütfen tekrar deneyin.',
        action: 'retry'
      };
    }
    // ... diğer hata kodları
  }
}
```

#### Transaction Hataları

```typescript
enum TransactionError {
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INSUFFICIENT_GAS = 'INSUFFICIENT_GAS',
  GAS_TOO_HIGH = 'GAS_TOO_HIGH',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  NETWORK_ERROR = 'NETWORK_ERROR'
}
```


### Backend Error Handling

#### Validation Errors

```typescript
class ValidationError extends Error {
  constructor(
    public field: string,
    public message: string,
    public code: string
  ) {
    super(message);
  }
}

// Örnekler:
// - Invalid wallet address format
// - Amount below minimum threshold
// - Unsupported currency
// - Unsupported network
```

#### Blockchain Errors

```typescript
class BlockchainError extends Error {
  constructor(
    public type: 'PROVIDER_ERROR' | 'TRANSACTION_NOT_FOUND' | 'VERIFICATION_FAILED',
    public message: string,
    public txHash?: string
  ) {
    super(message);
  }
}
```

#### Rate Limiting

```typescript
class RateLimitError extends Error {
  constructor(
    public userId: string,
    public retryAfter: number
  ) {
    super(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
  }
}
```


### Error Recovery Strategies

#### Transaction Timeout Recovery

```typescript
// 30 dakika sonra timeout olan işlemler için
async handleTimeoutTransactions() {
  const timeoutThreshold = new Date(Date.now() - 30 * 60 * 1000);
  
  const timedOutTxs = await db.query(
    `UPDATE crypto_transactions 
     SET status = 'timeout', timeout_at = NOW()
     WHERE status = 'pending' 
     AND created_at < $1
     RETURNING *`,
    [timeoutThreshold]
  );
  
  // Kullanıcılara bildirim gönder
  for (const tx of timedOutTxs.rows) {
    await notificationService.send(tx.user_id, {
      type: 'TRANSACTION_TIMEOUT',
      txHash: tx.tx_hash,
      message: 'İşleminiz zaman aşımına uğradı. Lütfen blockchain explorer\'dan kontrol edin.'
    });
  }
}
```

#### Price API Fallback

```typescript
async getPriceWithFallback(currency: 'USDT' | 'ETH'): Promise<PriceData> {
  try {
    // Primary API
    const price = await this.priceAPI.getPrice(currency);
    await this.cache.set(`price:${currency}`, price, 300); // 5 min cache
    return { price, source: 'live', timestamp: new Date() };
  } catch (error) {
    // Fallback to cache
    const cachedPrice = await this.cache.get(`price:${currency}`);
    if (cachedPrice) {
      return { 
        price: cachedPrice, 
        source: 'cached', 
        timestamp: await this.cache.getTimestamp(`price:${currency}`)
      };
    }
    throw new Error('Price data unavailable');
  }
}
```


### Atomic Transaction Handling

Tüm kritik işlemler database transaction içinde yapılır:

```typescript
async processVerifiedDeposit(tx: CryptoTransaction): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Transaction durumunu güncelle
    await client.query(
      `UPDATE crypto_transactions 
       SET status = 'completed', confirmed_at = NOW(), confirmations = $1
       WHERE id = $2`,
      [tx.confirmations, tx.id]
    );
    
    // 2. Kullanıcı bakiyesini artır
    await client.query(
      `UPDATE users 
       SET balance = balance + $1 
       WHERE id = $2`,
      [tx.usd_amount, tx.user_id]
    );
    
    // 3. Audit log oluştur
    await client.query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, user_id, old_state, new_state)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['crypto_transaction', tx.id, 'deposit_verified', tx.user_id, 
       JSON.stringify({ status: 'pending' }), 
       JSON.stringify({ status: 'completed', amount: tx.usd_amount })]
    );
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```


## Testing Strategy

### Dual Testing Approach

Bu özellik için hem unit testler hem de property-based testler kullanılacaktır. Her iki test türü birbirini tamamlar:

- **Unit Tests**: Spesifik örnekler, edge case'ler, hata durumları
- **Property Tests**: Evrensel kurallar, geniş input coverage

### Property-Based Testing

**Library**: fast-check (JavaScript/TypeScript için)

**Configuration**: Her property test minimum 100 iterasyon çalıştırılacak

**Tagging Format**: Her test, design dokümanındaki property'ye referans verecek
```typescript
// Feature: metamask-payment-integration, Property 3: Adres Formatlama
```

### Property Test Examples

#### Property 3: Adres Formatlama

```typescript
import fc from 'fast-check';

// Feature: metamask-payment-integration, Property 3: Adres Formatlama
describe('Address Formatting Property', () => {
  it('should format any valid Ethereum address correctly', () => {
    fc.assert(
      fc.property(
        fc.hexaString({ minLength: 40, maxLength: 40 }),
        (hexAddress) => {
          const address = '0x' + hexAddress;
          const formatted = formatAddress(address);
          
          // Property: formatted address should be 13 chars (0x + 4 + ... + 4)
          expect(formatted).toHaveLength(13);
          expect(formatted).toMatch(/^0x[0-9a-fA-F]{4}\.\.\.[0-9a-fA-F]{4}$/);
          expect(formatted.substring(0, 6)).toBe(address.substring(0, 6));
          expect(formatted.substring(9)).toBe(address.substring(38));
        }
      ),
      { numRuns: 100 }
    );
  });
});
```


#### Property 6: Fiyat Dönüşüm Round-Trip

```typescript
// Feature: metamask-payment-integration, Property 6: Fiyat Dönüşüm Doğruluğu
describe('Price Conversion Round-Trip Property', () => {
  it('should maintain value within slippage tolerance', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 10, max: 10000 }), // USD amount
        fc.double({ min: 0.5, max: 5000 }), // Exchange rate
        async (usdAmount, exchangeRate) => {
          const priceService = new PriceConversionService(mockAPI, mockCache);
          mockAPI.getPrice.mockResolvedValue(exchangeRate);
          
          // USD -> Crypto -> USD
          const cryptoAmount = await priceService.convertUSDToCrypto(usdAmount, 'ETH');
          const backToUSD = await priceService.convertCryptoToUSD(cryptoAmount, 'ETH');
          
          // Property: Round-trip should be within 2% slippage
          const difference = Math.abs(backToUSD - usdAmount);
          const percentDiff = (difference / usdAmount) * 100;
          expect(percentDiff).toBeLessThanOrEqual(2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### Property 11: Transaction Hash Uniqueness

```typescript
// Feature: metamask-payment-integration, Property 11: Transaction Hash Uniqueness
describe('Transaction Hash Uniqueness Property', () => {
  it('should reject duplicate transaction hashes', () => {
    fc.assert(
      fc.property(
        fc.hexaString({ minLength: 64, maxLength: 64 }),
        fc.uuid(),
        async (txHashHex, userId) => {
          const txHash = '0x' + txHashHex;
          const transaction = {
            userId,
            walletAddress: '0x' + '1'.repeat(40),
            txHash,
            currency: 'USDT',
            cryptoAmount: '100',
            usdAmount: 100,
            network: 'ethereum'
          };
          
          // First insert should succeed
          const first = await cryptoService.createDepositRequest(transaction);
          expect(first).toBeDefined();
          
          // Second insert with same txHash should fail
          await expect(
            cryptoService.createDepositRequest(transaction)
          ).rejects.toThrow(/unique constraint/i);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```


#### Property 20: Abonelik Aktivasyon Zinciri

```typescript
// Feature: metamask-payment-integration, Property 20: Abonelik Aktivasyon Zinciri
describe('Subscription Activation Chain Property', () => {
  it('should atomically activate subscription and update user role', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.constantFrom('monthly', 'yearly'),
        async (userId, plan) => {
          const payment = {
            userId,
            walletAddress: '0x' + '1'.repeat(40),
            txHash: '0x' + fc.hexaString({ minLength: 64, maxLength: 64 }).generate(),
            plan,
            currency: 'USDT',
            cryptoAmount: '50',
            network: 'ethereum'
          };
          
          // Create and verify payment
          const paymentRecord = await cryptoService.createSubscriptionPayment(payment);
          await txVerifier.verifyAndProcess(paymentRecord.txHash);
          
          // Property: All three should be updated atomically
          const user = await userRepository.findById(userId);
          const subscription = await subscriptionRepository.findActiveByUserId(userId);
          const transaction = await cryptoTransactionRepository.findByTxHash(payment.txHash);
          
          expect(user.role).toBe('premium');
          expect(subscription).toBeDefined();
          expect(subscription.status).toBe('active');
          expect(transaction.status).toBe('completed');
          expect(subscription.startDate).toBeInstanceOf(Date);
          expect(subscription.endDate).toBeInstanceOf(Date);
          expect(subscription.endDate > subscription.startDate).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```


### Unit Test Coverage

Unit testler aşağıdaki alanları kapsayacak:

#### Frontend Component Tests

```typescript
// MetaMaskConnectButton.test.tsx
describe('MetaMaskConnectButton', () => {
  it('should show install prompt when MetaMask not installed', () => {
    // Requirement 1.2 - Example test
  });
  
  it('should show rejection message when user rejects connection', () => {
    // Requirement 1.6 - Example test
  });
  
  it('should handle disconnection gracefully', () => {
    // Edge case: Connection loss
  });
});

// CryptoDepositForm.test.tsx
describe('CryptoDepositForm', () => {
  it('should display USDT and ETH options', () => {
    // Requirement 2.2 - Example test
  });
  
  it('should show error for insufficient balance', () => {
    // Edge case: Insufficient funds
  });
  
  it('should warn about high gas fees', () => {
    // Edge case: High gas fees
  });
});
```

#### Backend Service Tests

```typescript
// TransactionVerifier.test.ts
describe('TransactionVerifier', () => {
  it('should mark transaction as failed when recipient mismatch', () => {
    // Edge case: Wrong recipient address
  });
  
  it('should mark transaction as failed when sender mismatch', () => {
    // Edge case: Wrong sender address
  });
  
  it('should timeout transactions after 30 minutes', () => {
    // Edge case: Transaction timeout
  });
});

// CryptoPaymentService.test.ts
describe('CryptoPaymentService', () => {
  it('should reject unsupported network', () => {
    // Edge case: Unsupported network
  });
  
  it('should handle duplicate transaction hash', () => {
    // Edge case: Duplicate prevention
  });
});
```


#### Integration Tests

```typescript
// crypto-payment-flow.integration.test.ts
describe('Crypto Payment Flow Integration', () => {
  it('should complete full deposit flow from transaction to balance update', async () => {
    // End-to-end deposit test
  });
  
  it('should complete full subscription payment flow', async () => {
    // End-to-end subscription test
  });
  
  it('should handle concurrent deposits correctly', async () => {
    // Concurrency test
  });
});

// price-service.integration.test.ts
describe('Price Service Integration', () => {
  it('should fetch real prices from CoinGecko API', async () => {
    // Real API integration test
  });
  
  it('should fallback to cache when API fails', async () => {
    // Fallback mechanism test
  });
});
```

### Test Data Generators

Property testler için custom generator'lar:

```typescript
// Ethereum address generator
const ethereumAddressArb = fc.hexaString({ minLength: 40, maxLength: 40 })
  .map(hex => '0x' + hex);

// Transaction hash generator
const txHashArb = fc.hexaString({ minLength: 64, maxLength: 64 })
  .map(hex => '0x' + hex);

// Valid deposit amount generator (min 10 USD)
const depositAmountArb = fc.double({ min: 10, max: 100000 });

// Blockchain network generator
const networkArb = fc.constantFrom('ethereum', 'polygon', 'bsc');

// Currency generator
const currencyArb = fc.constantFrom('USDT', 'ETH');

// Transaction status generator
const statusArb = fc.constantFrom('pending', 'completed', 'failed', 'timeout');
```


### Test Environment Setup

```typescript
// test-setup.ts
export const setupTestEnvironment = () => {
  // Mock MetaMask provider
  global.window.ethereum = {
    isMetaMask: true,
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn()
  };
  
  // Mock ethers providers
  jest.mock('ethers', () => ({
    JsonRpcProvider: jest.fn(),
    Contract: jest.fn(),
    formatEther: jest.fn(),
    parseEther: jest.fn()
  }));
  
  // Test database
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
  process.env.PLATFORM_WALLET_ETHEREUM = '0x' + '1'.repeat(40);
  process.env.PLATFORM_WALLET_POLYGON = '0x' + '2'.repeat(40);
  process.env.PLATFORM_WALLET_BSC = '0x' + '3'.repeat(40);
};
```

### Performance Testing

```typescript
// performance.test.ts
describe('Performance Tests', () => {
  it('should handle 100 concurrent price conversions', async () => {
    const promises = Array(100).fill(null).map(() => 
      priceService.convertUSDToCrypto(100, 'USDT')
    );
    
    const start = Date.now();
    await Promise.all(promises);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(5000); // 5 seconds max
  });
  
  it('should verify 50 transactions in parallel', async () => {
    // Parallel verification performance test
  });
});
```

### Security Testing

```typescript
// security.test.ts
describe('Security Tests', () => {
  it('should never expose private keys', () => {
    // Verify no private key handling in code
  });
  
  it('should validate all wallet addresses', () => {
    // SQL injection prevention
  });
  
  it('should enforce rate limiting', async () => {
    // Rate limit enforcement test
  });
  
  it('should prevent transaction replay attacks', async () => {
    // Duplicate transaction prevention
  });
});
```


## Security Considerations

### Private Key Management

- **ASLA** kullanıcı private key'lerini backend'de saklamayın
- Tüm transaction imzalama işlemleri MetaMask üzerinden yapılmalı
- Backend sadece public wallet address'leri saklar

### Platform Wallet Security

```typescript
// Environment variables (NEVER commit to git)
PLATFORM_WALLET_ETHEREUM=0x...
PLATFORM_WALLET_POLYGON=0x...
PLATFORM_WALLET_BSC=0x...

// Validation on startup
if (!isValidAddress(process.env.PLATFORM_WALLET_ETHEREUM)) {
  throw new Error('Invalid platform wallet address');
}
```

### Input Validation

```typescript
// Wallet address validation
function validateWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Transaction hash validation
function validateTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

// Amount validation
function validateAmount(amount: number, min: number, max: number): boolean {
  return amount >= min && amount <= max && !isNaN(amount);
}
```

### SQL Injection Prevention

```typescript
// ALWAYS use parameterized queries
const result = await pool.query(
  'SELECT * FROM crypto_transactions WHERE tx_hash = $1',
  [txHash]  // Parameterized
);

// NEVER concatenate user input
// BAD: `SELECT * FROM crypto_transactions WHERE tx_hash = '${txHash}'`
```


### Rate Limiting Implementation

```typescript
import rateLimit from 'express-rate-limit';

const cryptoDepositLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 requests per window
  message: 'Too many deposit requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user.id // Per user
});

app.post('/api/crypto/deposit', cryptoDepositLimiter, depositHandler);
```

### Transaction Verification Security

```typescript
async verifyTransaction(tx: CryptoTransaction): Promise<boolean> {
  // 1. Verify transaction exists on blockchain
  const blockchainTx = await provider.getTransaction(tx.txHash);
  if (!blockchainTx) return false;
  
  // 2. Verify recipient is platform wallet
  if (blockchainTx.to.toLowerCase() !== platformWallet.toLowerCase()) {
    await this.markAsFailed(tx.id, 'Invalid recipient address');
    return false;
  }
  
  // 3. Verify sender is user's wallet
  if (blockchainTx.from.toLowerCase() !== tx.walletAddress.toLowerCase()) {
    await this.markAsFailed(tx.id, 'Invalid sender address');
    return false;
  }
  
  // 4. Verify amount matches (with tolerance for gas)
  const expectedAmount = parseEther(tx.cryptoAmount);
  const actualAmount = blockchainTx.value;
  const tolerance = parseEther('0.0001'); // Small tolerance
  
  if (Math.abs(Number(actualAmount - expectedAmount)) > Number(tolerance)) {
    await this.markAsFailed(tx.id, 'Amount mismatch');
    return false;
  }
  
  // 5. Verify confirmations
  if (blockchainTx.confirmations < 3) {
    return false; // Not enough confirmations yet
  }
  
  return true;
}
```


### Audit Logging

```typescript
interface AuditLog {
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  oldState: any;
  newState: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

async function logCriticalAction(log: AuditLog): Promise<void> {
  await pool.query(
    `INSERT INTO audit_logs 
     (entity_type, entity_id, action, user_id, old_state, new_state, ip_address, user_agent, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
    [
      log.entityType,
      log.entityId,
      log.action,
      log.userId,
      JSON.stringify(log.oldState),
      JSON.stringify(log.newState),
      log.ipAddress,
      log.userAgent
    ]
  );
}

// Critical actions to log:
// - Deposit creation
// - Transaction verification
// - Balance updates
// - Subscription activation
// - Failed verifications
// - Refund requests
```

## Implementation Notes

### Environment Variables

```bash
# Blockchain RPC Endpoints
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org

# Platform Wallets (KEEP SECURE!)
PLATFORM_WALLET_ETHEREUM=0x...
PLATFORM_WALLET_POLYGON=0x...
PLATFORM_WALLET_BSC=0x...

# Price API
COINGECKO_API_KEY=your_api_key
PRICE_UPDATE_INTERVAL=60000  # 60 seconds

# Transaction Settings
MIN_DEPOSIT_USD=10
CONFIRMATION_BLOCKS=3
TRANSACTION_TIMEOUT_MINUTES=30
SLIPPAGE_TOLERANCE_PERCENT=2

# Rate Limiting
RATE_LIMIT_WINDOW_MS=300000  # 5 minutes
RATE_LIMIT_MAX_REQUESTS=10
```


### Database Migrations

```sql
-- Migration: 012_create_crypto_payment_tables.sql

-- crypto_transactions table
CREATE TABLE crypto_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  tx_hash VARCHAR(66) NOT NULL UNIQUE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'subscription')),
  currency VARCHAR(10) NOT NULL CHECK (currency IN ('USDT', 'ETH')),
  crypto_amount DECIMAL(36, 18) NOT NULL,
  usd_amount DECIMAL(10, 2) NOT NULL,
  exchange_rate DECIMAL(20, 8) NOT NULL,
  network VARCHAR(20) NOT NULL CHECK (network IN ('ethereum', 'polygon', 'bsc')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'timeout')),
  confirmations INTEGER DEFAULT 0,
  platform_wallet_address VARCHAR(42) NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  timeout_at TIMESTAMP
);

CREATE INDEX idx_user_transactions ON crypto_transactions(user_id, created_at DESC);
CREATE INDEX idx_tx_hash ON crypto_transactions(tx_hash);
CREATE INDEX idx_status ON crypto_transactions(status);
CREATE INDEX idx_pending_timeout ON crypto_transactions(status, created_at) WHERE status = 'pending';

-- crypto_wallets table
CREATE TABLE crypto_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  network VARCHAR(20) NOT NULL CHECK (network IN ('ethereum', 'polygon', 'bsc')),
  is_primary BOOLEAN DEFAULT false,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, wallet_address, network)
);

CREATE INDEX idx_user_wallets ON crypto_wallets(user_id);
CREATE INDEX idx_wallet_address ON crypto_wallets(wallet_address);

-- crypto_price_cache table
CREATE TABLE crypto_price_cache (
  id SERIAL PRIMARY KEY,
  currency VARCHAR(10) NOT NULL UNIQUE CHECK (currency IN ('USDT', 'ETH')),
  usd_price DECIMAL(20, 8) NOT NULL,
  source VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_currency_updated ON crypto_price_cache(currency, updated_at DESC);

-- refund_requests table
CREATE TABLE refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES crypto_transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  refund_tx_hash VARCHAR(66),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_user_refunds ON refund_requests(user_id, created_at DESC);
CREATE INDEX idx_status ON refund_requests(status);

-- Update subscriptions table
ALTER TABLE subscriptions
ADD COLUMN payment_method VARCHAR(20) DEFAULT 'balance' CHECK (payment_method IN ('balance', 'crypto'));

ALTER TABLE subscriptions
ADD COLUMN crypto_transaction_id UUID REFERENCES crypto_transactions(id) ON DELETE SET NULL;
```


### Background Jobs

```typescript
// jobs/cryptoJobs.ts
import cron from 'node-cron';

// Transaction verification job - her 30 saniyede bir
cron.schedule('*/30 * * * * *', async () => {
  try {
    await transactionVerifier.processPendingTransactions();
  } catch (error) {
    console.error('Transaction verification job failed:', error);
  }
});

// Timeout check job - her 5 dakikada bir
cron.schedule('*/5 * * * *', async () => {
  try {
    await transactionVerifier.checkTimeouts();
  } catch (error) {
    console.error('Timeout check job failed:', error);
  }
});

// Price update job - her 60 saniyede bir
cron.schedule('*/60 * * * * *', async () => {
  try {
    await priceService.updatePrices();
  } catch (error) {
    console.error('Price update job failed:', error);
  }
});
```

### Frontend State Management

```typescript
// store/slices/cryptoPaymentSlice.ts
interface CryptoPaymentState {
  walletAddress: string | null;
  chainId: number | null;
  isConnected: boolean;
  balance: string | null;
  pendingTransactions: Transaction[];
  prices: {
    USDT: number;
    ETH: number;
    lastUpdated: Date;
  };
}

const cryptoPaymentSlice = createSlice({
  name: 'cryptoPayment',
  initialState,
  reducers: {
    connectWallet: (state, action) => {
      state.walletAddress = action.payload.address;
      state.chainId = action.payload.chainId;
      state.isConnected = true;
    },
    disconnectWallet: (state) => {
      state.walletAddress = null;
      state.chainId = null;
      state.isConnected = false;
    },
    updatePrices: (state, action) => {
      state.prices = action.payload;
    },
    addPendingTransaction: (state, action) => {
      state.pendingTransactions.push(action.payload);
    },
    updateTransactionStatus: (state, action) => {
      const tx = state.pendingTransactions.find(t => t.id === action.payload.id);
      if (tx) {
        tx.status = action.payload.status;
      }
    }
  }
});
```


### WebSocket Notifications

```typescript
// Real-time transaction status updates
io.on('connection', (socket) => {
  socket.on('subscribe:transactions', (userId) => {
    socket.join(`user:${userId}:transactions`);
  });
});

// Emit when transaction status changes
async function notifyTransactionUpdate(userId: string, transaction: Transaction) {
  io.to(`user:${userId}:transactions`).emit('transaction:updated', {
    id: transaction.id,
    status: transaction.status,
    txHash: transaction.txHash,
    confirmedAt: transaction.confirmedAt
  });
}
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Platform wallet addresses verified
- [ ] RPC endpoints tested
- [ ] Price API key configured
- [ ] Rate limiting configured
- [ ] Background jobs scheduled
- [ ] WebSocket server configured
- [ ] Audit logging enabled
- [ ] Error monitoring setup (Sentry)
- [ ] SSL/TLS certificates valid
- [ ] CORS configured correctly
- [ ] Security headers configured

### Monitoring and Alerts

```typescript
// Metrics to monitor
- Pending transaction count
- Average verification time
- Failed transaction rate
- Price API uptime
- Rate limit hits
- Timeout transaction count
- Platform wallet balance
- Gas fee trends

// Alerts to configure
- Pending transactions > 50
- Failed transaction rate > 5%
- Price API down > 5 minutes
- Platform wallet balance < threshold
- Unusual gas fee spike
- Rate limit exceeded frequently
```

## Conclusion

Bu tasarım belgesi, MetaMask ödeme entegrasyonu için kapsamlı bir teknik plan sunmaktadır. Sistem, güvenlik, ölçeklenebilirlik ve kullanıcı deneyimi prensiplerini göz önünde bulundurarak tasarlanmıştır. Property-based testing yaklaşımı ile sistem doğruluğu garanti altına alınmış, edge case'ler ve hata senaryoları detaylı şekilde ele alınmıştır.

