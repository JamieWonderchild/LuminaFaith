import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { pushNotificationService, NotificationSettings } from '@/services/PushNotificationService';
import { analytics } from '@/utils/analytics';

interface PushNotificationHook {
  isInitialized: boolean;
  hasPermission: boolean;
  settings: NotificationSettings | null;
  loading: boolean;
  updateSettings: (settings: NotificationSettings) => Promise<void>;
  scheduleReminder: (title: string, body: string, delayHours: number) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

export function usePushNotifications(): PushNotificationHook {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize push notifications on mount
  useEffect(() => {
    initializePushNotifications();
  }, []);

  // Set up notification listeners
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(
      notification => {
        pushNotificationService.handleNotificationReceived(notification);
      }
    );

    const responseListener = Notifications.addNotificationResponseReceivedListener(
      response => {
        pushNotificationService.handleNotificationResponse(response);
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const initializePushNotifications = async () => {
    try {
      setLoading(true);
      
      // Initialize service
      const initialized = await pushNotificationService.initialize();
      setIsInitialized(initialized);

      // Check current permissions
      const { status } = await Notifications.getPermissionsAsync();
      setHasPermission(status === 'granted');

      // Load settings
      const currentSettings = await pushNotificationService.getNotificationSettings();
      setSettings(currentSettings);

      analytics.logEvent('push_notifications_hook_initialized', {
        initialized,
        has_permission: status === 'granted',
        settings_enabled: currentSettings.enabled,
      });

    } catch (error) {
      console.error('❌ Failed to initialize push notifications hook:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      
      setHasPermission(granted);
      
      analytics.logEvent('notification_permission_requested_from_hook', {
        status,
        granted,
      });

      if (granted && !isInitialized) {
        // Reinitialize if we just got permissions
        await initializePushNotifications();
      }

      return granted;
    } catch (error) {
      console.error('❌ Failed to request permissions:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isInitialized]);

  const updateSettings = useCallback(async (newSettings: NotificationSettings): Promise<void> => {
    try {
      setLoading(true);
      await pushNotificationService.saveNotificationSettings(newSettings);
      setSettings(newSettings);
      
      console.log('✅ Notification settings updated');
    } catch (error) {
      console.error('❌ Failed to update notification settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const scheduleReminder = useCallback(async (
    title: string, 
    body: string, 
    delayHours: number = 24
  ): Promise<void> => {
    try {
      if (!hasPermission) {
        console.log('🚫 No notification permission for reminder');
        return;
      }

      setLoading(true);
      
      const reminderTime = new Date();
      reminderTime.setHours(reminderTime.getHours() + delayHours);

      await pushNotificationService.scheduleNotification({
        id: `manual_reminder_${Date.now()}`,
        title,
        body,
        category: 'practice_reminder',
        data: {
          action: 'open_app',
          source: 'manual_reminder',
        },
        trigger: {
          type: 'date',
          date: reminderTime,
        } as any,
      });

      analytics.logEvent('manual_reminder_scheduled', {
        delay_hours: delayHours,
        title_length: title.length,
      });

      console.log(`⏰ Reminder scheduled for ${delayHours} hours from now`);
    } catch (error) {
      console.error('❌ Failed to schedule reminder:', error);
    } finally {
      setLoading(false);
    }
  }, [hasPermission]);

  const cancelAllNotifications = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      await pushNotificationService.cancelAllNotifications();
      console.log('🔕 All notifications cancelled via hook');
    } catch (error) {
      console.error('❌ Failed to cancel notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isInitialized,
    hasPermission,
    settings,
    loading,
    updateSettings,
    scheduleReminder,
    cancelAllNotifications,
    requestPermissions,
  };
}