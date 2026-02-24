import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const LiveUserStats: React.FC = () => {
  const { language } = useLanguage();
  const [onlineUsers, setOnlineUsers] = useState(12514);
  const [offlineUsers, setOfflineUsers] = useState(1625104);

  // Çevrimiçi kullanıcı sayısını dinamik olarak güncelle
  useEffect(() => {
    const interval = setInterval(() => {
      // Çevrimiçi kullanıcılar: 10,000 - 15,000 arası (daha yavaş değişim)
      setOnlineUsers(prev => {
        const change = Math.floor(Math.random() * 50) - 25; // -25 ile +25 arası değişim
        const newValue = prev + change;
        return Math.max(10000, Math.min(15000, newValue));
      });

      // Çevrimdışı kullanıcılar: 1,600,000 - 1,650,000 arası (daha yavaş değişim)
      setOfflineUsers(prev => {
        const change = Math.floor(Math.random() * 500) - 250; // -250 ile +250 arası değişim
        const newValue = prev + change;
        return Math.max(1600000, Math.min(1650000, newValue));
      });
    }, 15000); // Her 15 saniyede bir güncelle (daha yavaş)

    return () => clearInterval(interval);
  }, []);

  const texts = {
    tr: {
      online: 'Çevrimiçi',
      offline: 'Çevrimdışı',
    },
    en: {
      online: 'Online',
      offline: 'Offline',
    },
  };

  const t = texts[language];

  return (
    <div className="bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-3 shadow-lg">
      {/* Compact Stats */}
      <div className="flex items-center justify-between space-x-3">
        {/* Online Users */}
        <div className="flex items-center space-x-1.5 flex-1 min-w-0">
          <span className="flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <div className="flex items-center space-x-1 min-w-0">
            <span className="text-gray-400 text-xs whitespace-nowrap">{t.online}:</span>
            <span className="text-buy font-bold text-xs whitespace-nowrap">
              {onlineUsers.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-crypto-dark-500 flex-shrink-0"></div>

        {/* Offline Users */}
        <div className="flex items-center space-x-1.5 flex-1 min-w-0">
          <span className="flex h-2 w-2 flex-shrink-0">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
          </span>
          <div className="flex items-center space-x-1 min-w-0">
            <span className="text-gray-400 text-xs whitespace-nowrap">{t.offline}:</span>
            <span className="text-white font-bold text-xs whitespace-nowrap">
              {offlineUsers.toLocaleString('en-US')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
