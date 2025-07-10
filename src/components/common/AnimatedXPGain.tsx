import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedXPGainProps {
  xpGained: number;
  onAnimationComplete?: () => void;
  variant?: 'standard' | 'bonus' | 'achievement';
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function AnimatedXPGain({ 
  xpGained, 
  onAnimationComplete,
  variant = 'standard' 
}: AnimatedXPGainProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  // Animation values
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const glowIntensity = useSharedValue(0);

  useEffect(() => {
    // Spiritual "ascension" animation sequence
    const animationSequence = () => {
      // Phase 1: Appear with energy
      scale.value = withSpring(1.2, { damping: 10, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
      glowIntensity.value = withTiming(1, { duration: 300 });
      
      if (variant === 'achievement') {
        rotation.value = withSequence(
          withTiming(10, { duration: 150 }),
          withTiming(-10, { duration: 150 }),
          withTiming(0, { duration: 150 })
        );
      }

      // Phase 2: Float upward (spiritual ascension)
      translateY.value = withDelay(
        300,
        withTiming(-80, { duration: 1500 })
      );
      
      // Phase 3: Scale down and fade
      scale.value = withDelay(
        800,
        withTiming(variant === 'bonus' ? 1.5 : 1, { duration: 700 })
      );
      
      opacity.value = withDelay(
        1200,
        withTiming(0, { duration: 600 }, () => {
          runOnJS(() => {
            setIsVisible(false);
            onAnimationComplete?.();
          })();
        })
      );
      
      glowIntensity.value = withDelay(
        1000,
        withTiming(0, { duration: 800 })
      );
    };

    animationSequence();
  }, []);

  const getVariantColors = () => {
    switch (variant) {
      case 'bonus':
        return ['#F59E0B', '#D97706'];
      case 'achievement':
        return ['#8B5CF6', '#7C3AED'];
      default:
        return ['#10B981', '#059669'];
    }
  };

  const getVariantEmoji = () => {
    switch (variant) {
      case 'bonus':
        return '✨';
      case 'achievement':
        return '🏆';
      default:
        return '⭐';
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: opacity.value,
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowIntensity.value * 0.8,
      shadowRadius: glowIntensity.value * 20,
      elevation: glowIntensity.value * 10,
    };
  });

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <AnimatedLinearGradient
        colors={getVariantColors() as any}
        style={styles.xpBadge}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.emoji}>{getVariantEmoji()}</Text>
        <Text style={styles.xpText}>+{xpGained} XP</Text>
      </AnimatedLinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emoji: {
    fontSize: 16,
    marginRight: 6,
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});