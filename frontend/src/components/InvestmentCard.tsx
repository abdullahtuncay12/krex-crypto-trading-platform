import React, { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { cancelInvestment } from '../store/slices/botInvestmentSlice';

interface Investment {
  id: string;
  cryptocurrency: string;
  principalAmount: number;
  currentValue: number;
  finalValue?: number;
  profit?: number;
  commission?: number;
  tradingPeriodHours: number;
  startTime: string;
  endTime: string;
  status: 'active' | 'completed' | 'cancelled';
  cancelledAt?: string;
  cancellationReason?: string;
}

interface InvestmentCardProps {
  investment: Investment;
  onCancel?: (id: string) => void;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({ investment, onCancel }) => {
  const dispatch = useAppDispatch();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const calculateElapsedTime = (): string => {
    const start = new Date(investment.startTime);
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000 / 60); // minutes

    if (elapsed < 60) {
      return `${elapsed} dakika`;
    }
    const hours = Math.floor(elapsed / 60);
    const minutes = elapsed % 60;
    return `${hours} saat ${minutes} dakika`;
  };

  const calculateRemainingTime = (): string => {
    const end = new Date(investment.endTime);
    const now = new Date();
    const remaining = Math.floor((end.getTime() - now.getTime()) / 1000 / 60); // minutes

    if (remaining <= 0) {
      return 'Tamamlanıyor...';
    }
    if (remaining < 60) {
      return `${remaining} dakika kaldı`;
    }
    const hours = Math.floor(remaining / 60);
    const minutes = remaining % 60;
    return `${hours} saat ${minutes} dakika kaldı`;
  };

  const calculateProfitLoss = (): { amount: number; percentage: number } => {
    if (investment.status === 'active') {
      const amount = investment.currentValue - investment.principalAmount;
      const percentage = (amount / investment.principalAmount) * 100;
      return { amount, percentage };
    } else if (investment.status === 'completed' && investment.profit !== undefined) {
      const percentage = (investment.profit / investment.principalAmount) * 100;
      return { amount: investment.profit, percentage };
    }
    return { amount: 0, percentage: 0 };
  };

  const profitLoss = calculateProfitLoss();
  const isProfit = profitLoss.amount > 0;
  const isLoss = profitLoss.amount < 0;

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    setCancelling(true);
    try {
      await dispatch(cancelInvestment(investment.id));
      if (onCancel) {
        onCancel(investment.id);
      }
    } finally {
      setCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const handleCancelDialogClose = () => {
    setShowCancelDialog(false);
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-bold text-lg">{investment.cryptocurrency}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{investment.cryptocurrency}</h3>
              <p className="text-sm text-gray-500">{investment.tradingPeriodHours} Saatlik İşlem</p>
            </div>
          </div>
          <div>
            {investment.status === 'active' && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Aktif
              </span>
            )}
            {investment.status === 'completed' && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Tamamlandı
              </span>
            )}
            {investment.status === 'cancelled' && (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                İptal Edildi
              </span>
            )}
          </div>
        </div>

        {/* Investment Details */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Ana Para:</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(investment.principalAmount)} USDT
            </span>
          </div>

          {investment.status === 'active' && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Güncel Değer:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(investment.currentValue)} USDT
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Kar/Zarar:</span>
                <span
                  className={`text-sm font-semibold ${
                    isProfit ? 'text-green-600' : isLoss ? 'text-red-600' : 'text-gray-900'
                  }`}
                >
                  {isProfit ? '+' : ''}
                  {formatCurrency(profitLoss.amount)} USDT ({isProfit ? '+' : ''}
                  {profitLoss.percentage.toFixed(2)}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Geçen Süre:</span>
                <span className="text-sm font-medium text-gray-700">{calculateElapsedTime()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Kalan Süre:</span>
                <span className="text-sm font-medium text-gray-700">{calculateRemainingTime()}</span>
              </div>
            </>
          )}

          {investment.status === 'completed' && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Nihai Değer:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(investment.finalValue || 0)} USDT
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Kar/Zarar:</span>
                <span
                  className={`text-sm font-semibold ${
                    isProfit ? 'text-green-600' : isLoss ? 'text-red-600' : 'text-gray-900'
                  }`}
                >
                  {isProfit ? '+' : ''}
                  {formatCurrency(profitLoss.amount)} USDT ({isProfit ? '+' : ''}
                  {profitLoss.percentage.toFixed(2)}%)
                </span>
              </div>
              {investment.commission !== undefined && investment.commission > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Komisyon:</span>
                  <span className="text-sm font-medium text-gray-700">
                    {formatCurrency(investment.commission)} USDT
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tamamlanma:</span>
                <span className="text-sm font-medium text-gray-700">{formatDate(investment.endTime)}</span>
              </div>
            </>
          )}

          {investment.status === 'cancelled' && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">İptal Tarihi:</span>
                <span className="text-sm font-medium text-gray-700">
                  {formatDate(investment.cancelledAt || '')}
                </span>
              </div>
              {investment.cancellationReason && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">İptal Nedeni:</span>
                  <span className="text-sm font-medium text-gray-700">{investment.cancellationReason}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Progress Bar for Active Investments */}
        {investment.status === 'active' && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    ((new Date().getTime() - new Date(investment.startTime).getTime()) /
                      (new Date(investment.endTime).getTime() - new Date(investment.startTime).getTime())) *
                      100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Cancel Button for Active Investments */}
        {investment.status === 'active' && (
          <button
            onClick={handleCancelClick}
            className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition font-medium"
          >
            Yatırımı İptal Et
          </button>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Yatırımı İptal Et</h3>
            <p className="text-gray-700 mb-4">
              Bu yatırımı iptal etmek istediğinizden emin misiniz? İptal işlemi için ana paranızın %2'si
              kadar iptal ücreti alınacaktır.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>İptal Ücreti:</strong> {formatCurrency(investment.principalAmount * 0.02)} USDT
              </p>
              <p className="text-sm text-yellow-800 mt-1">
                <strong>Tahmini İade:</strong>{' '}
                {formatCurrency(investment.currentValue - investment.principalAmount * 0.02)} USDT
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCancelDialogClose}
                disabled={cancelling}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition font-medium disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelling}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition font-medium disabled:opacity-50"
              >
                {cancelling ? 'İptal Ediliyor...' : 'İptal Et'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
