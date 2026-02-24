import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { CryptoSelector, Cryptocurrency } from '../components/CryptoSelector';
import { SignalDisplay, TradingSignal } from '../components/SignalDisplay';
import { HistoricalChart } from '../components/HistoricalChart';
import { PerformanceDisplay } from '../components/PerformanceDisplay';
import { CryptoNewsFeed } from '../components/CryptoNewsFeed';
import { LiveTradingDemo } from '../components/LiveTradingDemo';
import { signalAPI } from '../api/client';

export const HomePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Crypto Trading Signals</h1>
              <p className="text-sm text-gray-600 mt-1">
                Real-time trading recommendations and market analysis
              </p>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <div className="flex items-center justify-end space-x-1">
                    {userRole === 'premium' && (
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                    <span className={`text-xs font-semibold ${userRole === 'premium' ? 'text-purple-600' : 'text-gray-600'}`}>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area - 3 columns on large screens */}
          <div className="lg:col-span-3 space-y-6">
            {/* Cryptocurrency Selector */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <CryptoSelector onSelect={handleCryptoSelect} />
            </div>

            {/* Signal Display */}
            {selectedCrypto && (
              <>
                {loadingSignal ? (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-center py-12">
                      <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                ) : signalError ? (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="text-red-600">{signalError}</p>
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
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Crypto Trading Signals</h2>
                <p className="text-gray-600 mb-6">
                  Select a cryptocurrency above to view trading signals, historical data, and market analysis
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <h3 className="font-semibold text-gray-800">Trading Signals</h3>
                    </div>
                    <p className="text-sm text-gray-600">Get buy, sell, or hold recommendations</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                      <h3 className="font-semibold text-gray-800">Historical Data</h3>
                    </div>
                    <p className="text-sm text-gray-600">View 30+ days of price history</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <h3 className="font-semibold text-gray-800">Premium Features</h3>
                    </div>
                    <p className="text-sm text-gray-600">Advanced analysis and real-time alerts</p>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Display at Bottom */}
            <PerformanceDisplay />
          </div>

          {/* Sidebar - 1 column on large screens */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <CryptoNewsFeed />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
