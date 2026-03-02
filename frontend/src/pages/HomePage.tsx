import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useLanguage } from '../contexts/LanguageContext';
import { CryptoSelector, Cryptocurrency } from '../components/CryptoSelector';
import { SignalDisplay, TradingSignal } from '../components/SignalDisplay';
import { HistoricalChart } from '../components/HistoricalChart';
import { PerformanceDisplay } from '../components/PerformanceDisplay';
import { CryptoNewsFeed } from '../components/CryptoNewsFeed';
import { PremiumUserActivity } from '../components/PremiumUserActivity';
import { LiveTradingDemo } from '../components/LiveTradingDemo';
import { LiveUserStats } from '../components/LiveUserStats';
import { signalAPI } from '../api/client';

export const HomePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { language } = useLanguage();
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null);
  const [signal, setSignal] = useState<TradingSignal | null>(null);
  const [loadingSignal, setLoadingSignal] = useState(false);
  const [signalError, setSignalError] = useState<string | null>(null);

  const userRole = user?.role || 'normal';

  // Fetch signal when cryptocurrency is selected
  useEffect(() => {
    if (!selectedCrypto) {
      setSignal(null);
      return;
    }

    const fetchSignal = async () => {
      try {
        setLoadingSignal(true);
        setSignalError(null);
        const response = await signalAPI.getSignal(selectedCrypto.symbol);
        
        // Convert timestamp string to Date object
        const signalData = {
          ...response.data.signal,
          timestamp: new Date(response.data.signal.timestamp),
        };
        
        setSignal(signalData);
      } catch (err: any) {
        setSignalError(err.response?.data?.error?.message || 'Failed to load signal');
        setSignal(null);
      } finally {
        setLoadingSignal(false);
      }
    };

    fetchSignal();
  }, [selectedCrypto]);

  const handleCryptoSelect = (crypto: Cryptocurrency) => {
    setSelectedCrypto(crypto);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-crypto-dark-800/80 dark:backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-crypto-dark-500/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white tracking-tight">Crypto Trading Signals</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                Real-time trading recommendations and market analysis
              </p>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <div className="flex items-center justify-end space-x-1">
                    {userRole === 'premium' && (
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                    <span className={`text-xs font-semibold ${userRole === 'premium' ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'}`}>
                      {userRole === 'premium' ? 'Premium' : 'Normal'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Upgrade Banner - Only for Normal Users */}
        {user && userRole === 'normal' && (
          <div className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <h3 className="text-2xl font-bold">
                    {language === 'tr' ? 'Premium\'a Yükselt!' : language === 'ru' ? 'Обновите до Premium!' : language === 'ja' ? 'プレミアムにアップグレード!' : language === 'de' ? 'Auf Premium upgraden!' : 'Upgrade to Premium!'}
                  </h3>
                </div>
                <p className="text-white/90 text-lg">
                  {language === 'tr' ? 'Gelişmiş AI bot, sınırsız sinyal ve daha fazlası...' : language === 'ru' ? 'Продвинутый AI бот, неограниченные сигналы и многое другое...' : language === 'ja' ? '高度なAIボット、無制限のシグナルなど...' : language === 'de' ? 'Fortgeschrittener AI-Bot, unbegrenzte Signale und mehr...' : 'Advanced AI bot, unlimited signals and more...'}
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-1">
                    <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{language === 'tr' ? 'Sınırsız Sinyal' : language === 'ru' ? 'Неограниченные Сигналы' : language === 'ja' ? '無制限シグナル' : language === 'de' ? 'Unbegrenzte Signale' : 'Unlimited Signals'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{language === 'tr' ? 'Gelişmiş AI Bot' : language === 'ru' ? 'Продвинутый AI Бот' : language === 'ja' ? '高度なAIボット' : language === 'de' ? 'Fortgeschrittener AI-Bot' : 'Advanced AI Bot'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{language === 'tr' ? 'Öncelikli Destek' : language === 'ru' ? 'Приоритетная Поддержка' : language === 'ja' ? '優先サポート' : language === 'de' ? 'Prioritäts-Support' : 'Priority Support'}</span>
                  </div>
                </div>
              </div>
              <Link
                to="/premium"
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition shadow-lg flex items-center space-x-2 group"
              >
                <span>{language === 'tr' ? 'Şimdi Yükselt' : language === 'ru' ? 'Обновить Сейчас' : language === 'ja' ? '今すぐアップグレード' : language === 'de' ? 'Jetzt Upgraden' : 'Upgrade Now'}</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area - 3 columns on large screens */}
          <div className="lg:col-span-3 space-y-6">
            {/* Cryptocurrency Selector */}
            <div className="bg-white dark:bg-crypto-dark-800/80 dark:backdrop-blur-md rounded-lg shadow-md p-6 border border-gray-200 dark:border-crypto-dark-500/50">
              <CryptoSelector onSelect={handleCryptoSelect} />
            </div>

            {/* Signal Display */}
            {selectedCrypto && (
              <>
                {loadingSignal ? (
                  <div className="bg-white dark:bg-crypto-dark-800/80 dark:backdrop-blur-md rounded-lg shadow-md p-6 border border-gray-200 dark:border-crypto-dark-500/50">
                    <div className="flex items-center justify-center py-12">
                      <svg className="animate-spin h-12 w-12 text-blue-600 dark:text-crypto-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                ) : signalError ? (
                  <div className="bg-white dark:bg-crypto-dark-800/80 dark:backdrop-blur-md rounded-lg shadow-md p-6 border border-gray-200 dark:border-crypto-dark-500/50">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                      <p className="text-red-600 dark:text-red-400">{signalError}</p>
                    </div>
                  </div>
                ) : signal ? (
                  <SignalDisplay signal={signal} userRole={userRole} />
                ) : null}

                {/* Historical Chart */}
                <HistoricalChart 
                  cryptocurrency={selectedCrypto.symbol} 
                  userRole={userRole} 
                />
              </>
            )}

            {/* Live Trading Demo - Always visible */}
            <LiveTradingDemo />

            {/* Welcome Message when no crypto selected */}
            {!selectedCrypto && (
              <div className="bg-white dark:bg-crypto-dark-800/80 dark:backdrop-blur-md rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-crypto-dark-500/50">
                <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h2 className="text-2xl font-bold font-display text-gray-800 dark:text-white mb-2 tracking-tight">Welcome to Crypto Trading Signals</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Select a cryptocurrency above to view trading signals, historical data, and market analysis
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Trading Signals</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get buy, sell, or hold recommendations</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Historical Data</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View 30+ days of price history</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Premium Features</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Advanced analysis and real-time alerts</p>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Display at Bottom */}
            <PerformanceDisplay />
          </div>

          {/* Sidebar - 1 column on large screens */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <LiveUserStats />
              <CryptoNewsFeed />
              <PremiumUserActivity />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
