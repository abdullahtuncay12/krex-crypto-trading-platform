/**
 * BotInvestment Model
 * 
 * Represents an automated trading bot investment with lifecycle tracking.
 * Manages investment periods, value updates, and commission calculations.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */

export type InvestmentStatus = 'active' | 'completed' | 'cancelled';

export interface BotInvestment {
  id: string;
  userId: string;
  cryptocurrency: string;
  principalAmount: number;
  tradingPeriodHours: number;
  startTime: Date;
  endTime: Date;
  status: InvestmentStatus;
  currentValue: number;
  finalValue: number | null;
  profit: number | null;
  commission: number | null;
  riskAcknowledgedAt: Date;
  cancellationReason: string | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBotInvestmentInput {
  userId: string;
  cryptocurrency: string;
  principalAmount: number;
  tradingPeriodHours: number;
  startTime: Date;
  riskAcknowledgedAt: Date;
}

export interface UpdateBotInvestmentInput {
  currentValue?: number;
  finalValue?: number;
  profit?: number;
  commission?: number;
  status?: InvestmentStatus;
  cancellationReason?: string;
  cancelledAt?: Date;
}
