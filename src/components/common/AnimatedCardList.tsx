import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import Card from './Card';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  animationType?: 'fadeIn' | 'slideUp' | 'scaleIn' | 'spiritual';
  delay?: number;
  analyticsEvent?: string;
  spiritualGlow?: boolean;
  index?: number; // For staggered animations
}

export default function AnimatedCard({
  children,
  style,
  onPress,
  animationType = 'spiritual',
  delay = 0,
  analyticsEvent,
  spiritualGlow = false,
  index = 0,
}: AnimatedCardProps) {
  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const scale = useSharedValue(0.8);
  const rotation = useSharedValue(-2);
  const glowIntensity = useSharedValue(0);

  useEffect(() => {
    const staggerDelay = index * 150; // Stagger by 150ms per card
    const totalDelay = delay + staggerDelay;

    const animateCard = () => {
      switch (animationType) {
        case 'fadeIn':
          opacity.value = withDelay(totalDelay, withTiming(1, { duration: 600 }));
          break;
          
        case 'slideUp':
          opacity.value = withDelay(totalDelay, withTiming(1, { duration: 500 }));
          translateY.value = withDelay(
            totalDelay,
            withSpring(0, { damping: 15, stiffness: 100 })
          );
          break;
          
        case 'scaleIn':
          opacity.value = withDelay(totalDelay, withTiming(1, { duration: 400 }));
          scale.value = withDelay(
            totalDelay,
            withSpring(1, { damping: 12, stiffness: 150 })
          );
          break;
          
        case 'spiritual':
        default:
          // Spiritual entrance - like consciousness awakening
          opacity.value = withDelay(
            totalDelay,
            withSequence(
              withTiming(0.7, { duration: 200 }),
              withTiming(1, { duration: 400 })
            )
          );
          
          translateY.value = withDelay(
            totalDelay,
            withSpring(0, { damping: 15, stiffness: 100 })
          );
          
          scale.value = withDelay(
            totalDelay,
            withSequence(
              withSpring(1.05, { damping: 10, stiffness: 150 }),
              withSpring(1, { damping: 15, stiffness: 200 })
            )
          );
          
          rotation.value = withDelay(
            totalDelay,
            withSpring(0, { damping: 20, stiffness: 150 })
          );
          
          if (spiritualGlow) {
            glowIntensity.value = withDelay(
              totalDelay + 300,
              withSequence(
                withTiming(1, { duration: 500 }),
                withTiming(0.3, { duration: 1000 })
              )
            );
          }
          break;
      }
    };

    animateCard();
  }, [animationType, delay, index, spiritualGlow]);

  const animatedStyle = useAnimatedStyle(() => {
    const glowEffect = spiritualGlow && glowIntensity.value > 0 ? {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowIntensity.value * 0.6,
      shadowRadius: glowIntensity.value * 15,
      elevation: glowIntensity.value * 8,
    } : {};

    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      ...glowEffect,
    };
  });

  const handlePress = () => {
    // Additional press animation
    if (onPress) {
      // Quick "acknowledge" animation
      scale.value = withSequence(
        withTiming(0.98, { duration: 100 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );
      
      // Call the press handler
      runOnJS(onPress)();
    }
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Card
        onPress={handlePress}
        animationType="scale"
        analyticsEvent={analyticsEvent}
      >
        {children}
      </Card>
    </Animated.View>
  );
}