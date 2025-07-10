import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analytics } from '@/utils/analytics';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface SpiritualNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger: Notifications.NotificationTriggerInput;
  category?: 'daily_reminder' | 'lesson_suggestion' | 'practice_reminder' | 'achievement';
}

interface NotificationSettings {
  enabled: boolean;
  dailyReminders: boolean;
  lessonSuggestions: boolean;
  practiceReminders: boolean;
  achievements: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  dailyReminderTime: string; // HH:MM format
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private token: string | null = null;
  private isInitialized = false;

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Initialize push notification service
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Check device compatibility
      if (!Device.isDevice) {
        console.log('🔔 Push notifications only work on physical devices');
        return false;
      }

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('🚫 Push notification permissions denied');
        return false;
      }

      // Get push token
      this.token = await this.getPushToken();
      if (this.token) {
        console.log('🔔 Push notification token obtained');
        analytics.logEvent('push_notifications_initialized', {
          has_token: !!this.token,
        });
      }

      // Set up notification categories
      await this.setupNotificationCategories();

      // Schedule default spiritual reminders
      await this.scheduleDefaultReminders();

      this.isInitialized = true;
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Request notification permissions
   */
  private async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      analytics.logEvent('notification_permission_requested', {
        status: finalStatus,
        platform: Platform.OS,
      });

      return finalStatus === 'granted';
    } catch (error) {
      console.error('❌ Failed to request notification permissions:', error);
      return false;
    }
  }

  /**
   * Get push notification token
   */
  private async getPushToken(): Promise<string | null> {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.warn('⚠️ No project ID found for push notifications');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      
      // Store token for future use
      await AsyncStorage.setItem('push_token', token.data);
      
      return token.data;
    } catch (error) {
      console.error('❌ Failed to get push token:', error);
      return null;
    }
  }

  /**
   * Set up notification categories for better organization
   */
  private async setupNotificationCategories(): Promise<void> {
    try {
      await Notifications.setNotificationCategoryAsync('spiritual_reminder', [
        {
          identifier: 'view_lesson',
          buttonTitle: 'View Lesson',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'dismiss',
          buttonTitle: 'Later',
          options: { isDestructive: false },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('practice_prompt', [
        {
          identifier: 'start_practice',
          buttonTitle: 'Start Practice',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'remind_later',
          buttonTitle: 'Remind Later',
          options: { isDestructive: false },
        },
      ]);

    } catch (error) {
      console.error('❌ Failed to setup notification categories:', error);
    }
  }

  /**
   * Schedule a spiritual notification
   */
  async scheduleNotification(notification: SpiritualNotification): Promise<string | null> {
    try {
      const settings = await this.getNotificationSettings();
      
      // Check if notifications are enabled
      if (!settings.enabled) {
        console.log('🔕 Notifications disabled, skipping schedule');
        return null;
      }

      // Check category-specific settings
      if (!this.isCategoryEnabled(notification.category, settings)) {
        console.log(`🔕 ${notification.category} notifications disabled`);
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: {
            ...notification.data,
            category: notification.category,
            spiritualType: 'reminder',
          },
          categoryIdentifier: this.getCategoryIdentifier(notification.category),
          sound: 'default',
        },
        trigger: notification.trigger,
      });

      analytics.logEvent('spiritual_notification_scheduled', {
        category: notification.category || 'unknown',
        notification_id: notificationId,
      });

      console.log(`🔔 Scheduled ${notification.category} notification: ${notificationId}`);
      return notificationId;

    } catch (error) {
      console.error('❌ Failed to schedule notification:', error);
      return null;
    }
  }

  /**
   * Schedule default spiritual reminders
   */
  private async scheduleDefaultReminders(): Promise<void> {
    try {
      const settings = await this.getNotificationSettings();
      
      if (!settings.dailyReminders) return;

      // Parse daily reminder time
      const [hours, minutes] = settings.dailyReminderTime.split(':').map(Number);

      // Schedule daily spiritual reminder
      await this.scheduleNotification({
        id: 'daily_spiritual_reminder',
        title: '🌅 Morning Reflection',
        body: 'Start your day with a moment of spiritual connection. A new lesson awaits you.',
        category: 'daily_reminder',
        data: {
          action: 'open_daily_lesson',
          source: 'daily_reminder',
        },
        trigger: {
          type: 'calendar',
          hour: hours,
          minute: minutes,
          repeats: true,
        } as any,
      });

      // Schedule evening gratitude reminder
      await this.scheduleNotification({
        id: 'evening_gratitude',
        title: '🌙 Evening Gratitude',
        body: 'Reflect on your day with gratitude. Take a moment for peaceful contemplation.',
        category: 'practice_reminder',
        data: {
          action: 'open_gratitude_practice',
          source: 'evening_reminder',
        },
        trigger: {
          type: 'calendar',
          hour: 19, // 7 PM
          minute: 0,
          repeats: true,
        } as any,
      });

    } catch (error) {
      console.error('❌ Failed to schedule default reminders:', error);
    }
  }

  /**
   * Schedule lesson completion celebration
   */
  async scheduleLessonCelebration(lessonTitle: string, religion: string): Promise<void> {
    try {
      await this.scheduleNotification({
        id: `celebration_${Date.now()}`,
        title: '✨ Spiritual Growth!',
        body: `Congratulations on completing "${lessonTitle}". Your dedication to spiritual learning is inspiring.`,
        category: 'achievement',
        data: {
          action: 'view_achievements',
          lesson_title: lessonTitle,
          religion,
        },
        trigger: {
          type: 'timeInterval',
          seconds: 2,
        } as any,
      });
    } catch (error) {
      console.error('❌ Failed to schedule celebration notification:', error);
    }
  }

  /**
   * Schedule practice reminder based on user habits
   */
  async schedulePracticeReminder(practiceType: string, delayHours: number = 24): Promise<void> {
    try {
      const reminderTime = new Date();
      reminderTime.setHours(reminderTime.getHours() + delayHours);

      await this.scheduleNotification({
        id: `practice_reminder_${Date.now()}`,
        title: '🧘‍♀️ Time for Practice',
        body: `Ready to continue your ${practiceType} practice? Your spiritual journey continues.`,
        category: 'practice_reminder',
        data: {
          action: 'open_practice',
          practice_type: practiceType,
        },
        trigger: {
          type: 'date',
          date: reminderTime,
        } as any,
      });
    } catch (error) {
      console.error('❌ Failed to schedule practice reminder:', error);
    }
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const stored = await AsyncStorage.getItem('notification_settings');
      if (stored) {
        return JSON.parse(stored);
      }

      // Default settings
      const defaultSettings: NotificationSettings = {
        enabled: true,
        dailyReminders: true,
        lessonSuggestions: true,
        practiceReminders: true,
        achievements: true,
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '07:00',
        },
        dailyReminderTime: '08:00',
      };

      await this.saveNotificationSettings(defaultSettings);
      return defaultSettings;

    } catch (error) {
      console.error('❌ Failed to get notification settings:', error);
      // Return safe defaults
      return {
        enabled: false,
        dailyReminders: false,
        lessonSuggestions: false,
        practiceReminders: false,
        achievements: false,
        quietHours: { enabled: false, start: '22:00', end: '07:00' },
        dailyReminderTime: '08:00',
      };
    }
  }

  /**
   * Save notification settings
   */
  async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
      
      analytics.logEvent('notification_settings_updated', {
        enabled: settings.enabled,
        daily_reminders: settings.dailyReminders,
        practice_reminders: settings.practiceReminders,
        achievements: settings.achievements,
      });

      // Reschedule notifications based on new settings
      await this.rescheduleNotifications(settings);

    } catch (error) {
      console.error('❌ Failed to save notification settings:', error);
    }
  }

  /**
   * Reschedule notifications based on settings
   */
  private async rescheduleNotifications(settings: NotificationSettings): Promise<void> {
    try {
      // Cancel all scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Reschedule if enabled
      if (settings.enabled) {
        await this.scheduleDefaultReminders();
      }

    } catch (error) {
      console.error('❌ Failed to reschedule notifications:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🔕 All notifications cancelled');
      
      analytics.logEvent('all_notifications_cancelled', {
        cancelled_by: 'user',
      });

    } catch (error) {
      console.error('❌ Failed to cancel notifications:', error);
    }
  }

  /**
   * Handle notification received
   */
  handleNotificationReceived(notification: Notifications.Notification): void {
    console.log('🔔 Notification received:', notification.request.content.title);
    
    analytics.logEvent('notification_received', {
      category: (notification.request.content.data?.category as string) || 'unknown',
      title: notification.request.content.title || '',
    });
  }

  /**
   * Handle notification response (user tapped)
   */
  handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const data = response.notification.request.content.data;
    
    analytics.logEvent('notification_tapped', {
      category: (data?.category as string) || 'unknown',
      action: (data?.action as string) || 'open_app',
      action_identifier: response.actionIdentifier || 'default',
    });

    console.log('👆 Notification tapped:', {
      action: data?.action,
      category: data?.category,
    });
  }

  /**
   * Get push token for server registration
   */
  getToken(): string | null {
    return this.token;
  }

  // Helper methods

  private isCategoryEnabled(category: string | undefined, settings: NotificationSettings): boolean {
    switch (category) {
      case 'daily_reminder': return settings.dailyReminders;
      case 'lesson_suggestion': return settings.lessonSuggestions;
      case 'practice_reminder': return settings.practiceReminders;
      case 'achievement': return settings.achievements;
      default: return true;
    }
  }

  private getCategoryIdentifier(category: string | undefined): string {
    switch (category) {
      case 'daily_reminder':
      case 'lesson_suggestion':
        return 'spiritual_reminder';
      case 'practice_reminder':
        return 'practice_prompt';
      default:
        return 'spiritual_reminder';
    }
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
export type { NotificationSettings, SpiritualNotification };