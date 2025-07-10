import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface AnimatedProgressBarProps {
  progress: number; // 0-100
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  style?: ViewStyle;
  animated?: boolean;
  showGradient?: boolean;
  duration?: number;
  delay?: number;
}

export default function AnimatedProgressBar({
  progress,
  height = 8,
  backgroundColor = '#ECF0F1',
  progressColor = '#3498DB',
  style,
  animated = true,
  showGradient = true,
  duration = 1000,
  delay = 0
}: AnimatedProgressBarProps) {
  const animatedProgress = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    const targetProgress = Math.min(Math.max(progress, 0), 100);
    
    if (animated) {
      animatedProgress.value = withTiming(targetProgress, { 
        duration: duration 
      });
      
      // Add shimmer effect
      shimmer.value = withTiming(1, { duration: duration }, () => {
        shimmer.value = 0;
      });
    } else {
      animatedProgress.value = targetProgress;
    }
  }, [progress, animated, duration]);

  const containerStyle = [
    {
      height,
      backgroundColor,
      borderRadius: height / 2,
      overflow: 'hidden' as const,
    },
    style
  ];

  const progressStyle = useAnimatedStyle(() => {
    const width = interpolate(
      animatedProgress.value,
      [0, 100],
      [0, 100],
      Extrapolate.CLAMP
    );

    return {
      width: `${width}%`,
      height: '100%',
      borderRadius: height / 2,
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-100, 200],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX: `${translateX}%` }],
      opacity: interpolate(
        shimmer.value,
        [0, 0.5, 1],
        [0, 0.6, 0],
        Extrapolate.CLAMP
      ),
    };
  });

  return (
    <Animated.View style={containerStyle}>
      <Animated.View style={progressStyle}>
        {showGradient ? (
          <AnimatedLinearGradient
            colors={['#3498DB', '#2980B9']}
            style={{
              flex: 1,
              borderRadius: height / 2,
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        ) : (
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: progressColor,
              borderRadius: height / 2,
            }}
          />
        )}
        
        {/* Shimmer overlay */}
        {animated && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: height / 2,
              },
              shimmerStyle
            ]}
          />
        )}
      </Animated.View>
    </Animated.View>
  );
}