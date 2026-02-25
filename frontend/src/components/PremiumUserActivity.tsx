import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface UserActivity {
  id: number;
  username: string;
  investment: number;
  duration: string;
  profit: number;
  profitPercent: number;
  date: string;
}

export const PremiumUserActivity: React.FC = () => {
  const { language } = useLanguage();
  const [activities, setActivities] = useState<UserActivity[]>([]);

  const maskUsername = (name: string) => {
    if (name.length <= 3) return name;
    const firstPart = name.substring(0, 2);
    const lastPart = name.substring(name.length - 1);
    return `${firstPart}****${lastPart}`;
  };

  const generateRandomActivity = (): UserActivity => {
    // Global names from different countries
    const names = [
      // USA
      'Michael', 'James', 'Robert', 'Jennifer', 'Sarah', 'David',
      // UK
      'Oliver', 'George', 'Harry', 'Emily', 'Sophie', 'Jack',
      // Russia
      'Dmitry', 'Alexei', 'Vladimir', 'Natasha', 'Olga', 'Ivan',
      // China
      'Wei', 'Chen', 'Li', 'Wang', 'Zhang', 'Liu',
      // Dubai/UAE
      'Ahmed', 'Mohammed', 'Fatima', 'Hassan', 'Aisha', 'Omar',
      // Germany
      'Hans', 'Klaus', 'Anna', 'Emma', 'Lukas', 'Felix',
      // France
      'Pierre', 'Jean', 'Marie', 'Sophie', 'Lucas', 'Emma',
      // Japan
      'Takeshi', 'Yuki', 'Hiroshi', 'Sakura', 'Kenji', 'Akira',
      // Brazil
      'Carlos', 'Pedro', 'Maria', 'Ana', 'Lucas', 'Gabriel',
      // India
      'Raj', 'Amit', 'Priya', 'Sanjay', 'Deepak', 'Anita'
    ];
    const investments = [5000, 10000, 15000, 20000, 25000, 30000, 50000, 75000, 100000];
    const durations = ['2 gün', '5 gün', '1 hafta', '10 gün', '2 hafta', '3 hafta', '1 ay'];
    const durationsEn = ['2 days', '5 days', '1 week', '10 days', '2 weeks', '3 weeks', '1 month'];
    
    const investment = investments[Math.floor(Math.random() * investments.length)];
    
    // %15 ihtimalle zarar (stop-loss devreye girer)
    const isLoss = Math.random() < 0.15;
    
    let profitPercent: number;
    let profit: number;
    
    if (isLoss) {
      // Zarar durumunda: -%1 ile -%3 arası (stop-loss max %5'i korur)
      profitPercent = -(1 + Math.random() * 2);
      profit = investment * (profitPercent / 100);
    } else {
      // Kar durumunda: %3-%15 kar
      profitPercent = 3 + Math.random() * 12;
      profit = investment * (profitPercent / 100);
    }
    
    // Son 30 gün içinde rastgele tarih
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    return {
      id: Date.now() + Math.random(),
      username: maskUsername(names[Math.floor(Math.random() * names.length)]),
      investment,
      duration: language === 'tr' ? durations[Math.floor(Math.random() * durations.length)] : durationsEn[Math.floor(Math.random() * durationsEn.length)],
      profit,
      profitPercent,
      date: date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short' }),
    };
  };

  useEffect(() => {
    // İlk aktiviteleri oluştur
    const initialActivities = Array.from({ length: 5 }, () => generateRandomActivity());
    setActivities(initialActivities);

    // Her 20 saniyede bir yeni aktivite ekle
    const activityInterval = setInterval(() => {
      const newActivity = generateRandomActivity();
      setActivities(prev => [newActivity, ...prev].slice(0, 10)); // Son 10 aktiviteyi tut
    }, 20000);

    return () => clearInterval(activityInterval);
  }, [language]);

  const texts = {
    tr: {
      title: 'Premium Kullanıcı Aktiviteleri',
      subtitle: 'Gerçek kullanıcı kazançları',
      investment: 'Yatırım',
      duration: 'Süre',
      profit: 'Kazanç',
      noActivity: 'Henüz aktivite yok',
    },
    en: {
      title: 'Premium User Activities',
      subtitle: 'Real user profits',
      investment: 'Investment',
      duration: 'Duration',
      profit: 'Profit',
      noActivity: 'No activity yet',
    },
  };

  const t = texts[language];

  return (
    <div className="bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-4 shadow-xl mt-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white flex items-center">
          <span className="mr-2">👥</span>
          {t.title}
        </h3>
        <p className="text-gray-400 text-xs mt-1">{t.subtitle}</p>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">{t.noActivity}</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={activity.id}
              className="bg-crypto-dark-700 rounded-lg p-3 border border-crypto-dark-500 hover:border-buy/50 transition-all animate-fadeIn"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crypto-yellow-500 to-crypto-yellow-600 flex items-center justify-center">
                    <span className="text-crypto-dark-900 text-xs font-bold">
                      {activity.username.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{activity.username}</p>
                    <p className="text-gray-500 text-xs">{activity.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-crypto-yellow-500">⭐</span>
                  <span className="text-xs text-gray-400">Premium</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">{t.investment}</p>
                  <p className="text-white font-semibold">
                    ${activity.investment.toLocaleString('en-US')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">{t.duration}</p>
                  <p className="text-white font-semibold">{activity.duration}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t.profit}</p>
                  <p className={`font-semibold ${activity.profit >= 0 ? 'text-buy' : 'text-sell'}`}>
                    {activity.profit >= 0 ? '+' : ''}${Math.abs(activity.profit).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-crypto-dark-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {activity.profit >= 0 ? (language === 'tr' ? 'Kar Oranı' : 'Profit Rate') : (language === 'tr' ? '🛡️ Stop-Loss Aktif' : '🛡️ Stop-Loss Active')}
                  </span>
                  <span className={`text-xs font-bold ${activity.profit >= 0 ? 'text-buy' : 'text-sell'}`}>
                    {activity.profit >= 0 ? '+' : ''}{activity.profitPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1d29;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2b3139;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3a4149;
        }
      `}</style>
    </div>
  );
};
