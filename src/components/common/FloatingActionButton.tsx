import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  withRepeat,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'small' | 'medium' | 'large';
  colors?: string[];
  visible?: boolean;
  pulse?: boolean;
  bottomOffset?: number;
}

export default function FloatingActionButton({
  onPress,
  icon = '✏️',
  label,
  position = 'bottom-right',
  size = 'medium',
  colors = ['#E74C3C', '#C0392B'],
  visible = true,
  pulse = false,
  bottomOffset = 20
}: FloatingActionButtonProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withSpring(0, { damping: 20, stiffness: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  useEffect(() => {
    if (pulse) {
      pulseScale.value = withRepeat(
        withTiming(1.1, { duration: 1000 }),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value * pulseScale.value * pressScale.value }
      ],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    pressScale.value = withSpring(0.9, { damping: 50, stiffness: 300 });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 50, stiffness: 300 });
  };

  const handlePress = () => {
    // Success animation
    pressScale.value = withSpring(1.2, { damping: 20, stiffness: 200 }, () => {
      pressScale.value = withSpring(1, { damping: 20, stiffness: 200 });
      runOnJS(onPress)();
    });
  };

  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      bottom: bottomOffset,
      zIndex: 1000,
    };

    switch (position) {
      case 'bottom-right':
        return { ...baseStyle, right: 20 };
      case 'bottom-left':
        return { ...baseStyle, left: 20 };
      case 'bottom-center':
        return { ...baseStyle, alignSelf: 'center' as const };
      default:
        return { ...baseStyle, right: 20 };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: 48, height: 48 };
      case 'medium':
        return { width: 56, height: 56 };
      case 'large':
        return { width: 64, height: 64 };
      default:
        return { width: 56, height: 56 };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 24;
      case 'large':
        return 28;
      default:
        return 24;
    }
  };

  if (!visible) return null;

  return (
    <AnimatedTouchableOpacity
      style={[
        getPositionStyle(),
        animatedStyle
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={1}
    >
      <AnimatedLinearGradient
        colors={colors as any}
        style={[
          styles.fab,
          getSizeStyle(),
          label && styles.fabWithLabel
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.icon, { fontSize: getIconSize() }]}>
          {icon}
        </Text>
        {label && (
          <Text style={styles.label}>{label}</Text>
        )}
      </AnimatedLinearGradient>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabWithLabel: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderRadius: 28,
    minWidth: 120,
  },
  icon: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});