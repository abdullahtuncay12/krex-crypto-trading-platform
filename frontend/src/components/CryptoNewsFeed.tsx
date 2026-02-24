import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface NewsItem {
  id: number;
  title: string;
  description: string;
  time: string;
  type: 'news' | 'data' | 'analysis';
  icon: string;
}

export const CryptoNewsFeed: React.FC = () => {
  const { language } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);

  const newsTemplates = {
    tr: [
      { title: 'BTC Hacim Artışı', description: '24 saatlik işlem hacmi %12 arttı', type: 'data' as const, icon: '📊' },
      { title: 'Piyasa Analizi', description: 'Teknik göstergeler yükseliş sinyali veriyor', type: 'analysis' as const, icon: '📈' },
      { title: 'Whale Hareketi', description: 'Büyük cüzdan 500 BTC transfer etti', type: 'news' as const, icon: '🐋' },
      { title: 'RSI Göstergesi', description: 'RSI 65 seviyesinde, momentum güçlü', type: 'data' as const, icon: '⚡' },
      { title: 'Destek Seviyesi', description: '$64,000 güçlü destek noktası', type: 'analysis' as const, icon: '🎯' },
      { title: 'Hacim Patlaması', description: 'Son 1 saatte hacim 2 katına çıktı', type: 'data' as const, icon: '💥' },
      { title: 'Trend Analizi', description: 'Kısa vadeli trend yukarı yönlü', type: 'analysis' as const, icon: '🔥' },
      { title: 'Market Cap', description: 'BTC dominansı %52.3\'e yükseldi', type: 'data' as const, icon: '👑' },
      { title: 'Volatilite', description: 'Düşük volatilite, sakin piyasa', type: 'data' as const, icon: '🌊' },
      { title: 'MACD Sinyali', description: 'MACD pozitif kesişim yaptı', type: 'analysis' as const, icon: '✨' },
      { title: 'Alım Baskısı', description: 'Alım emirleri satış emirlerini geçti', type: 'data' as const, icon: '🟢' },
      { title: 'Fibonacci', description: '0.618 Fibonacci seviyesinde', type: 'analysis' as const, icon: '📐' },
      { title: 'Bollinger Bands', description: 'Fiyat üst banda yaklaşıyor', type: 'data' as const, icon: '📏' },
      { title: 'Volume Profile', description: 'Yüksek hacimli bölgede işlem görüyor', type: 'analysis' as const, icon: '🎚️' },
      { title: 'Market Sentiment', description: 'Piyasa duyarlılığı pozitif', type: 'data' as const, icon: '😊' },
    ],
    en: [
      { title: 'BTC Volume Surge', description: '24h trading volume up 12%', type: 'data' as const, icon: '📊' },
      { title: 'Market Analysis', description: 'Technical indicators show bullish signal', type: 'analysis' as const, icon: '📈' },
      { title: 'Whale Movement', description: 'Large wallet transferred 500 BTC', type: 'news' as const, icon: '🐋' },
      { title: 'RSI Indicator', description: 'RSI at 65, strong momentum', type: 'data' as const, icon: '⚡' },
      { title: 'Support Level', description: '$64,000 strong support point', type: 'analysis' as const, icon: '🎯' },
      { title: 'Volume Explosion', description: 'Volume doubled in last hour', type: 'data' as const, icon: '💥' },
      { title: 'Trend Analysis', description: 'Short-term trend is upward', type: 'analysis' as const, icon: '🔥' },
      { title: 'Market Cap', description: 'BTC dominance rose to 52.3%', type: 'data' as const, icon: '👑' },
      { title: 'Volatility', description: 'Low volatility, calm market', type: 'data' as const, icon: '🌊' },
      { title: 'MACD Signal', description: 'MACD made positive crossover', type: 'analysis' as const, icon: '✨' },
      { title: 'Buy Pressure', description: 'Buy orders exceed sell orders', type: 'data' as const, icon: '🟢' },
      { title: 'Fibonacci', description: 'At 0.618 Fibonacci level', type: 'analysis' as const, icon: '📐' },
      { title: 'Bollinger Bands', description: 'Price approaching upper band', type: 'data' as const, icon: '📏' },
      { title: 'Volume Profile', description: 'Trading in high volume area', type: 'analysis' as const, icon: '🎚️' },
      { title: 'Market Sentiment', description: 'Market sentiment is positive', type: 'data' as const, icon: '😊' },
    ],
  };

  useEffect(() => {
    // İlk haberleri ekle
    const initialNews = newsTemplates[language].slice(0, 3).map((item, index) => ({
      ...item,
      id: Date.now() + index,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    }));
    setNews(initialNews);

    // Her 15 saniyede bir yeni haber ekle
    const newsInterval = setInterval(() => {
      const templates = newsTemplates[language];
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      
      const newItem: NewsItem = {
        ...randomTemplate,
        id: Date.now(),
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };

      setNews(prev => [newItem, ...prev].slice(0, 8)); // Son 8 haberi tut
    }, 15000);

    return () => clearInterval(newsInterval);
  }, [language]);

  const texts = {
    tr: {
      title: 'Piyasa Akışı',
      subtitle: 'Anlık haberler ve veriler',
      noNews: 'Haberler yükleniyor...',
    },
    en: {
      title: 'Market Feed',
      subtitle: 'Live news and data',
      noNews: 'Loading news...',
    },
  };

  const t = texts[language];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'news': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'data': return 'bg-crypto-yellow-500/20 text-crypto-yellow-500 border-crypto-yellow-500/30';
      case 'analysis': return 'bg-buy/20 text-buy border-buy/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      tr: { news: 'Haber', data: 'Veri', analysis: 'Analiz' },
      en: { news: 'News', data: 'Data', analysis: 'Analysis' },
    };
    return labels[language][type as keyof typeof labels.tr];
  };

  return (
    <div className="bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-4 shadow-xl">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white flex items-center">
          <span className="mr-2">📰</span>
          {t.title}
        </h3>
        <p className="text-gray-400 text-xs mt-1">{t.subtitle}</p>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
        {news.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">{t.noNews}</p>
          </div>
        ) : (
          news.map((item, index) => (
            <div
              key={item.id}
              className="bg-crypto-dark-700 rounded-lg p-3 border border-crypto-dark-500 hover:border-crypto-yellow-500/50 transition-all animate-fadeIn"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white text-sm font-semibold truncate">{item.title}</h4>
                    <span className="text-gray-500 text-xs flex-shrink-0 ml-2">{item.time}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-2 line-clamp-2">{item.description}</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs border ${getTypeColor(item.type)}`}>
                    {getTypeLabel(item.type)}
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
