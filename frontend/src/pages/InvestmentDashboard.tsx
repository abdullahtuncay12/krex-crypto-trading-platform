import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchInvestments, clearError } from '../store/slices/botInvestmentSlice';
import { InvestmentCard } from '../components/InvestmentCard';

export const InvestmentDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { investments, loading, error } = useAppSelector((state) => state.botInvestment);

  const [refreshing, setRefreshing] = useState(false);

  // Redirect if not premium
  useEffect(() => {
    if (user && user.role !== 'premium') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch investments on mount
  useEffect(() => {
    if (user && user.role === 'premium') {
      dispatch(fetchInvestments());
    }
  }, [dispatch, user]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchInvestments());
    setRefreshing(false);
  };

  const handleCancelInvestment = (investmentId: string) => {
    // Investment will be removed from list via Redux state update
    console.log('Investment cancelled:', investmentId);
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Filter investments by status
  const activeInvestments = investments.filter((inv) => inv.status === 'active');
  const completedInvestments = investments.filter((inv) => inv.status === 'completed');
  const cancelledInvestments = investments.filter((inv) => inv.status === 'cancelled');

  // Calculate portfolio summary
  const totalPortfolioValue = activeInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalPrincipal = activeInvestments.reduce((sum, inv) => sum + inv.principalAmount, 0);
  const currentProfit = totalPortfolioValue - totalPrincipal;
  const currentProfitPercent = totalPrincipal > 0 ? (currentProfit / totalPrincipal) * 100 : 0;

  const lifetimeProfit = completedInvestments.reduce((sum, inv) => sum + (inv.profit || 0), 0);
  const lifetimePrincipal = completedInvestments.reduce((sum, inv) => sum + inv.principalAmount, 0);
  const lifetimeProfitPercent = lifetimePrincipal > 0 ? (lifetimeProfit / lifetimePrincipal) * 100 : 0;

  if (!user || user.role !== 'premium') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Yatırım Paneli</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition disabled:opacity-50 flex items-center"
          >
            <svg
              className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Yenile
          </button>
          <button
            onClick={() => navigate('/bot/create')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Yatırım
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Aktif Yatırımlar</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{activeInvestments.length}</p>
          <p className="text-sm text-gray-500 mt-1">
            Toplam: {formatCurrency(totalPortfolioValue)} USDT
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Güncel Kar/Zarar</h3>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentProfit >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <svg
                className={`w-6 h-6 ${currentProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={currentProfit >= 0 ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'}
                />
              </svg>
            </div>
          </div>
          <p className={`text-3xl font-bold ${currentProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {currentProfit >= 0 ? '+' : ''}
            {formatCurrency(currentProfit)} USDT
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {currentProfit >= 0 ? '+' : ''}
            {currentProfitPercent.toFixed(2)}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Tamamlanan</h3>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{completedInvestments.length}</p>
          <p className="text-sm text-gray-500 mt-1">Toplam yatırım</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Toplam Kar</h3>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                lifetimeProfit >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <svg
                className={`w-6 h-6 ${lifetimeProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className={`text-3xl font-bold ${lifetimeProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {lifetimeProfit >= 0 ? '+' : ''}
            {formatCurrency(lifetimeProfit)} USDT
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {lifetimeProfit >= 0 ? '+' : ''}
            {lifetimeProfitPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Active Investments Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Aktif Yatırımlar</h2>
        {loading && activeInvestments.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : activeInvestments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aktif yatırım bulunmuyor</h3>
            <p className="text-gray-600 mb-4">Yeni bir yatırım oluşturarak başlayın</p>
            <button
              onClick={() => navigate('/bot/create')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
            >
              Yeni Yatırım Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeInvestments.map((investment) => (
              <InvestmentCard
                key={investment.id}
                investment={investment}
                onCancel={handleCancelInvestment}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Investments Section */}
      {completedInvestments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tamamlanan Yatırımlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedInvestments.map((investment) => (
              <InvestmentCard key={investment.id} investment={investment} />
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Investments Section */}
      {cancelledInvestments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">İptal Edilen Yatırımlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cancelledInvestments.map((investment) => (
              <InvestmentCard key={investment.id} investment={investment} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
