/**
 * CompletedTrade Model
 * 
 * Represents a completed trading signal with entry/exit prices and profit calculation.
 * Only stores premium signal results for public performance display.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

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

export interface CreateCompletedTradeInput {
  signalId: string;
  cryptocurrency: string;
  entryPrice: number;
  exitPrice: number;
  profitPercent: number;
  entryDate: Date;
  exitDate: Date;
  signalType?: 'premium';
}

export interface UpdateCompletedTradeInput {
  signalId?: string;
  cryptocurrency?: string;
  entryPrice?: number;
  exitPrice?: number;
  profitPercent?: number;
  entryDate?: Date;
  exitDate?: Date;
}
