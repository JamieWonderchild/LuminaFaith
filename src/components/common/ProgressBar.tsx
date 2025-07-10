import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  style?: ViewStyle;
  animated?: boolean;
  showGradient?: boolean;
  testID?: string;
  spiritual?: boolean;
  glowEffect?: boolean;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedView = Animated.View;

export default function ProgressBar({
  progress,
  height = 8,
  backgroundColor = '#475569',
  progressColor = '#8B5CF6',
  style,
  animated = true,
  showGradient = true,
  testID,
  spiritual = false,
  glowEffect = false
}: ProgressBarProps) {
  const progressWidth = Math.min(Math.max(progress, 0), 100);
  
  // Animation values
  const animatedWidth = useSharedValue(0);
  const glowIntensity = useSharedValue(0);
  const spiritualPulse = useSharedValue(1);

  useEffect(() => {
    if (animated) {
      // Smooth progress animation
      animatedWidth.value = withSpring(progressWidth, {
        damping: 15,
        stiffness: 100,
      });

      // Glow effect for special moments
      if (glowEffect && progressWidth > 0) {
        glowIntensity.value = withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.3, { duration: 500 })
        );
      }

      // Spiritual breathing effect
      if (spiritual) {
        spiritualPulse.value = withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        );
      }
    } else {
      animatedWidth.value = progressWidth;
    }
  }, [progress, animated, glowEffect, spiritual]);

  const containerStyle = [
    styles.container,
    {
      height,
      backgroundColor,
    },
    style
  ];

  const animatedProgressStyle = useAnimatedStyle(() => {
    const glowShadow = glowEffect && glowIntensity.value > 0 ? {
      shadowColor: progressColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowIntensity.value * 0.8,
      shadowRadius: glowIntensity.value * 20,
      elevation: glowIntensity.value * 10,
    } : {};

    return {
      width: `${animatedWidth.value}%`,
      backgroundColor: showGradient ? 'transparent' : progressColor,
      transform: spiritual ? [{ scale: spiritualPulse.value }] : [],
      ...glowShadow,
    };
  });

  return (
    <View style={containerStyle} testID={testID}>
      <AnimatedView style={[styles.progress, animatedProgressStyle]}>
        {showGradient && (
          <AnimatedLinearGradient
            colors={spiritual ? ['#8B5CF6', '#7C3AED', '#6366F1'] : ['#8B5CF6', '#7C3AED']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        )}
      </AnimatedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 6,
  },
  gradient: {
    flex: 1,
    borderRadius: 6,
  },
});