/**
 * BotPosition Model
 * 
 * Represents an open or closed trading position for a bot investment.
 * Tracks entry/exit prices, stop-loss, and profit/loss calculations.
 * 
 * Requirements: 4.4, 5.6, 6.3
 */

export type PositionStatus = 'open' | 'closed';

export interface BotPosition {
  id: string;
  investmentId: string;
  cryptocurrency: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  status: PositionStatus;
  openedAt: Date;
  closedAt: Date | null;
  profitLoss: number | null;
}

export interface CreateBotPositionInput {
  investmentId: string;
  cryptocurrency: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  openedAt: Date;
}

export interface UpdateBotPositionInput {
  currentPrice?: number;
  status?: PositionStatus;
  closedAt?: Date;
  profitLoss?: number;
}
