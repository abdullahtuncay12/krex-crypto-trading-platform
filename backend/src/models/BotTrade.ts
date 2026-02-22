/**
 * BotTrade Model
 * 
 * Represents a bot trading execution with full trade details.
 * Records buy/sell operations performed by the AI trading strategy.
 * 
 * Requirements: 10.3, 10.4, 10.5, 4.5
 */

export type TradeType = 'buy' | 'sell';
export type Exchange = 'Binance' | 'Coinbase' | 'Bybit';

export interface BotTrade {
  id: string;
  investmentId: string;
  tradeType: TradeType;
  cryptocurrency: string;
  quantity: number;
  price: number;
  totalValue: number;
  exchange: Exchange;
  executedAt: Date;
  strategyConfidence: number;
  createdAt: Date;
}

export interface CreateBotTradeInput {
  investmentId: string;
  tradeType: TradeType;
  cryptocurrency: string;
  quantity: number;
  price: number;
  totalValue: number;
  exchange: Exchange;
  executedAt: Date;
  strategyConfidence: number;
}
