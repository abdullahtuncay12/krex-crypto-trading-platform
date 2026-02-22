/**
 * Alert Model
 * 
 * Represents an alert notification sent to premium users for price movements,
 * pump detection, and trading opportunities.
 * 
 * Requirements: 10.1, 10.4
 */

export interface Alert {
  id: string;
  userId: string;
  cryptocurrency: string;
  alertType: 'price_movement' | 'pump_detected' | 'trading_opportunity';
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface CreateAlertInput {
  userId: string;
  cryptocurrency: string;
  alertType: 'price_movement' | 'pump_detected' | 'trading_opportunity';
  message: string;
  read?: boolean;
}

export interface UpdateAlertInput {
  read?: boolean;
}
