import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  shimmer?: boolean;
}

export function LoadingSkeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  shimmer = true
}: LoadingSkeletonProps) {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    if (shimmer) {
      shimmerValue.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        false
      );
    }
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-100, 100],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX: `${translateX}%` }],
    };
  });

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#F0F0F0',
          overflow: 'hidden',
        },
        style
      ]}
    >
      {shimmer && (
        <AnimatedLinearGradient
          colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
          style={[StyleSheet.absoluteFillObject, animatedStyle]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      )}
    </View>
  );
}

interface SkeletonCardProps {
  style?: ViewStyle;
}

export function SkeletonCard({ style }: SkeletonCardProps) {
  return (
    <View style={[styles.skeletonCard, style]}>
      <View style={styles.skeletonHeader}>
        <LoadingSkeleton width={40} height={40} borderRadius={20} />
        <View style={styles.skeletonHeaderText}>
          <LoadingSkeleton width="70%" height={16} />
          <LoadingSkeleton width="50%" height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
      
      <LoadingSkeleton width="100%" height={16} style={{ marginTop: 16 }} />
      <LoadingSkeleton width="80%" height={16} style={{ marginTop: 8 }} />
      <LoadingSkeleton width="60%" height={16} style={{ marginTop: 8 }} />
      
      <View style={styles.skeletonFooter}>
        <LoadingSkeleton width={60} height={12} />
        <LoadingSkeleton width={40} height={12} />
      </View>
    </View>
  );
}

interface SkeletonListProps {
  itemCount?: number;
  style?: ViewStyle;
}

export function SkeletonList({ itemCount = 3, style }: SkeletonListProps) {
  return (
    <View style={style}>
      {Array.from({ length: itemCount }, (_, index) => (
        <SkeletonCard key={index} style={{ marginBottom: 16 }} />
      ))}
    </View>
  );
}

interface SkeletonStatsProps {
  style?: ViewStyle;
}

export function SkeletonStats({ style }: SkeletonStatsProps) {
  return (
    <View style={[styles.skeletonStats, style]}>
      {Array.from({ length: 3 }, (_, index) => (
        <View key={index} style={styles.skeletonStatItem}>
          <LoadingSkeleton width={40} height={24} borderRadius={4} />
          <LoadingSkeleton width={60} height={12} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  skeletonStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonStatItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});