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
import { cryptoAPI } from '../api/client';

// Register Chart.js components
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

export interface PricePoint {
  timestamp: Date;
  price: number;
  volume: number;
}

interface HistoricalChartProps {
  cryptocurrency: string;
  userRole: 'normal' | 'premium';
}

export const HistoricalChart: React.FC<HistoricalChartProps> = ({ cryptocurrency, userRole }) => {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!cryptocurrency) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch at least 30 days of historical data (requirement 7.2)
        const response = await cryptoAPI.getHistory(cryptocurrency, 30);
        const priceData = response.data.data.map((point: any) => ({
          timestamp: new Date(point.timestamp),
          price: point.price,
          volume: point.volume,
        }));

        setData(priceData);

        // Generate basic or extended analysis based on user role
        if (priceData.length > 0) {
          const analysisText = generateAnalysis(priceData, userRole);
          setAnalysis(analysisText);
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load historical data');
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [cryptocurrency, userRole]);

  const generateAnalysis = (priceData: PricePoint[], role: 'normal' | 'premium'): string => {
    if (priceData.length === 0) return '';

    const prices = priceData.map(p => p.price);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    let basicAnalysis = `Over the past 30 days, ${cryptocurrency} has ${change >= 0 ? 'gained' : 'lost'} ${Math.abs(change).toFixed(2)}%. `;
    basicAnalysis += `The price ranged from $${minPrice.toLocaleString()} to $${maxPrice.toLocaleString()}.`;

    if (role === 'premium') {
      // Extended analysis for premium users (requirement 7.4)
      const volatility = calculateVolatility(prices);
      const trend = calculateTrend(prices);
      const support = calculateSupport(prices);
      const resistance = calculateResistance(prices);

      let extendedAnalysis = basicAnalysis;
      extendedAnalysis += `\n\nVolatility: ${volatility.toFixed(2)}% - ${volatility > 5 ? 'High volatility indicates increased risk' : 'Low volatility suggests stable price action'}.`;
      extendedAnalysis += `\nTrend: ${trend > 0 ? 'Upward' : trend < 0 ? 'Downward' : 'Sideways'} - ${getTrendDescription(trend)}.`;
      extendedAnalysis += `\nSupport Level: $${support.toLocaleString()} - Price has historically bounced from this level.`;
      extendedAnalysis += `\nResistance Level: $${resistance.toLocaleString()} - Price has struggled to break above this level.`;

      return extendedAnalysis;
    }

    return basicAnalysis;
  };

  const calculateVolatility = (prices: number[]): number => {
    const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance) * 100;
  };

  const calculateTrend = (prices: number[]): number => {
    // Simple linear regression slope
    const n = prices.length;
    const xMean = (n - 1) / 2;
    const yMean = prices.reduce((sum, p) => sum + p, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (prices[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }
    
    return numerator / denominator;
  };

  const calculateSupport = (prices: number[]): number => {
    // Find the lowest price in recent history
    const recentPrices = prices.slice(-10);
    return Math.min(...recentPrices);
  };

  const calculateResistance = (prices: number[]): number => {
    // Find the highest price in recent history
    const recentPrices = prices.slice(-10);
    return Math.max(...recentPrices);
  };

  const getTrendDescription = (trend: number): string => {
    if (trend > 10) return 'Strong bullish momentum';
    if (trend > 0) return 'Moderate upward movement';
    if (trend < -10) return 'Strong bearish pressure';
    if (trend < 0) return 'Moderate downward movement';
    return 'Consolidating in a range';
  };

  const chartData = {
    labels: data.map(point => 
      point.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: `${cryptocurrency} Price`,
        data: data.map(point => point.price),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
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
        text: `${cryptocurrency} Price History (30 Days)`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Price: $${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value: any) => `$${value.toLocaleString()}`,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
          <p className="text-gray-500">No historical data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full">
      {/* Chart */}
      <div className="h-80 mb-6">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Analysis Section */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          {userRole === 'premium' ? 'Extended Analysis' : 'Basic Analysis'}
        </h3>
        <div className={`p-4 rounded-lg ${userRole === 'premium' ? 'bg-gradient-to-r from-purple-50 to-blue-50' : 'bg-gray-50'}`}>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{analysis}</p>
        </div>

        {/* Premium Badge */}
        {userRole === 'premium' && (
          <div className="flex items-center mt-3 text-sm text-purple-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-medium">Premium Analysis</span>
          </div>
        )}

        {/* Upgrade Prompt for Normal Users */}
        {userRole === 'normal' && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg text-center">
            <p className="text-sm text-gray-700 mb-2">
              Unlock extended analysis with volatility metrics, trend analysis, support/resistance levels, and more
            </p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
              Upgrade to Premium
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
