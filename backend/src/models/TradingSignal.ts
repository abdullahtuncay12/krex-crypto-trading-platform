/**
 * TradingSignal Model
 * 
 * Represents a trading signal (buy/sell/hold recommendation) for a cryptocurrency.
 * Supports both basic signals for normal users and premium signals with risk management.
 * 
 * Requirements: 3.1, 4.1, 4.2, 4.3
 */

export interface TradingSignal {
  id: string;
  cryptocurrency: string;
  recommendation: 'buy' | 'sell' | 'hold';
  confidence: number;
  entryPrice: number;
  stopLoss: number | null;
  limitOrder: number | null;
  signalType: 'basic' | 'premium';
  createdAt: Date;
}

export interface CreateTradingSignalInput {
  cryptocurrency: string;
  recommendation: 'buy' | 'sell' | 'hold';
  confidence: number;
  entryPrice: number;
  stopLoss?: number | null;
  limitOrder?: number | null;
  signalType: 'basic' | 'premium';
}

export interface UpdateTradingSignalInput {
  cryptocurrency?: string;
  recommendation?: 'buy' | 'sell' | 'hold';
  confidence?: number;
  entryPrice?: number;
  stopLoss?: number | null;
  limitOrder?: number | null;
  signalType?: 'basic' | 'premium';
}
