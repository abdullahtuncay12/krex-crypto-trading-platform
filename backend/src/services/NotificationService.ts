/**
 * NotificationService
 * 
 * Handles all notification types for bot trading investments.
 * Sends email and in-app notifications based on user preferences.
 * 
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7
 */

import { BotInvestment } from '../models/BotInvestment';

export interface NotificationPayload {
  userId: string;
  type: 'investment_created' | 'investment_completed' | 'profit_milestone' | 'loss_warning' | 'investment_cancelled' | 'error';
  title: string;
  message: string;
  data?: any;
}

export class NotificationService {
  /**
   * Send investment created notification
   * Requirement 18.1: Notify on investment creation
   * @param investment - Bot investment
   */
  async sendInvestmentCreated(investment: BotInvestment): Promise<void> {
    const payload: NotificationPayload = {
      userId: investment.userId,
      type: 'investment_created',
      title: 'Yatırım Oluşturuldu',
      message: `${investment.cryptocurrency} için ${investment.principalAmount} USDT tutarında ${investment.tradingPeriodHours} saatlik yatırımınız başlatıldı.`,
      data: {
        investmentId: investment.id,
        cryptocurrency: investment.cryptocurrency,
        principalAmount: investment.principalAmount,
        tradingPeriodHours: investment.tradingPeriodHours
      }
    };

    await this.sendNotification(payload);
  }

  /**
   * Send investment completed notification
   * Requirement 18.2: Notify on investment completion
   * @param investment - Bot investment
   */
  async sendInvestmentCompleted(investment: BotInvestment): Promise<void> {
    const profit = investment.profit || 0;
    const profitPercent = ((profit / investment.principalAmount) * 100).toFixed(2);
    const isProfitable = profit > 0;

    const payload: NotificationPayload = {
      userId: investment.userId,
      type: 'investment_completed',
      title: 'Yatırım Tamamlandı',
      message: `${investment.cryptocurrency} yatırımınız tamamlandı. ${isProfitable ? 'Kar' : 'Zarar'}: ${profitPercent}% (${profit.toFixed(2)} USDT)`,
      data: {
        investmentId: investment.id,
        cryptocurrency: investment.cryptocurrency,
        principalAmount: investment.principalAmount,
        finalValue: investment.finalValue,
        profit,
        profitPercent,
        commission: investment.commission
      }
    };

    await this.sendNotification(payload);
  }

  /**
   * Send profit milestone notification
   * Requirement 18.3: Notify when profit exceeds 10%
   * @param investment - Bot investment
   * @param currentValue - Current investment value
   */
  async sendProfitMilestone(investment: BotInvestment, currentValue: number): Promise<void> {
    const profit = currentValue - investment.principalAmount;
    const profitPercent = ((profit / investment.principalAmount) * 100).toFixed(2);

    const payload: NotificationPayload = {
      userId: investment.userId,
      type: 'profit_milestone',
      title: 'Kar Hedefine Ulaşıldı! 🎉',
      message: `${investment.cryptocurrency} yatırımınız %10'un üzerinde kar etti! Mevcut kar: ${profitPercent}% (${profit.toFixed(2)} USDT)`,
      data: {
        investmentId: investment.id,
        cryptocurrency: investment.cryptocurrency,
        principalAmount: investment.principalAmount,
        currentValue,
        profit,
        profitPercent
      }
    };

    await this.sendNotification(payload);
  }

  /**
   * Send loss warning notification
   * Requirement 18.4: Notify when loss exceeds 5%
   * @param investment - Bot investment
   * @param currentValue - Current investment value
   */
  async sendLossWarning(investment: BotInvestment, currentValue: number): Promise<void> {
    const loss = investment.principalAmount - currentValue;
    const lossPercent = ((loss / investment.principalAmount) * 100).toFixed(2);

    const payload: NotificationPayload = {
      userId: investment.userId,
      type: 'loss_warning',
      title: 'Zarar Uyarısı ⚠️',
      message: `${investment.cryptocurrency} yatırımınız %5'in üzerinde zarar ediyor. Mevcut zarar: ${lossPercent}% (${loss.toFixed(2)} USDT)`,
      data: {
        investmentId: investment.id,
        cryptocurrency: investment.cryptocurrency,
        principalAmount: investment.principalAmount,
        currentValue,
        loss,
        lossPercent
      }
    };

    await this.sendNotification(payload);
  }

  /**
   * Send investment cancelled notification
   * Requirement 18.5: Notify on investment cancellation
   * @param investment - Bot investment
   */
  async sendInvestmentCancelled(investment: BotInvestment): Promise<void> {
    const payload: NotificationPayload = {
      userId: investment.userId,
      type: 'investment_cancelled',
      title: 'Yatırım İptal Edildi',
      message: `${investment.cryptocurrency} yatırımınız iptal edildi. ${investment.cancellationReason || 'Sebep belirtilmedi.'}`,
      data: {
        investmentId: investment.id,
        cryptocurrency: investment.cryptocurrency,
        principalAmount: investment.principalAmount,
        cancellationReason: investment.cancellationReason,
        cancelledAt: investment.cancelledAt
      }
    };

    await this.sendNotification(payload);
  }

  /**
   * Send error notification
   * @param userId - User ID
   * @param error - Error message
   * @param context - Additional context
   */
  async sendErrorNotification(userId: string, error: string, context?: any): Promise<void> {
    const payload: NotificationPayload = {
      userId,
      type: 'error',
      title: 'Hata Oluştu',
      message: `Yatırım işleminizde bir hata oluştu: ${error}`,
      data: {
        error,
        context
      }
    };

    await this.sendNotification(payload);
  }

  /**
   * Send notification (base method)
   * Requirement 18.6: Support email notifications
   * Requirement 18.7: Respect user notification preferences
   * @param payload - Notification payload
   */
  private async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      // TODO: Check user notification preferences
      // const preferences = await alertPreferencesRepository.findByUserId(payload.userId);
      
      // For now, just log the notification
      console.log('Notification:', JSON.stringify(payload, null, 2));

      // TODO: Implement actual notification sending
      // - Email via SendGrid/AWS SES
      // - In-app notification queue
      // - Push notifications (optional)
      
      // Store in-app notification (placeholder)
      // await this.storeInAppNotification(payload);
      
      // Send email if enabled (placeholder)
      // if (preferences?.emailEnabled) {
      //   await this.sendEmail(payload);
      // }
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Don't throw - notifications should not break the main flow
    }
  }

  /**
   * Store in-app notification (placeholder)
   * @param payload - Notification payload
   */
  private async storeInAppNotification(payload: NotificationPayload): Promise<void> {
    // TODO: Implement in-app notification storage
    // This would typically store in a notifications table
    console.log('Storing in-app notification:', payload.type);
  }

  /**
   * Send email notification (placeholder)
   * @param payload - Notification payload
   */
  private async sendEmail(payload: NotificationPayload): Promise<void> {
    // TODO: Implement email sending via SendGrid/AWS SES
    console.log('Sending email notification:', payload.type);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
