import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useOfflineCache } from '@/hooks/useOfflineCache';

interface OfflineIndicatorProps {
  style?: any;
  showCacheStats?: boolean;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function OfflineIndicator({ 
  style, 
  showCacheStats = false 
}: OfflineIndicatorProps) {
  const { isOnline, cachedLessons, getCacheStats } = useOfflineCache();
  const [cacheStats, setCacheStats] = React.useState<any>(null);
  
  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (!isOnline) {
      // Show offline indicator with gentle animation
      opacity.value = withSpring(1, { damping: 15, stiffness: 100 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      
      // Gentle pulsing to indicate it's working offline
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2000 }),
          withTiming(1, { duration: 2000 })
        ),
        -1,
        true
      );
    } else {
      // Hide when online
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.8, { duration: 300 });
    }
  }, [isOnline]);

  useEffect(() => {
    if (showCacheStats) {
      loadCacheStats();
    }
  }, [showCacheStats, cachedLessons]);

  const loadCacheStats = async () => {
    try {
      const stats = await getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { scale: pulseScale.value },
    ],
  }));

  if (isOnline && !showCacheStats) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <AnimatedLinearGradient
        colors={isOnline ? ['#059669', '#10B981'] : ['#DC2626', '#EF4444']}
        style={styles.indicator}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.content}>
          <Text style={styles.statusIcon}>
            {isOnline ? '🌐' : '📵'}
          </Text>
          
          <View style={styles.textContainer}>
            <Text style={styles.statusText}>
              {isOnline ? 'Online' : 'Offline Mode'}
            </Text>
            
            {!isOnline && (
              <Text style={styles.subText}>
                {cachedLessons.length} lessons available offline
              </Text>
            )}
            
            {showCacheStats && cacheStats && (
              <Text style={styles.subText}>
                Cache: {cacheStats.totalSize} / {cacheStats.maxSize} 
                ({cacheStats.usagePercentage}%)
              </Text>
            )}
          </View>
        </View>
      </AnimatedLinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  indicator: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  subText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
});