/**
 * AlertPreferences Model
 * 
 * Represents a premium user's alert configuration preferences including
 * thresholds and enabled cryptocurrencies for monitoring.
 * 
 * Requirements: 10.3
 */

export interface AlertPreferences {
  id: string;
  userId: string;
  priceMovementThreshold: number;
  enablePumpAlerts: boolean;
  cryptocurrencies: string[];
  updatedAt: Date;
}

export interface CreateAlertPreferencesInput {
  userId: string;
  priceMovementThreshold: number;
  enablePumpAlerts: boolean;
  cryptocurrencies: string[];
}

export interface UpdateAlertPreferencesInput {
  priceMovementThreshold?: number;
  enablePumpAlerts?: boolean;
  cryptocurrencies?: string[];
}
