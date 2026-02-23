import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const DepositWithdrawPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement deposit/withdraw logic
    alert(`${activeTab === 'deposit' ? 'Yatırma' : 'Çekme'} işlemi: $${amount}`);
  };

  return (
    <div className="min-h-screen bg-crypto-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Yatırma / Çekme</h1>

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
              Yatırma
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                activeTab === 'withdraw'
                  ? 'bg-crypto-dark-700 text-crypto-yellow-500 border-b-2 border-crypto-yellow-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Çekme
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Balance Display */}
            <div className="bg-crypto-dark-700 rounded-lg p-4 mb-6">
              <p className="text-gray-400 text-sm mb-1">Mevcut Bakiye</p>
              <p className="text-2xl font-bold text-white">
                ${user?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Miktar (USD)
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

              {activeTab === 'deposit' && (
                <div className="bg-crypto-dark-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3">Yatırma Bilgileri</h3>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>• Minimum yatırma: $10</p>
                    <p>• İşlem süresi: Anında</p>
                    <p>• Komisyon: %0</p>
                  </div>
                </div>
              )}

              {activeTab === 'withdraw' && (
                <div className="bg-crypto-dark-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3">Çekim Bilgileri</h3>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>• Minimum çekim: $50</p>
                    <p>• İşlem süresi: 1-3 iş günü</p>
                    <p>• Komisyon: $5</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-crypto-yellow-500 hover:bg-crypto-yellow-600 text-crypto-dark-900 font-bold rounded transition"
              >
                {activeTab === 'deposit' ? 'Yatır' : 'Çek'}
              </button>
            </form>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-6">
          <h3 className="text-white font-semibold mb-4">Önemli Bilgiler</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Tüm işlemler güvenli SSL bağlantısı üzerinden gerçekleştirilir</li>
            <li>• Yatırma işlemleri anında hesabınıza yansır</li>
            <li>• Çekim işlemleri 1-3 iş günü içinde banka hesabınıza aktarılır</li>
            <li>• Herhangi bir sorun yaşarsanız destek ekibimizle iletişime geçin</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
