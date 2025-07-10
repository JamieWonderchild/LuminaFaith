import React, { ReactNode } from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { analytics } from '@/utils/analytics';

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends Omit<PressableProps, 'onPress'> {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  animationType?: 'scale' | 'ripple' | 'glow' | 'breathe';
  spiritualFeedback?: boolean;
  hapticFeedback?: boolean;
  analyticsEvent?: string;
}

function AnimatedPressable({
  children,
  onPress,
  style,
  animationType = 'scale',
  spiritualFeedback = true,
  hapticFeedback = true,
  analyticsEvent,
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const glowIntensity = useSharedValue(0);

  const handlePressIn = () => {
    switch (animationType) {
      case 'scale':
        scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
        break;
      case 'ripple':
        scale.value = withSequence(
          withSpring(1.05, { damping: 10, stiffness: 150 }),
          withSpring(0.98, { damping: 15, stiffness: 200 })
        );
        break;
      case 'glow':
        glowIntensity.value = withTiming(1, { duration: 150 });
        scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
        break;
      case 'breathe':
        scale.value = withSequence(
          withTiming(1.02, { duration: 100 }),
          withTiming(0.98, { duration: 100 })
        );
        opacity.value = withTiming(0.8, { duration: 100 });
        break;
    }

    // Haptic feedback for iOS/Android
    if (hapticFeedback) {
      // Note: Could add Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) here
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 200 });
    glowIntensity.value = withTiming(0, { duration: 200 });
  };

  const handlePress = () => {
    // Spiritual "completion" animation
    if (spiritualFeedback) {
      scale.value = withSequence(
        withSpring(1.1, { damping: 10, stiffness: 150 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );
    }

    // Analytics tracking
    if (analyticsEvent) {
      runOnJS(() => {
        analytics.logUserEngagement('button_press', analyticsEvent);
      })();
    }

    // Call the actual onPress handler
    if (onPress) {
      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const glowEffect = glowIntensity.value > 0 ? {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowIntensity.value * 0.6,
      shadowRadius: glowIntensity.value * 20,
      elevation: glowIntensity.value * 10,
    } : {};

    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      ...glowEffect,
    };
  });

  return (
    <AnimatedPressableComponent
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[style, animatedStyle] as any}
      {...props}
    >
      {children}
    </AnimatedPressableComponent>
  );
}

export default AnimatedPressable;