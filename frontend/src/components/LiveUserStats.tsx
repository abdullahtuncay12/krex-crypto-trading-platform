import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const LiveUserStats: React.FC = () => {
  const { language } = useLanguage();
  const [onlineUsers, setOnlineUsers] = useState(12514);
  const [offlineUsers, setOfflineUsers] = useState(1625104);

  // Çevrimiçi kullanıcı sayısını dinamik olarak güncelle
  useEffect(() => {
    const interval = setInterval(() => {
      // Çevrimiçi kullanıcılar: 10,000 - 15,000 arası
      setOnlineUsers(prev => {
        const change = Math.floor(Math.random() * 200) - 100; // -100 ile +100 arası değişim
        const newValue = prev + change;
        return Math.max(10000, Math.min(15000, newValue));
      });

      // Çevrimdışı kullanıcılar: 1,600,000 - 1,650,000 arası
      setOfflineUsers(prev => {
        const change = Math.floor(Math.random() * 2000) - 1000; // -1000 ile +1000 arası değişim
        const newValue = prev + change;
        return Math.max(1600000, Math.min(1650000, newValue));
      });
    }, 5000); // Her 5 saniyede bir güncelle

    return () => clearInterval(interval);
  }, []);

  const texts = {
    tr: {
      title: 'Aktif Kullanıcılar',
      online: 'Çevrimiçi',
      offline: 'Çevrimdışı',
      trading: 'Aktif İşlem Yapan',
    },
    en: {
      title: 'Active Users',
      online: 'Online',
      offline: 'Offline',
      trading: 'Active Trading',
    },
  };

  const t = texts[language];

  return (
    <div className="bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-6 shadow-xl">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-crypto-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          {t.title}
        </h3>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        {/* Online Users */}
        <div className="bg-crypto-dark-700 rounded-lg p-4 border border-crypto-dark-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-gray-400 text-sm">{t.online}</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-buy">
                {onlineUsers.toLocaleString('en-US')}
              </p>
              <p className="text-xs text-gray-500">{t.trading}</p>
            </div>
          </div>
        </div>

        {/* Offline Users */}
        <div className="bg-crypto-dark-700 rounded-lg p-4 border border-crypto-dark-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
              </span>
              <span className="text-gray-400 text-sm">{t.offline}</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {offlineUsers.toLocaleString('en-US')}
              </p>
              <p className="text-xs text-gray-500">
                {language === 'tr' ? 'Toplam Kullanıcı' : 'Total Users'}
              </p>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-crypto-yellow-600 to-crypto-yellow-500 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-crypto-dark-900 font-semibold text-sm">
              {language === 'tr' ? 'Toplam' : 'Total'}
            </span>
            <p className="text-2xl font-bold text-crypto-dark-900">
              {(onlineUsers + offlineUsers).toLocaleString('en-US')}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Indicator */}
      <div className="mt-4 pt-4 border-t border-crypto-dark-500">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {language === 'tr' ? 'Son güncelleme' : 'Last update'}
          </span>
          <span className="text-gray-400 animate-pulse">
            {language === 'tr' ? 'Canlı' : 'Live'}
          </span>
        </div>
      </div>
    </div>
  );
};
