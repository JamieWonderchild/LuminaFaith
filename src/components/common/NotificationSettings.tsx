import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from './Button';
import Card from './Card';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { NotificationSettings as Settings } from '@/services/PushNotificationService';

interface NotificationSettingsProps {
  onClose?: () => void;
}

interface TimePickerProps {
  value: string;
  onTimeChange: (time: string) => void;
  label: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onTimeChange, label }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  
  const [hour, minute] = value.split(':');

  const handleTimePress = () => {
    Alert.prompt(
      `Set ${label}`,
      'Enter time in HH:MM format (24-hour)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set',
          onPress: (input) => {
            if (input && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(input)) {
              onTimeChange(input);
            } else {
              Alert.alert('Invalid Time', 'Please enter time in HH:MM format (e.g., 08:30)');
            }
          },
        },
      ],
      'plain-text',
      value
    );
  };

  return (
    <View style={styles.timePicker}>
      <Text style={styles.timeLabel}>{label}</Text>
      <Button
        title={value}
        onPress={handleTimePress}
        variant="outline"
        size="small"
        analyticsEvent={`time_picker_${label.toLowerCase().replace(' ', '_')}`}
      />
    </View>
  );
};

export default function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const {
    isInitialized,
    hasPermission,
    settings,
    loading,
    updateSettings,
    requestPermissions,
    cancelAllNotifications,
  } = usePushNotifications();

  const [localSettings, setLocalSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings({ ...settings });
    }
  }, [settings]);

  const handleSave = async () => {
    if (!localSettings) return;

    try {
      setSaving(true);
      await updateSettings(localSettings);
      Alert.alert('Settings Saved', 'Your notification preferences have been updated.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save notification settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings to receive spiritual reminders.',
        [
          { text: 'OK', style: 'default' },
          { text: 'Open Settings', onPress: () => {
            // This would open device settings in a real app
            console.log('Open device settings');
          }},
        ]
      );
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'This will cancel all scheduled spiritual reminders. You can re-enable them anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await cancelAllNotifications();
            Alert.alert('Cleared', 'All scheduled notifications have been cancelled.');
          },
        },
      ]
    );
  };

  const updateLocalSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    if (localSettings) {
      setLocalSettings({ ...localSettings, [key]: value });
    }
  };

  const updateQuietHours = (key: 'enabled' | 'start' | 'end', value: boolean | string) => {
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        quietHours: {
          ...localSettings.quietHours,
          [key]: value,
        },
      });
    }
  };

  if (!isInitialized || !localSettings) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1E1B4B', '#312E81']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.headerTitle}>Notification Settings</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? 'Loading...' : 'Setting up spiritual reminders'}
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <Card style={styles.loadingCard}>
            <Text style={styles.loadingText}>
              {loading ? 'Initializing notifications...' : 'Notification system not available'}
            </Text>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1E1B4B', '#312E81']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <Text style={styles.headerSubtitle}>
          Customize your spiritual reminder preferences
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Permission Status */}
        <Card style={styles.permissionCard}>
          <View style={styles.permissionHeader}>
            <Text style={styles.permissionTitle}>
              {hasPermission ? '✅ Notifications Enabled' : '🔔 Enable Notifications'}
            </Text>
            <Text style={styles.permissionSubtitle}>
              {hasPermission 
                ? 'You\'ll receive spiritual reminders as configured below'
                : 'Allow notifications to receive gentle spiritual reminders'
              }
            </Text>
          </View>
          
          {!hasPermission && (
            <Button
              title="Enable Notifications"
              onPress={handleRequestPermissions}
              variant="primary"
              icon="🔔"
              analyticsEvent="request_notification_permission"
            />
          )}
        </Card>

        {/* Main Settings */}
        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Reminder Types</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable All Notifications</Text>
              <Text style={styles.settingDescription}>
                Master toggle for all spiritual reminders
              </Text>
            </View>
            <Switch
              value={localSettings.enabled}
              onValueChange={(value) => updateLocalSetting('enabled', value)}
              trackColor={{ false: '#374151', true: '#8B5CF6' }}
              thumbColor={localSettings.enabled ? '#A78BFA' : '#9CA3AF'}
            />
          </View>

          <View style={[styles.settingRow, !localSettings.enabled && styles.disabledRow]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, !localSettings.enabled && styles.disabledText]}>
                Daily Spiritual Reminders
              </Text>
              <Text style={[styles.settingDescription, !localSettings.enabled && styles.disabledText]}>
                Morning motivation and evening reflection
              </Text>
            </View>
            <Switch
              value={localSettings.dailyReminders && localSettings.enabled}
              onValueChange={(value) => updateLocalSetting('dailyReminders', value)}
              disabled={!localSettings.enabled}
              trackColor={{ false: '#374151', true: '#8B5CF6' }}
              thumbColor={localSettings.dailyReminders ? '#A78BFA' : '#9CA3AF'}
            />
          </View>

          <View style={[styles.settingRow, !localSettings.enabled && styles.disabledRow]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, !localSettings.enabled && styles.disabledText]}>
                Lesson Suggestions
              </Text>
              <Text style={[styles.settingDescription, !localSettings.enabled && styles.disabledText]}>
                Personalized lesson recommendations
              </Text>
            </View>
            <Switch
              value={localSettings.lessonSuggestions && localSettings.enabled}
              onValueChange={(value) => updateLocalSetting('lessonSuggestions', value)}
              disabled={!localSettings.enabled}
              trackColor={{ false: '#374151', true: '#8B5CF6' }}
              thumbColor={localSettings.lessonSuggestions ? '#A78BFA' : '#9CA3AF'}
            />
          </View>

          <View style={[styles.settingRow, !localSettings.enabled && styles.disabledRow]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, !localSettings.enabled && styles.disabledText]}>
                Practice Reminders
              </Text>
              <Text style={[styles.settingDescription, !localSettings.enabled && styles.disabledText]}>
                Gentle nudges to continue your practice
              </Text>
            </View>
            <Switch
              value={localSettings.practiceReminders && localSettings.enabled}
              onValueChange={(value) => updateLocalSetting('practiceReminders', value)}
              disabled={!localSettings.enabled}
              trackColor={{ false: '#374151', true: '#8B5CF6' }}
              thumbColor={localSettings.practiceReminders ? '#A78BFA' : '#9CA3AF'}
            />
          </View>

          <View style={[styles.settingRow, !localSettings.enabled && styles.disabledRow]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, !localSettings.enabled && styles.disabledText]}>
                Achievement Celebrations
              </Text>
              <Text style={[styles.settingDescription, !localSettings.enabled && styles.disabledText]}>
                Celebrate your spiritual growth milestones
              </Text>
            </View>
            <Switch
              value={localSettings.achievements && localSettings.enabled}
              onValueChange={(value) => updateLocalSetting('achievements', value)}
              disabled={!localSettings.enabled}
              trackColor={{ false: '#374151', true: '#8B5CF6' }}
              thumbColor={localSettings.achievements ? '#A78BFA' : '#9CA3AF'}
            />
          </View>
        </Card>

        {/* Timing Settings */}
        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Timing Preferences</Text>
          
          <View style={[styles.timingSection, !localSettings.enabled && styles.disabledRow]}>
            <TimePicker
              value={localSettings.dailyReminderTime}
              onTimeChange={(time) => updateLocalSetting('dailyReminderTime', time)}
              label="Daily Reminder Time"
            />
          </View>

          <View style={[styles.settingRow, !localSettings.enabled && styles.disabledRow]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, !localSettings.enabled && styles.disabledText]}>
                Quiet Hours
              </Text>
              <Text style={[styles.settingDescription, !localSettings.enabled && styles.disabledText]}>
                Pause notifications during rest time
              </Text>
            </View>
            <Switch
              value={localSettings.quietHours.enabled && localSettings.enabled}
              onValueChange={(value) => updateQuietHours('enabled', value)}
              disabled={!localSettings.enabled}
              trackColor={{ false: '#374151', true: '#8B5CF6' }}
              thumbColor={localSettings.quietHours.enabled ? '#A78BFA' : '#9CA3AF'}
            />
          </View>

          {localSettings.quietHours.enabled && localSettings.enabled && (
            <View style={styles.quietHoursContainer}>
              <TimePicker
                value={localSettings.quietHours.start}
                onTimeChange={(time) => updateQuietHours('start', time)}
                label="Quiet Hours Start"
              />
              <TimePicker
                value={localSettings.quietHours.end}
                onTimeChange={(time) => updateQuietHours('end', time)}
                label="Quiet Hours End"
              />
            </View>
          )}
        </Card>

        {/* Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionButtons}>
            <Button
              title={saving ? "Saving..." : "Save Settings"}
              onPress={handleSave}
              disabled={saving || loading}
              variant="primary"
              size="medium"
              icon="💾"
              analyticsEvent="save_notification_settings"
            />
            
            <Button
              title="Clear All Notifications"
              onPress={handleClearAll}
              variant="outline"
              size="medium"
              icon="🗑️"
              analyticsEvent="clear_all_notifications"
            />
          </View>
        </Card>

        {/* Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔔 About Spiritual Notifications</Text>
          <Text style={styles.infoText}>
            • Gentle reminders to support your spiritual journey{'\n'}
            • Customizable timing to fit your daily routine{'\n'}
            • Quiet hours ensure peaceful rest{'\n'}
            • Achievement celebrations mark your progress{'\n'}
            • All notifications respect your preferences
          </Text>
        </Card>
      </ScrollView>

      {/* Footer */}
      {onClose && (
        <View style={styles.footer}>
          <Button
            title="Done"
            onPress={onClose}
            variant="primary"
            fullWidth
            analyticsEvent="close_notification_settings"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingCard: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    color: '#CBD5E1',
    fontSize: 16,
    textAlign: 'center',
  },
  permissionCard: {
    marginBottom: 16,
  },
  permissionHeader: {
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  permissionSubtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  settingsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.3)',
  },
  disabledRow: {
    opacity: 0.5,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  disabledText: {
    color: '#64748B',
  },
  timingSection: {
    paddingVertical: 8,
  },
  timePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#CBD5E1',
  },
  quietHoursContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.3)',
    gap: 8,
  },
  actionsCard: {
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  infoText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
});