import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
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

interface Trade {
  id: number;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  profit?: number;
  timestamp: Date;
}

interface PricePoint {
  time: string;
  price: number;
  tradeType?: 'BUY' | 'SELL';
}

export const LiveTradingDemo: React.FC = () => {
  const { language } = useLanguage();
  const [currentPrice, setCurrentPrice] = useState(0);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [botStatus, setBotStatus] = useState<'analyzing' | 'buying' | 'selling' | 'waiting'>('analyzing');
  const [totalProfit, setTotalProfit] = useState(0);
  const [tradeCount, setTradeCount] = useState(0);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [tradeMarkers, setTradeMarkers] = useState<{ x: number; y: number; type: 'BUY' | 'SELL' }[]>([]);
  const [initialInvestment] = useState(10000); // $10,000 başlangıç yatırımı
  const [currentValue, setCurrentValue] = useState(10000);
  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [openPosition, setOpenPosition] = useState<Trade | null>(null);

  // Gerçek BTC fiyatını çek
  useEffect(() => {
    const fetchRealPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        if (data.bitcoin && data.bitcoin.usd) {
          setCurrentPrice(data.bitcoin.usd);
        }
      } catch (error) {
        console.error('Failed to fetch BTC price:', error);
        setCurrentPrice(64692.46); // Fallback fiyat
      }
    };

    fetchRealPrice();
    const priceInterval = setInterval(fetchRealPrice, 30000); // Her 30 saniyede bir güncelle

    return () => clearInterval(priceInterval);
  }, []);

  // Geçen süreyi hesapla
  useEffect(() => {
    const timeInterval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [startTime]);

  // Simüle edilmiş fiyat değişimi (gerçek fiyat etrafında küçük dalgalanmalar)
  useEffect(() => {
    if (currentPrice === 0) return;

    const priceInterval = setInterval(() => {
      setCurrentPrice(prev => {
        // Gerçek fiyat etrafında %0.1 dalgalanma
        const change = (Math.random() - 0.5) * (prev * 0.001);
        const newPrice = prev + change;
        
        // Fiyat geçmişine ekle
        const now = new Date();
        const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setPriceHistory(prevHistory => {
          const newHistory = [...prevHistory, { time: timeStr, price: newPrice }];
          return newHistory.slice(-30); // Son 30 veriyi tut
        });
        
        return newPrice;
      });
    }, 3000);

    return () => clearInterval(priceInterval);
  }, [currentPrice]);

  // Simüle edilmiş bot işlemleri - Kar odaklı ve daha sık
  useEffect(() => {
    if (currentPrice === 0 || priceHistory.length < 3) return;

    const tradeInterval = setInterval(() => {
      const random = Math.random();
      
      // Açık pozisyon yoksa ve şans varsa AL (daha sık)
      if (!openPosition && random > 0.5) {
        setBotStatus('buying');
        setTimeout(() => {
          const investAmount = 1000 + Math.random() * 2000; // $1000-$3000 arası yatırım
          const btcAmount = investAmount / currentPrice;
          
          const newTrade: Trade = {
            id: Date.now(),
            type: 'BUY',
            price: currentPrice,
            amount: btcAmount,
            timestamp: new Date(),
          };
          
          setOpenPosition(newTrade);
          setTrades(prev => [newTrade, ...prev].slice(0, 5));
          setTradeCount(prev => prev + 1);
          
          // Grafik üzerinde işaret ekle
          setTradeMarkers(prev => [...prev, { x: priceHistory.length - 1, y: currentPrice, type: 'BUY' }]);
          
          setBotStatus('waiting');
        }, 800);
      } 
      // Açık pozisyon varsa ve küçük kar varsa SAT
      else if (openPosition && random < 0.5) {
        const potentialProfit = (currentPrice - openPosition.price) * openPosition.amount;
        const profitPercentage = (potentialProfit / (openPosition.price * openPosition.amount)) * 100;
        
        // En az %0.2 kar varsa sat (daha düşük eşik)
        if (profitPercentage > 0.2) {
          setBotStatus('selling');
          setTimeout(() => {
            const profit = potentialProfit;
            const newTrade: Trade = {
              id: Date.now(),
              type: 'SELL',
              price: currentPrice,
              amount: openPosition.amount,
              profit: profit,
              timestamp: new Date(),
            };
            
            setTrades(prev => [newTrade, ...prev].slice(0, 5));
            setTotalProfit(prev => prev + profit);
            setCurrentValue(prev => prev + profit);
            setTradeCount(prev => prev + 1);
            setOpenPosition(null);
            
            // Grafik üzerinde işaret ekle
            setTradeMarkers(prev => [...prev, { x: priceHistory.length - 1, y: currentPrice, type: 'SELL' }]);
            
            setBotStatus('waiting');
          }, 800);
        } else {
          setBotStatus('analyzing');
        }
      } else {
        setBotStatus('analyzing');
      }
    }, 4000); // 4 saniyede bir kontrol et (daha sık)

    return () => clearInterval(tradeInterval);
  }, [currentPrice, openPosition, priceHistory.length]);

  const texts = {
    tr: {
      title: 'Canlı Trading',
      subtitle: 'Botun gerçek zamanlı işlemlerini izleyin',
      currentPrice: 'Anlık Fiyat',
      botStatus: 'Bot Durumu',
      totalProfit: 'Toplam Kar',
      tradeCount: 'İşlem Sayısı',
      initialInvestment: 'Başlangıç Yatırımı',
      currentValue: 'Güncel Değer',
      runningTime: 'Çalışma Süresi',
      profitPercentage: 'Kar Oranı',
      recentTrades: 'Son İşlemler',
      type: 'Tür',
      price: 'Fiyat',
      amount: 'Miktar',
      profit: 'Kar/Zarar',
      time: 'Zaman',
      analyzing: '📊 Piyasa Analiz Ediliyor...',
      buying: '🟢 ALIŞ Emri Veriliyor...',
      selling: '🔴 SATIŞ Emri Veriliyor...',
      waiting: '⏳ Sinyal Bekleniyor...',
      demoNote: '* Bu bir demo simülasyonudur. Gerçek BTC fiyatı kullanılmaktadır ancak işlemler simüledir.',
    },
    en: {
      title: 'Live Trading',
      subtitle: 'Watch the bot trade in real-time',
      currentPrice: 'Current Price',
      botStatus: 'Bot Status',
      totalProfit: 'Total Profit',
      tradeCount: 'Trade Count',
      initialInvestment: 'Initial Investment',
      currentValue: 'Current Value',
      runningTime: 'Running Time',
      profitPercentage: 'Profit %',
      recentTrades: 'Recent Trades',
      type: 'Type',
      price: 'Price',
      amount: 'Amount',
      profit: 'Profit/Loss',
      time: 'Time',
      analyzing: '📊 Analyzing Market...',
      buying: '🟢 Placing BUY Order...',
      selling: '🔴 Placing SELL Order...',
      waiting: '⏳ Waiting for Signal...',
      demoNote: '* This is a demo simulation. Real BTC price is used but trades are simulated.',
    },
  };

  const t = texts[language];

  const getStatusText = () => {
    switch (botStatus) {
      case 'analyzing': return t.analyzing;
      case 'buying': return t.buying;
      case 'selling': return t.selling;
      case 'waiting': return t.waiting;
    }
  };

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
    <div className="bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-6 shadow-xl">
      {/* Header with LIVE indicator */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{t.title}</h2>
            <p className="text-gray-400 text-sm">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-crypto-dark-700 rounded-lg p-4 border border-crypto-dark-500">
          <p className="text-gray-400 text-xs mb-1">{t.currentPrice}</p>
          <p className="text-2xl font-bold text-crypto-yellow-500">
            ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">BTC/USD</p>
        </div>

        <div className="bg-crypto-dark-700 rounded-lg p-4 border border-crypto-dark-500">
          <p className="text-gray-400 text-xs mb-1">{t.initialInvestment}</p>
          <p className="text-xl font-bold text-white">
            ${initialInvestment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">{t.runningTime}: {elapsedTime}</p>
        </div>

        <div className="bg-crypto-dark-700 rounded-lg p-4 border border-crypto-dark-500">
          <p className="text-gray-400 text-xs mb-1">{t.currentValue}</p>
          <p className="text-xl font-bold text-white">
            ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-xs mt-1 ${totalProfit >= 0 ? 'text-buy' : 'text-sell'}`}>
            {t.profitPercentage}: {((totalProfit / initialInvestment) * 100).toFixed(2)}%
          </p>
        </div>

        <div className="bg-crypto-dark-700 rounded-lg p-4 border border-crypto-dark-500">
          <p className="text-gray-400 text-xs mb-1">{t.totalProfit}</p>
          <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-buy' : 'text-sell'}`}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">{t.tradeCount}: {tradeCount}</p>
        </div>
      </div>

      {/* Bot Status */}
      <div className="bg-crypto-dark-700 rounded-lg p-4 border border-crypto-dark-500 mb-6">
        <p className="text-sm font-semibold text-white animate-pulse">
          {getStatusText()}
        </p>
      </div>

      {/* Live Price Chart */}
      <div className="bg-crypto-dark-700 rounded-lg p-4 border border-crypto-dark-500 mb-6 relative">
        <h3 className="text-white font-semibold mb-4">{language === 'tr' ? 'Canlı Fiyat Grafiği' : 'Live Price Chart'}</h3>
        <div className="h-64 relative">
          {priceHistory.length > 0 ? (
            <>
              <Line data={chartData} options={chartOptions} />
              {/* Trade Markers */}
              {tradeMarkers.slice(-10).map((marker, index) => (
                <div
                  key={index}
                  className={`absolute animate-ping-once ${
                    marker.type === 'BUY' ? 'bg-buy' : 'bg-sell'
                  }`}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    left: `${(marker.x / priceHistory.length) * 100}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.8,
                    boxShadow: `0 0 10px ${marker.type === 'BUY' ? '#0ECB81' : '#F6465D'}`,
                  }}
                />
              ))}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">{language === 'tr' ? 'Veri yükleniyor...' : 'Loading data...'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Trades */}
      <div className="bg-crypto-dark-700 rounded-lg p-4 border border-crypto-dark-500">
        <h3 className="text-white font-semibold mb-4">{t.recentTrades}</h3>
        <div className="space-y-2">
          {trades.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">{t.waiting}</p>
          ) : (
            trades.map((trade, index) => (
              <div
                key={trade.id}
                className={`flex items-center justify-between p-3 rounded bg-crypto-dark-600 border ${
                  trade.type === 'BUY' ? 'border-buy/30' : 'border-sell/30'
                } animate-fadeIn`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      trade.type === 'BUY'
                        ? 'bg-buy/20 text-buy'
                        : 'bg-sell/20 text-sell'
                    }`}
                  >
                    {trade.type}
                  </span>
                  <div>
                    <p className="text-white text-sm font-medium">
                      ${trade.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {trade.amount.toFixed(4)} BTC
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {trade.profit !== undefined && (
                    <p
                      className={`text-sm font-semibold ${
                        trade.profit >= 0 ? 'text-buy' : 'text-sell'
                      }`}
                    >
                      {trade.profit >= 0 ? '+' : ''}
                      ${trade.profit.toFixed(2)}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs">
                    {trade.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Demo Note */}
      <p className="text-gray-500 text-xs mt-4 text-center italic">{t.demoNote}</p>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes ping-once {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
          }
        }
        .animate-ping-once {
          animation: ping-once 1s ease-out;
        }
      `}</style>
    </div>
  );
};
