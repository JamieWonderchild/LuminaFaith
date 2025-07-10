import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { analytics } from '@/utils/analytics';

interface NotificationBannerProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'reminder' | 'achievement';
  duration?: number;
  onPress?: () => void;
  onDismiss?: () => void;
  icon?: string;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function NotificationBanner({
  visible,
  title,
  message,
  type = 'info',
  duration = 5000,
  onPress,
  onDismiss,
  icon,
}: NotificationBannerProps) {
  // Animation values
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  const getTypeColors = () => {
    switch (type) {
      case 'success':
        return ['#059669', '#10B981'];
      case 'reminder':
        return ['#8B5CF6', '#A78BFA'];
      case 'achievement':
        return ['#F59E0B', '#FBBF24'];
      default:
        return ['#3B82F6', '#60A5FA'];
    }
  };

  const getTypeIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return '✅';
      case 'reminder':
        return '🔔';
      case 'achievement':
        return '🌟';
      default:
        return 'ℹ️';
    }
  };

  useEffect(() => {
    if (visible) {
      // Show banner with spring animation
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withSpring(1, { damping: 15, stiffness: 150 });
      scale.value = withSpring(1, { damping: 20, stiffness: 200 });

      analytics.logEvent('notification_banner_shown', {
        type,
        title_length: title.length,
        has_action: !!onPress,
      });

      // Auto-dismiss after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      // Hide banner
      translateY.value = withSpring(-100, { damping: 15, stiffness: 150 });
      opacity.value = withSpring(0, { damping: 15, stiffness: 150 });
      scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
    }
  }, [visible, duration]);

  const handleDismiss = () => {
    translateY.value = withSequence(
      withSpring(-20, { damping: 15, stiffness: 200 }),
      withSpring(-100, { damping: 15, stiffness: 150 })
    );
    
    opacity.value = withSpring(0, { damping: 15, stiffness: 150 }, () => {
      if (onDismiss) {
        runOnJS(onDismiss)();
      }
    });

    analytics.logEvent('notification_banner_dismissed', {
      type,
      dismissed_by: 'auto',
    });
  };

  const handlePress = () => {
    if (onPress) {
      scale.value = withSequence(
        withSpring(0.95, { damping: 15, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );

      analytics.logEvent('notification_banner_tapped', {
        type,
        title,
      });

      onPress();
    }
  };

  const handleManualDismiss = () => {
    analytics.logEvent('notification_banner_dismissed', {
      type,
      dismissed_by: 'user',
    });
    
    handleDismiss();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
        ]}
        disabled={!onPress}
      >
        <AnimatedLinearGradient
          colors={getTypeColors() as any}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.content}>
            <Text style={styles.icon}>{getTypeIcon()}</Text>
            
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.message} numberOfLines={2}>
                {message}
              </Text>
            </View>

            <Pressable
              onPress={handleManualDismiss}
              style={styles.dismissButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.dismissIcon}>✕</Text>
            </Pressable>
          </View>
        </AnimatedLinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  pressable: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  pressed: {
    opacity: 0.9,
  },
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  dismissButton: {
    padding: 4,
  },
  dismissIcon: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
  },
});