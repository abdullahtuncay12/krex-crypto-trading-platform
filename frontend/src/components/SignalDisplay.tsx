import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface TradingSignal {
  recommendation: 'buy' | 'sell' | 'hold';
  confidence: number;
  timestamp: Date;
  basicAnalysis: string;
  stopLoss?: number;
  limitOrder?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  detailedAnalysis?: string;
}

interface SignalDisplayProps {
  signal: TradingSignal;
  userRole: 'normal' | 'premium';
}

export const SignalDisplay: React.FC<SignalDisplayProps> = ({ signal, userRole }) => {
  const navigate = useNavigate();
  
  const getRecommendationColor = (recommendation: 'buy' | 'sell' | 'hold') => {
    switch (recommendation) {
      case 'buy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'sell':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getRecommendationIcon = (recommendation: 'buy' | 'sell' | 'hold') => {
    switch (recommendation) {
      case 'buy':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'sell':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      case 'hold':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
    }
  };

  const getRiskLevelColor = (riskLevel?: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
      {/* Header with Recommendation */}
      <div className={`flex items-center justify-between p-4 rounded-lg border-2 mb-4 ${getRecommendationColor(signal.recommendation)}`}>
        <div className="flex items-center space-x-3">
          {getRecommendationIcon(signal.recommendation)}
          <div>
            <h2 className="text-2xl font-bold uppercase">{signal.recommendation}</h2>
            <p className="text-sm opacity-75">Trading Signal</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{signal.confidence}%</div>
          <p className="text-sm opacity-75">Confidence</p>
        </div>
      </div>

      {/* Timestamp */}
      <div className="mb-4 text-sm text-gray-600">
        <span className="font-medium">Generated:</span> {formatTimestamp(signal.timestamp)}
      </div>

      {/* Basic Analysis */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Analysis</h3>
        <p className="text-gray-700 leading-relaxed">{signal.basicAnalysis}</p>
      </div>

      {/* Premium Features */}
      {userRole === 'premium' && (
        <div className="border-t pt-4 mt-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold text-purple-800">Premium Insights</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Stop Loss</p>
                <p className="text-xl font-bold text-gray-900">${signal.stopLoss?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Limit Order</p>
                <p className="text-xl font-bold text-gray-900">${signal.limitOrder?.toLocaleString()}</p>
              </div>
            </div>

            {signal.riskLevel && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-1">Risk Level</p>
                <p className={`text-lg font-semibold uppercase ${getRiskLevelColor(signal.riskLevel)}`}>
                  {signal.riskLevel}
                </p>
              </div>
            )}

            {signal.detailedAnalysis && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Detailed Analysis</p>
                <p className="text-gray-700 leading-relaxed">{signal.detailedAnalysis}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upgrade Prompt for Normal Users */}
      {userRole === 'normal' && (
        <div className="border-t pt-4 mt-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 text-center">
            <svg className="w-12 h-12 text-purple-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Unlock Premium Features</h4>
            <p className="text-sm text-gray-600 mb-3">
              Get stop-loss recommendations, limit order suggestions, risk analysis, and detailed insights
            </p>
            <button 
              onClick={() => navigate('/premium')}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
