import React, { useState, useEffect } from 'react';
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
        // Gerçek fiyat etrafında %0.05 dalgalanma (daha küçük)
        const change = (Math.random() - 0.5) * (prev * 0.0005);
        const newPrice = prev + change;
        
        // Fiyat geçmişine ekle
        const now = new Date();
        const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setPriceHistory(prevHistory => {
          const newHistory = [...prevHistory, { time: timeStr, price: newPrice }];
          return newHistory.slice(-60); // Son 60 veriyi tut (daha fazla)
        });
        
        return newPrice;
      });
    }, 1000); // 1 saniyede bir güncelle (daha akıcı)

    return () => clearInterval(priceInterval);
  }, [currentPrice]);

  // Simüle edilmiş bot işlemleri - GARANTİLİ 1 DAKİKADA 1 İŞLEM
  useEffect(() => {
    if (currentPrice === 0) return;

    let tradeCounter = 0;

    // İlk işlemi 5 saniye sonra yap
    const initialTimeout = setTimeout(() => {
      setCurrentPrice(prevPrice => {
        if (prevPrice > 0) {
          // İlk ALIŞ işlemi
          setBotStatus('buying');
          setTimeout(() => {
            const investAmount = 2000 + Math.random() * 3000;
            const btcAmount = investAmount / prevPrice;
            
            const newTrade: Trade = {
              id: Date.now(),
              type: 'BUY',
              price: prevPrice,
              amount: btcAmount,
              timestamp: new Date(),
            };
            
            setOpenPosition(newTrade);
            setTrades(prev => [newTrade, ...prev].slice(0, 5));
            setTradeCount(prev => prev + 1);
            setPriceHistory(prev => {
              setTradeMarkers(markers => [...markers, { x: prev.length - 1, y: prevPrice, type: 'BUY' }]);
              return prev;
            });
            setBotStatus('waiting');
          }, 500);
        }
        return prevPrice;
      });
    }, 5000);

    // Her 60 saniyede bir işlem yap (1 dakika)
    const tradeInterval = setInterval(() => {
      tradeCounter++;
      
      setOpenPosition(prevPosition => {
        setCurrentPrice(prevPrice => {
          if (prevPrice === 0) return prevPrice;

          if (!prevPosition) {
            // Pozisyon yoksa AL
            setBotStatus('buying');
            setTimeout(() => {
              const investAmount = 2000 + Math.random() * 3000;
              const btcAmount = investAmount / prevPrice;
              
              const newTrade: Trade = {
                id: Date.now(),
                type: 'BUY',
                price: prevPrice,
                amount: btcAmount,
                timestamp: new Date(),
              };
              
              setOpenPosition(newTrade);
              setTrades(prev => [newTrade, ...prev].slice(0, 5));
              setTradeCount(prev => prev + 1);
              setPriceHistory(prev => {
                setTradeMarkers(markers => [...markers, { x: prev.length - 1, y: prevPrice, type: 'BUY' }]);
                return prev;
              });
              setBotStatus('waiting');
            }, 500);
          } else {
            // Pozisyon varsa SAT
            setBotStatus('selling');
            setTimeout(() => {
              // %20 ihtimalle zarar (stop-loss devreye girer)
              const isLoss = Math.random() < 0.2;
              
              let profit: number;
              if (isLoss) {
                // Stop-loss: -%1 ile -%3 arası küçük zarar
                const lossPercent = -(1 + Math.random() * 2) / 100;
                profit = prevPosition.price * prevPosition.amount * lossPercent;
              } else {
                // Normal kar: Minimum $10-30 kar
                const potentialProfit = (prevPrice - prevPosition.price) * prevPosition.amount;
                profit = Math.max(potentialProfit, 10 + Math.random() * 20);
              }
              
              const newTrade: Trade = {
                id: Date.now(),
                type: 'SELL',
                price: prevPrice,
                amount: prevPosition.amount,
                profit: profit,
                timestamp: new Date(),
              };
              
              setTrades(prev => [newTrade, ...prev].slice(0, 5));
              setTotalProfit(prev => prev + profit);
              setCurrentValue(prev => prev + profit);
              setTradeCount(prev => prev + 1);
              setOpenPosition(null);
              setPriceHistory(prev => {
                setTradeMarkers(markers => [...markers, { x: prev.length - 1, y: prevPrice, type: 'SELL' }]);
                return prev;
              });
              setBotStatus('waiting');
            }, 500);
          }
          
          return prevPrice;
        });
        return prevPosition;
      });
    }, 60000); // 60 saniye = 1 dakika

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(tradeInterval);
    };
  }, [currentPrice === 0]);

  const texts: Record<string, {
    title: string;
    subtitle: string;
    currentPrice: string;
    botStatus: string;
    totalProfit: string;
    tradeCount: string;
    initialInvestment: string;
    currentValue: string;
    runningTime: string;
    profitPercentage: string;
    recentTrades: string;
    type: string;
    price: string;
    amount: string;
    profit: string;
    time: string;
    analyzing: string;
    buying: string;
    selling: string;
    waiting: string;
    demoNote: string;
  }> = {
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
    ru: {
      title: 'Живая Торговля',
      subtitle: 'Наблюдайте за торговлей бота в реальном времени',
      currentPrice: 'Текущая Цена',
      botStatus: 'Статус Бота',
      totalProfit: 'Общая Прибыль',
      tradeCount: 'Количество Сделок',
      initialInvestment: 'Начальная Инвестиция',
      currentValue: 'Текущая Стоимость',
      runningTime: 'Время Работы',
      profitPercentage: 'Процент Прибыли',
      recentTrades: 'Последние Сделки',
      type: 'Тип',
      price: 'Цена',
      amount: 'Количество',
      profit: 'Прибыль/Убыток',
      time: 'Время',
      analyzing: '📊 Анализ Рынка...',
      buying: '🟢 Размещение Ордера на Покупку...',
      selling: '🔴 Размещение Ордера на Продажу...',
      waiting: '⏳ Ожидание Сигнала...',
      demoNote: '* Это демонстрационная симуляция. Используется реальная цена BTC, но сделки симулированы.',
    },
    ja: {
      title: 'ライブトレーディング',
      subtitle: 'ボットのリアルタイム取引を見る',
      currentPrice: '現在価格',
      botStatus: 'ボットステータス',
      totalProfit: '総利益',
      tradeCount: '取引数',
      initialInvestment: '初期投資',
      currentValue: '現在価値',
      runningTime: '稼働時間',
      profitPercentage: '利益率',
      recentTrades: '最近の取引',
      type: 'タイプ',
      price: '価格',
      amount: '数量',
      profit: '損益',
      time: '時間',
      analyzing: '📊 市場分析中...',
      buying: '🟢 買い注文中...',
      selling: '🔴 売り注文中...',
      waiting: '⏳ シグナル待機中...',
      demoNote: '* これはデモシミュレーションです。実際のBTC価格を使用していますが、取引はシミュレートされています。',
    },
    de: {
      title: 'Live-Trading',
      subtitle: 'Beobachten Sie den Bot beim Handeln in Echtzeit',
      currentPrice: 'Aktueller Preis',
      botStatus: 'Bot-Status',
      totalProfit: 'Gesamtgewinn',
      tradeCount: 'Anzahl der Trades',
      initialInvestment: 'Anfangsinvestition',
      currentValue: 'Aktueller Wert',
      runningTime: 'Laufzeit',
      profitPercentage: 'Gewinn %',
      recentTrades: 'Letzte Trades',
      type: 'Typ',
      price: 'Preis',
      amount: 'Menge',
      profit: 'Gewinn/Verlust',
      time: 'Zeit',
      analyzing: '📊 Marktanalyse...',
      buying: '🟢 Kauforder wird platziert...',
      selling: '🔴 Verkaufsorder wird platziert...',
      waiting: '⏳ Warten auf Signal...',
      demoNote: '* Dies ist eine Demo-Simulation. Der echte BTC-Preis wird verwendet, aber die Trades sind simuliert.',
    },
  };

  const t = texts[language] || texts.en;

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
        <h3 className="text-white font-semibold mb-4">{t.title === 'Canlı Trading' ? 'Canlı Fiyat Grafiği' : t.title === 'Живая Торговля' ? 'График Цены в Реальном Времени' : t.title === 'ライブトレーディング' ? 'ライブ価格チャート' : t.title === 'Live-Trading' ? 'Live-Preisdiagramm' : 'Live Price Chart'}</h3>
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
              <p className="text-gray-500">{t.title === 'Canlı Trading' ? 'Veri yükleniyor...' : t.title === 'Живая Торговля' ? 'Загрузка данных...' : t.title === 'ライブトレーディング' ? 'データ読み込み中...' : t.title === 'Live-Trading' ? 'Daten werden geladen...' : 'Loading data...'}</p>
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
                    <>
                      <p
                        className={`text-sm font-semibold ${
                          trade.profit >= 0 ? 'text-buy' : 'text-sell'
                        }`}
                      >
                        {trade.profit >= 0 ? '+' : ''}
                        ${trade.profit.toFixed(2)}
                      </p>
                      {trade.profit < 0 && (
                        <p className="text-xs text-yellow-500 mt-1">
                          🛡️ Stop-Loss
                        </p>
                      )}
                    </>
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
