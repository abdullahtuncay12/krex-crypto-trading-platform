import React, { useState, useEffect } from 'react';
import { signalAPI } from '../api/client';

export interface CompletedTrade {
  id: string;
  signalId: string;
  cryptocurrency: string;
  entryPrice: number;
  exitPrice: number;
  profitPercent: number;
  entryDate: Date;
  exitDate: Date;
  signalType: 'premium';
}

interface PerformanceDisplayProps {
  limit?: number;
}

export const PerformanceDisplay: React.FC<PerformanceDisplayProps> = ({ limit = 10 }) => {
  const [trades, setTrades] = useState<CompletedTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await signalAPI.getPerformance();
        setTrades(response.data.trades || []);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number | string) => {
      const numPrice = typeof price === 'string' ? parseFloat(price) : price;
      return `${numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Premium Signal Performance</h2>
        <div className="flex justify-center items-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Premium Signal Performance</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Premium Signal Performance</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-600">No completed trades yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Premium Signal Performance</h2>
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm text-gray-600">Recent Completed Trades</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cryptocurrency</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Entry Price</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Exit Price</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Profit</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Exit Date</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="py-3 px-4">
                  <span className="font-medium text-gray-900">{trade.cryptocurrency}</span>
                </td>
                <td className="text-right py-3 px-4 text-gray-700">
                  {formatPrice(trade.entryPrice)}
                </td>
                <td className="text-right py-3 px-4 text-gray-700">
                  {formatPrice(trade.exitPrice)}
                </td>
                <td className="text-right py-3 px-4">
                  <span
                    className={`font-semibold ${
                      Number(trade.profitPercent) > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {Number(trade.profitPercent) > 0 ? '+' : ''}
                    {Number(trade.profitPercent).toFixed(2)}%
                  </span>
                </td>
                <td className="text-right py-3 px-4 text-sm text-gray-600">
                  {formatDate(trade.exitDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Showing {trades.length} most recent completed premium signal{trades.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};
