import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useLanguage } from '../contexts/LanguageContext';
import { PageTransition } from '../components';

type PaymentMethod = 'crypto' | 'card' | 'paypal' | 'binance';

export const DepositWithdrawPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('crypto');
  const [showTransition, setShowTransition] = useState(false);

  // Show transition animation on component mount
  useEffect(() => {
    // Check if we should show the transition (not shown in this session for this page)
    const hasShownTransition = sessionStorage.getItem('depositPageTransitionShown');
    
    if (!hasShownTransition) {
      setShowTransition(true);
      sessionStorage.setItem('depositPageTransitionShown', 'true');
      
      // Hide transition after animation completes
      const timer = setTimeout(() => {
        setShowTransition(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Payment method specific fields
  const [walletAddress, setWalletAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [binanceUid, setBinanceUid] = useState('');

  const t = {
    tr: {
      title: 'Yatırma / Çekme',
      deposit: 'Yatırma',
      withdraw: 'Çekme',
      currentBalance: 'Mevcut Bakiye',
      amount: 'Miktar (USD)',
      selectMethod: 'Ödeme Yöntemi Seçin',
      crypto: 'Kripto (USDT TRC20)',
      card: 'Kredi/Banka Kartı',
      paypal: 'PayPal',
      binance: 'Binance USDT',
      walletAddress: 'USDT TRC20 Cüzdan Adresi',
      cardNumber: 'Kart Numarası',
      paypalEmail: 'PayPal E-posta',
      binanceUid: 'Binance UID',
      depositBtn: 'Yatır',
      withdrawBtn: 'Çek',
      processing: 'İşlem Süresi',
      commission: 'Komisyon',
      minAmount: 'Minimum Tutar',
      instant: 'Anında',
      businessDays: '1-3 iş günü',
      cryptoInfo: 'USDT TRC20 ağı üzerinden transfer',
      cardInfo: 'Visa, Mastercard kabul edilir',
      paypalInfo: 'PayPal hesabınızdan direkt transfer',
      binanceInfo: 'Binance hesabınızdan USDT gönderimi',
      importantInfo: 'Önemli Bilgiler',
      info1: 'Tüm işlemler güvenli SSL bağlantısı üzerinden gerçekleştirilir',
      info2: 'Kripto ve Binance transferleri anında hesabınıza yansır',
      info3: 'Kart ve PayPal işlemleri 5-10 dakika içinde onaylanır',
      info4: 'Çekim işlemleri güvenlik kontrolünden sonra gerçekleştirilir',
      info5: 'Herhangi bir sorun yaşarsanız destek ekibimizle iletişime geçin',
    },
    en: {
      title: 'Deposit / Withdraw',
      deposit: 'Deposit',
      withdraw: 'Withdraw',
      currentBalance: 'Current Balance',
      amount: 'Amount (USD)',
      selectMethod: 'Select Payment Method',
      crypto: 'Crypto (USDT TRC20)',
      card: 'Credit/Debit Card',
      paypal: 'PayPal',
      binance: 'Binance USDT',
      walletAddress: 'USDT TRC20 Wallet Address',
      cardNumber: 'Card Number',
      paypalEmail: 'PayPal Email',
      binanceUid: 'Binance UID',
      depositBtn: 'Deposit',
      withdrawBtn: 'Withdraw',
      processing: 'Processing Time',
      commission: 'Commission',
      minAmount: 'Minimum Amount',
      instant: 'Instant',
      businessDays: '1-3 business days',
      cryptoInfo: 'Transfer via USDT TRC20 network',
      cardInfo: 'Visa, Mastercard accepted',
      paypalInfo: 'Direct transfer from your PayPal account',
      binanceInfo: 'USDT transfer from your Binance account',
      importantInfo: 'Important Information',
      info1: 'All transactions are processed over secure SSL connection',
      info2: 'Crypto and Binance transfers are reflected instantly',
      info3: 'Card and PayPal transactions are confirmed within 5-10 minutes',
      info4: 'Withdrawals are processed after security verification',
      info5: 'Contact our support team if you experience any issues',
    },
  };

  const text = t[language];

  const paymentMethods = [
    {
      id: 'crypto' as PaymentMethod,
      name: text.crypto,
      icon: '₿',
      minDeposit: 10,
      minWithdraw: 50,
      commission: '0%',
      processingTime: text.instant,
      info: text.cryptoInfo,
    },
    {
      id: 'card' as PaymentMethod,
      name: text.card,
      icon: '💳',
      minDeposit: 20,
      minWithdraw: 100,
      commission: '2%',
      processingTime: '5-10 min',
      info: text.cardInfo,
    },
    {
      id: 'paypal' as PaymentMethod,
      name: text.paypal,
      icon: '🅿️',
      minDeposit: 25,
      minWithdraw: 100,
      commission: '2.5%',
      processingTime: '5-10 min',
      info: text.paypalInfo,
    },
    {
      id: 'binance' as PaymentMethod,
      name: text.binance,
      icon: '🔶',
      minDeposit: 10,
      minWithdraw: 50,
      commission: '0%',
      processingTime: text.instant,
      info: text.binanceInfo,
    },
  ];

  const selectedMethod = paymentMethods.find((m) => m.id === paymentMethod);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const minAmount = activeTab === 'deposit' ? selectedMethod?.minDeposit : selectedMethod?.minWithdraw;
    if (parseFloat(amount) < (minAmount || 0)) {
      alert(`${text.minAmount}: $${minAmount}`);
      return;
    }

    // Get method-specific field value
    let methodField = '';
    switch (paymentMethod) {
      case 'crypto':
        methodField = walletAddress;
        break;
      case 'card':
        methodField = cardNumber;
        break;
      case 'paypal':
        methodField = paypalEmail;
        break;
      case 'binance':
        methodField = binanceUid;
        break;
    }

    if (!methodField) {
      alert('Please fill in all required fields');
      return;
    }

    // TODO: Implement actual API call
    alert(
      `${activeTab === 'deposit' ? text.depositBtn : text.withdrawBtn}\n` +
      `${text.amount}: $${amount}\n` +
      `Method: ${selectedMethod?.name}\n` +
      `Field: ${methodField}`
    );
  };

  return (
    <>
      <PageTransition show={showTransition} variant="money" />
      <div className="min-h-screen bg-crypto-dark-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">{text.title}</h1>

        <div className="bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-crypto-dark-500">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                activeTab === 'deposit'
                  ? 'bg-crypto-dark-700 text-crypto-yellow-500 border-b-2 border-crypto-yellow-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {text.deposit}
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                activeTab === 'withdraw'
                  ? 'bg-crypto-dark-700 text-crypto-yellow-500 border-b-2 border-crypto-yellow-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {text.withdraw}
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Balance Display */}
            <div className="bg-crypto-dark-700 rounded-lg p-4 mb-6">
              <p className="text-gray-400 text-sm mb-1">{text.currentBalance}</p>
              <p className="text-2xl font-bold text-white">
                ${user?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  {text.selectMethod}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-lg border-2 transition ${
                        paymentMethod === method.id
                          ? 'border-crypto-yellow-500 bg-crypto-dark-700'
                          : 'border-crypto-dark-500 bg-crypto-dark-800 hover:border-crypto-dark-400'
                      }`}
                    >
                      <div className="text-3xl mb-2">{method.icon}</div>
                      <div className="text-xs text-gray-300 font-medium">{method.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {text.amount}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-3 bg-crypto-dark-700 border border-crypto-dark-500 rounded text-white placeholder-gray-500 focus:outline-none focus:border-crypto-yellow-500"
                />
              </div>

              {/* Method-Specific Fields */}
              {paymentMethod === 'crypto' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {text.walletAddress}
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="TXXXxxxXXXxxxXXXxxxXXXxxx..."
                    required
                    className="w-full px-4 py-3 bg-crypto-dark-700 border border-crypto-dark-500 rounded text-white placeholder-gray-500 focus:outline-none focus:border-crypto-yellow-500"
                  />
                </div>
              )}

              {paymentMethod === 'card' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {text.cardNumber}
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                    className="w-full px-4 py-3 bg-crypto-dark-700 border border-crypto-dark-500 rounded text-white placeholder-gray-500 focus:outline-none focus:border-crypto-yellow-500"
                  />
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {text.paypalEmail}
                  </label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    className="w-full px-4 py-3 bg-crypto-dark-700 border border-crypto-dark-500 rounded text-white placeholder-gray-500 focus:outline-none focus:border-crypto-yellow-500"
                  />
                </div>
              )}

              {paymentMethod === 'binance' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {text.binanceUid}
                  </label>
                  <input
                    type="text"
                    value={binanceUid}
                    onChange={(e) => setBinanceUid(e.target.value)}
                    placeholder="123456789"
                    required
                    className="w-full px-4 py-3 bg-crypto-dark-700 border border-crypto-dark-500 rounded text-white placeholder-gray-500 focus:outline-none focus:border-crypto-yellow-500"
                  />
                </div>
              )}

              {/* Method Info */}
              {selectedMethod && (
                <div className="bg-crypto-dark-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3">{selectedMethod.name}</h3>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>• {text.minAmount}: ${activeTab === 'deposit' ? selectedMethod.minDeposit : selectedMethod.minWithdraw}</p>
                    <p>• {text.processing}: {selectedMethod.processingTime}</p>
                    <p>• {text.commission}: {selectedMethod.commission}</p>
                    <p className="text-gray-500 italic">ℹ️ {selectedMethod.info}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-crypto-yellow-500 hover:bg-crypto-yellow-600 text-crypto-dark-900 font-bold rounded transition"
              >
                {activeTab === 'deposit' ? text.depositBtn : text.withdrawBtn}
              </button>
            </form>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-6">
          <h3 className="text-white font-semibold mb-4">{text.importantInfo}</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• {text.info1}</li>
            <li>• {text.info2}</li>
            <li>• {text.info3}</li>
            <li>• {text.info4}</li>
            <li>• {text.info5}</li>
          </ul>
        </div>
      </div>
      </div>
    </>
  );
};
