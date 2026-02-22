import React, { useEffect, useState } from 'react';
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
import { Line } from 'react-chartjs-2';
import { botAPI } from '../api/client';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ValuePoint {
  timestamp: string;
  value: number;
}

interface InvestmentValueChartProps {
  investmentId: string;
  principalAmount: number;
  cryptocurrency: string;
}

export const InvestmentValueChart: React.FC<InvestmentValueChartProps> = ({
  investmentId,
  principalAmount,
  cryptocurrency,
}) => {
  const [data, setData] = useState<ValuePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchValueHistory = async () => {
      if (!investmentId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await botAPI.getValueHistory(investmentId);
        setData(response.history || []);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Değer geçmişi yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchValueHistory();

    // Refresh every 30 seconds for active investments
    const interval = setInterval(fetchValueHistory, 30000);

    return () => clearInterval(interval);
  }, [investmentId]);

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const calculateStats = () => {
    if (data.length === 0) {
      return {
        currentValue: principalAmount,
        minValue: principalAmount,
        maxValue: principalAmount,
        profitLoss: 0,
        profitLossPercent: 0,
      };
    }

    const values = data.map((p) => p.value);
    const currentValue = values[values.length - 1];
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const profitLoss = currentValue - principalAmount;
    const profitLossPercent = (profitLoss / principalAmount) * 100;

    return {
      currentValue,
      minValue,
      maxValue,
      profitLoss,
      profitLossPercent,
    };
  };

  const stats = calculateStats();

  const chartData = {
    labels: data.map((point) => formatTime(point.timestamp)),
    datasets: [
      {
        label: 'Yatırım Değeri',
        data: data.map((point) => point.value),
        borderColor: stats.profitLoss >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        backgroundColor:
          stats.profitLoss >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: 'Ana Para',
        data: data.map(() => principalAmount),
        borderColor: 'rgb(156, 163, 175)',
        borderDash: [5, 5],
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${cryptocurrency} Yatırım Değeri`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label === 'Yatırım Değeri') {
              const profit = value - principalAmount;
              const profitPercent = (profit / principalAmount) * 100;
              return [
                `${label}: ${formatCurrency(value)} USDT`,
                `Kar/Zarar: ${profit >= 0 ? '+' : ''}${formatCurrency(profit)} USDT (${
                  profit >= 0 ? '+' : ''
                }${profitPercent.toFixed(2)}%)`,
              ];
            }
            return `${label}: ${formatCurrency(value)} USDT`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value: any) => `${formatCurrency(value)} USDT`,
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <svg
              className="w-12 h-12 text-red-500 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 w-full">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Henüz değer geçmişi bulunmuyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Güncel Değer</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.currentValue)} USDT</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Kar/Zarar</p>
          <p
            className={`text-lg font-semibold ${
              stats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {stats.profitLoss >= 0 ? '+' : ''}
            {formatCurrency(stats.profitLoss)} USDT
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">En Düşük</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.minValue)} USDT</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">En Yüksek</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.maxValue)} USDT</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Real-time Update Indicator */}
      <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span>Otomatik güncelleme aktif (30 saniye)</span>
        </div>
      </div>
    </div>
  );
};
