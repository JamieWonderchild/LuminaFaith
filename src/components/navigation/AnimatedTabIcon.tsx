import React, { useEffect } from 'react';
import { Text, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { addBreadcrumb } from '@/utils/sentry';

interface AnimatedTabIconProps {
  focused: boolean;
  emoji: string;
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export default function AnimatedTabIcon({ 
  focused, 
  emoji, 
  label, 
  onPress, 
  style, 
  disabled = false 
}: AnimatedTabIconProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      // Add analytics breadcrumb
      runOnJS(() => {
        addBreadcrumb(`Tab selected: ${label}`, 'navigation');
      })();

      // Spiritual "awakening" animation
      scale.value = withSequence(
        withSpring(1.15, { damping: 15, stiffness: 150 }),
        withSpring(1.1, { damping: 20, stiffness: 200 })
      );
      
      opacity.value = withSpring(1, { damping: 15, stiffness: 120 });
      
      // Gentle rotation for visual interest
      rotation.value = withSequence(
        withSpring(3, { damping: 15, stiffness: 150 }),
        withSpring(0, { damping: 20, stiffness: 200 })
      );
    } else {
      scale.value = withSpring(1, { damping: 20, stiffness: 200 });
      opacity.value = withSpring(0.6, { damping: 15, stiffness: 120 });
      rotation.value = withSpring(0, { damping: 20, stiffness: 200 });
    }
  }, [focused, scale, opacity, rotation, label]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    if (!disabled && onPress) {
      // Haptic feedback animation
      scale.value = withSequence(
        withSpring(0.9, { damping: 25, stiffness: 400 }),
        withSpring(focused ? 1.1 : 1, { damping: 20, stiffness: 200 })
      );
      
      onPress();
    }
  };

  return (
    <Pressable 
      onPress={handlePress}
      disabled={disabled || !onPress}
      style={[{ alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <Animated.View style={animatedStyle}>
        <Text style={{ 
          fontSize: 20, 
          textAlign: 'center',
          opacity: disabled ? 0.5 : 1,
        }}>
          {emoji}
        </Text>
        {onPress && (
          <Text style={{ 
            fontSize: 10, 
            fontWeight: '600',
            color: focused ? '#8B5CF6' : '#64748B',
            marginTop: 2,
            textAlign: 'center',
            opacity: disabled ? 0.5 : 1,
          }}>
            {label}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}