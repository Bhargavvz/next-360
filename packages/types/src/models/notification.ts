import { NotificationType } from '../enums';

/** Notification */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

/** Notification preferences */
export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  priceAlerts: boolean;
}
