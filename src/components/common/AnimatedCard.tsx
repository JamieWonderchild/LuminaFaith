import React, { useEffect } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  withDelay,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  onPress?: () => void;
  elevation?: number;
  backgroundColor?: string;
  index?: number; // For staggered animations
  animationType?: 'fadeIn' | 'slideUp' | 'scaleIn' | 'flipIn';
  delay?: number;
}

export default function AnimatedCard({
  children,
  style,
  padding = 16,
  onPress,
  elevation = 2,
  backgroundColor = '#FFFFFF',
  index = 0,
  animationType = 'fadeIn',
  delay = 0
}: AnimatedCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const scale = useSharedValue(0.8);
  const rotateY = useSharedValue(90);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    const animationDelay = delay + (index * 100);

    switch (animationType) {
      case 'fadeIn':
        opacity.value = withDelay(animationDelay, withTiming(1, { duration: 600 }));
        break;
      case 'slideUp':
        opacity.value = withDelay(animationDelay, withTiming(1, { duration: 600 }));
        translateY.value = withDelay(animationDelay, withSpring(0, { damping: 20, stiffness: 100 }));
        break;
      case 'scaleIn':
        opacity.value = withDelay(animationDelay, withTiming(1, { duration: 600 }));
        scale.value = withDelay(animationDelay, withSpring(1, { damping: 15, stiffness: 150 }));
        break;
      case 'flipIn':
        opacity.value = withDelay(animationDelay, withTiming(1, { duration: 600 }));
        rotateY.value = withDelay(animationDelay, withSpring(0, { damping: 20, stiffness: 100 }));
        break;
    }
  }, [index, animationType, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    const interpolatedRotateY = interpolate(
      rotateY.value,
      [0, 90],
      [0, 90],
      Extrapolate.CLAMP
    );

    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value * pressScale.value },
        { perspective: 1000 },
        { rotateY: `${interpolatedRotateY}deg` }
      ],
    };
  });

  const cardStyle = [
    {
      padding,
      elevation,
      backgroundColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: elevation },
      shadowOpacity: 0.1,
      shadowRadius: elevation * 2,
      borderRadius: 12,
      marginBottom: 12,
    },
    style
  ];

  const handlePressIn = () => {
    pressScale.value = withSpring(0.98, { damping: 50, stiffness: 300 });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 50, stiffness: 300 });
  };

  const handlePress = () => {
    if (onPress) {
      // Add a little bounce animation on press
      pressScale.value = withSpring(1.02, { damping: 50, stiffness: 300 }, () => {
        pressScale.value = withSpring(1, { damping: 50, stiffness: 300 });
        runOnJS(onPress)();
      });
    }
  };

  if (onPress) {
    return (
      <AnimatedTouchableOpacity
        style={[cardStyle, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={1}
      >
        {children}
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <Animated.View style={[cardStyle, animatedStyle]}>
      {children}
    </Animated.View>
  );
}