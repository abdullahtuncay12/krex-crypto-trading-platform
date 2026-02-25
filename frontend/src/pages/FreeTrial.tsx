import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { CryptoNewsFeed } from '../components/CryptoNewsFeed';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DemoTrade {
  id: number;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  profit: number;
  timestamp: Date;
}

interface PricePoint {
  time: string;
  price: number;
}

export const FreeTrialPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [demoBalance, setDemoBalance] = useState(1000);
  const [initialBalance] = useState(1000);
  const [currentPrice, setCurrentPrice] = useState(65000);
  const [trades, setTrades] = useState<DemoTrade[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const currentPriceRef = useRef(currentPrice);

  // currentPrice ref'i güncelle
  useEffect(() => {
    currentPriceRef.current = currentPrice;
  }, [currentPrice]);

  // Gerçek BTC fiyatını çek
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        if (data.bitcoin?.usd) {
          setCurrentPrice(data.bitcoin.usd);
        }
      } catch (error) {
        console.error('Price fetch error:', error);
      }
    };
    fetchPrice();
    
    // Her 30 saniyede bir gerçek fiyatı güncelle
    const priceInterval = setInterval(fetchPrice, 30000);
    return () => clearInterval(priceInterval);
  }, []);

  // Simüle edilmiş fiyat değişimi (gerçek fiyat etrafında küçük dalgalanmalar)
  useEffect(() => {
    if (currentPrice === 0 || !isRunning) return;

    const priceInterval = setInterval(() => {
      setCurrentPrice(prev => {
        // Gerçek fiyat etrafında %0.05 dalgalanma
        const change = (Math.random() - 0.5) * (prev * 0.0005);
        const newPrice = prev + change;
        
        // Fiyat geçmişine ekle
        const now = new Date();
        const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setPriceHistory(prevHistory => {
          const newHistory = [...prevHistory, { time: timeStr, price: newPrice }];
          return newHistory.slice(-60); // Son 60 veriyi tut
        });
        
        return newPrice;
      });
    }, 1000); // 1 saniyede bir güncelle

    return () => clearInterval(priceInterval);
  }, [currentPrice, isRunning]);

  // Timer
  useEffect(() => {
    if (!isRunning) return;
    
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  // Demo trading simulation - Gerçekçi kar oranları ve arada zararlar
  const executeDemoTrade = useCallback(() => {
    const price = currentPriceRef.current;
    const tradeAmount = 100 + Math.random() * 200; // $100-300 arası
    
    // %20 ihtimalle zarar (stop-loss devreye girer)
    const isLoss = Math.random() < 0.2;
    
    let profit: number;
    if (isLoss) {
      // Stop-loss: -%0.05 ile -%0.15 arası küçük zarar
      const lossPercent = -(0.0005 + Math.random() * 0.001);
      profit = tradeAmount * lossPercent;
    } else {
      // Normal kar: %0.05-%0.1 arası (gerçekçi)
      const profitPercent = 0.0005 + Math.random() * 0.0005;
      profit = tradeAmount * profitPercent;
    }

    const newTrade: DemoTrade = {
      id: Date.now(),
      type: Math.random() > 0.5 ? 'BUY' : 'SELL',
      price: price,
      amount: tradeAmount / price,
      profit: profit,
      timestamp: new Date(),
    };

    setTrades(prev => [newTrade, ...prev].slice(0, 10));
    setTotalProfit(prev => prev + profit);
    setDemoBalance(prev => prev + profit);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    // İlk işlem 5 saniye sonra
    const firstTrade = setTimeout(() => {
      executeDemoTrade();
    }, 5000);

    // Sonraki işlemler 30 saniyede bir (daha gerçekçi)
    const tradeInterval = setInterval(() => {
      executeDemoTrade();
    }, 30000);

    return () => {
      clearTimeout(firstTrade);
      clearInterval(tradeInterval);
    };
  }, [isRunning, executeDemoTrade]);

  const startDemo = () => {
    setIsRunning(true);
    setElapsedTime(0);
    setTrades([]);
    setTotalProfit(0);
    setDemoBalance(initialBalance);
    setPriceHistory([]); // Grafik geçmişini sıfırla
  };

  const stopDemo = () => {
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const texts = {
    tr: {
      title: 'Ücretsiz Deneme',
      subtitle: 'Sistemi risk almadan test edin',
      demoBalance: 'Demo Bakiye',
      initialBalance: 'Başlangıç',
      currentBalance: 'Güncel Bakiye',
      totalProfit: 'Toplam Kar',
      profitPercent: 'Kar Oranı',
      elapsedTime: 'Geçen Süre',
      tradeCount: 'İşlem Sayısı',
      startDemo: 'Demo Başlat',
      stopDemo: 'Durdur',
      recentTrades: 'Son İşlemler',
      upgradeToPremium: 'Premium Üyeliğe Geç',
      demoInfo: 'Demo hesabınızla $1,000 sanal para ile botun nasıl çalıştığını test edebilirsiniz.',
      features: 'Demo Özellikleri',
      feature1: 'Gerçek BTC fiyatları',
      feature2: 'Otomatik alım-satım',
      feature3: '%1-2 kar hedefi',
      feature4: 'Risk almadan test',
      premiumBenefits: 'Premium Avantajları',
      benefit1: 'Gerçek para ile işlem',
      benefit2: 'Sınırsız yatırım',
      benefit3: 'Gelişmiş stratejiler',
      benefit4: '7/24 destek',
      noRisk: 'Risk Yok',
      realSimulation: 'Gerçek Simülasyon',
    },
    en: {
      title: 'Free Trial',
      subtitle: 'Test the system risk-free',
      demoBalance: 'Demo Balance',
      initialBalance: 'Initial',
      currentBalance: 'Current Balance',
      totalProfit: 'Total Profit',
      profitPercent: 'Profit %',
      elapsedTime: 'Elapsed Time',
      tradeCount: 'Trade Count',
      startDemo: 'Start Demo',
      stopDemo: 'Stop',
      recentTrades: 'Recent Trades',
      upgradeToPremium: 'Upgrade to Premium',
      demoInfo: 'Test how the bot works with $1,000 virtual money in your demo account.',
      features: 'Demo Features',
      feature1: 'Real BTC prices',
      feature2: 'Automatic trading',
      feature3: '1-2% profit target',
      feature4: 'Risk-free testing',
      premiumBenefits: 'Premium Benefits',
      benefit1: 'Real money trading',
      benefit2: 'Unlimited investment',
      benefit3: 'Advanced strategies',
      benefit4: '24/7 support',
      noRisk: 'No Risk',
      realSimulation: 'Real Simulation',
    },
  };

  const t = texts[language];

  // Chart.js konfigürasyonu
  const chartData = {
    labels: priceHistory.map(p => p.time),
    datasets: [
      {
        label: 'BTC/USD',
        data: priceHistory.map(p => p.price),
        borderColor: '#F0B90B',
        backgroundColor: 'rgba(240, 185, 11, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(23, 25, 35, 0.9)',
        titleColor: '#F0B90B',
        bodyColor: '#fff',
        borderColor: '#2B3139',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `$${context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(43, 49, 57, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#848E9C',
          maxTicksLimit: 6,
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(43, 49, 57, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#848E9C',
          callback: function(value: any) {
            return '$' + value.toLocaleString('en-US');
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <div className="min-h-screen bg-crypto-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-gray-400">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Demo Area - 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* Demo Info Card */}
            <div className="bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-crypto-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-crypto-dark-900" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{t.demoInfo}</h3>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-gray-300">{t.feature1}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-gray-300">{t.feature2}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-gray-300">{t.feature3}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-gray-300">{t.feature4}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-4">
                <p className="text-gray-400 text-xs mb-1">{t.currentBalance}</p>
                <p className="text-2xl font-bold text-white">
                  ${demoBalance.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t.initialBalance}: ${initialBalance}
                </p>
              </div>

              <div className="bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-4">
                <p className="text-gray-400 text-xs mb-1">{t.totalProfit}</p>
                <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-buy' : 'text-sell'}`}>
                  {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t.profitPercent}: {((totalProfit / initialBalance) * 100).toFixed(2)}%
                </p>
              </div>

              <div className="bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-4">
                <p className="text-gray-400 text-xs mb-1">{t.elapsedTime}</p>
                <p className="text-2xl font-bold text-crypto-yellow-500">
                  {formatTime(elapsedTime)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t.tradeCount}: {trades.length}
                </p>
              </div>

              <div className="bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-4">
                <p className="text-gray-400 text-xs mb-1">BTC/USD</p>
                <p className="text-2xl font-bold text-white">
                  ${currentPrice.toLocaleString('en-US')}
                </p>
                <p className="text-xs text-green-500 mt-1">{t.realSimulation}</p>
              </div>
            </div>

            {/* Control Button */}
            <div className="bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-6">
              {!isRunning ? (
                <button
                  onClick={startDemo}
                  className="w-full bg-crypto-yellow-500 hover:bg-crypto-yellow-600 text-crypto-dark-900 font-bold py-4 px-6 rounded-lg transition-colors text-lg"
                >
                  🚀 {t.startDemo}
                </button>
              ) : (
                <button
                  onClick={stopDemo}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
                >
                  ⏸️ {t.stopDemo}
                </button>
              )}
            </div>

            {/* Live Price Chart */}
            {isRunning && priceHistory.length > 0 && (
              <div className="bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-6">
                <h3 className="text-white font-semibold mb-4">
                  {language === 'tr' ? 'Canlı Fiyat Grafiği' : 'Live Price Chart'}
                </h3>
                <div className="h-64">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
            )}

            {/* Recent Trades */}
            <div className="bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-6">
              <h3 className="text-white font-semibold mb-4">{t.recentTrades}</h3>
              <div className="space-y-2">
                {trades.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">{language === 'tr' ? 'Henüz işlem yok. Demo başlatın!' : 'No trades yet. Start the demo!'}</p>
                ) : (
                  trades.map((trade) => (
                    <div
                      key={trade.id}
                      className={`flex items-center justify-between p-3 rounded bg-crypto-dark-700 border ${
                        trade.type === 'BUY' ? 'border-buy/30' : 'border-sell/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            trade.type === 'BUY' ? 'bg-buy/20 text-buy' : 'bg-sell/20 text-sell'
                          }`}
                        >
                          {trade.type}
                        </span>
                        <div>
                          <p className="text-white text-sm">${trade.price.toLocaleString('en-US')}</p>
                          <p className="text-gray-400 text-xs">{trade.amount.toFixed(6)} BTC</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${trade.profit >= 0 ? 'text-buy' : 'text-sell'}`}>
                          {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                        </p>
                        {trade.profit < 0 && (
                          <p className="text-xs text-yellow-500">🛡️ Stop-Loss</p>
                        )}
                        <p className="text-gray-500 text-xs">{trade.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Premium Upgrade Card */}
              <div className="bg-gradient-to-br from-crypto-yellow-600 to-crypto-yellow-500 rounded-lg p-6 text-crypto-dark-900">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-crypto-dark-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-crypto-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{t.upgradeToPremium}</h3>
                  <p className="text-sm opacity-90">{language === 'tr' ? 'Gerçek para ile kazanmaya başlayın' : 'Start earning with real money'}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{t.benefit1}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{t.benefit2}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{t.benefit3}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{t.benefit4}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-crypto-dark-900 hover:bg-crypto-dark-800 text-crypto-yellow-500 font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {language === 'tr' ? 'Hemen Başla →' : 'Get Started →'}
                </button>
              </div>

              {/* Crypto News Feed */}
              <CryptoNewsFeed />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
