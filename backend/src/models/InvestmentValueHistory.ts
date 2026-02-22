/**
 * InvestmentValueHistory Model
 * 
 * Represents a historical value snapshot for investment charting.
 * Records investment value at specific timestamps for time-series visualization.
 * 
 * Requirements: 13.5
 */

export interface InvestmentValueHistory {
  id: string;
  investmentId: string;
  value: number;
  timestamp: Date;
}

export interface CreateInvestmentValueHistoryInput {
  investmentId: string;
  value: number;
  timestamp?: Date;
}
