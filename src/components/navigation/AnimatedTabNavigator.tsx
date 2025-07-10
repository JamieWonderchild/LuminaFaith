import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import AnimatedTabIcon from './AnimatedTabIcon';
import { analytics } from '@/utils/analytics';

// Screen imports
import HomeScreen from '@/screens/HomeScreen';
import PathsScreen from '@/screens/PathsScreen';
import CommunityScreen from '@/screens/CommunityScreen';
import ProfileScreen from '@/screens/ProfileScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Tab {
  key: string;
  name: string;
  emoji: string;
  component: React.ComponentType<any>;
}

const tabs: Tab[] = [
  { key: 'Home', name: 'Home', emoji: '🏠', component: HomeScreen },
  { key: 'Paths', name: 'Paths', emoji: '🗺️', component: PathsScreen },
  { key: 'Community', name: 'Community', emoji: '👥', component: CommunityScreen },
  { key: 'Profile', name: 'Profile', emoji: '👤', component: ProfileScreen },
];

export default function AnimatedTabNavigator() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Animation values
  const translateX = useSharedValue(0);
  const tabOpacity = useSharedValue(1);
  const backgroundOpacity = useSharedValue(1);
  
  // Keep refs to previous screen for transition
  const previousScreenRef = useRef<React.ReactElement | null>(null);
  const currentScreenRef = useRef<React.ReactElement | null>(null);

  const switchTab = (newIndex: number) => {
    if (newIndex === activeTabIndex || isTransitioning) return;

    const direction = newIndex > activeTabIndex ? 1 : -1;
    setIsTransitioning(true);

    // Store current screen for transition
    previousScreenRef.current = currentScreenRef.current;

    // Analytics tracking
    analytics.logEvent('tab_switched', {
      from_tab: tabs[activeTabIndex].key,
      to_tab: tabs[newIndex].key,
      direction: direction > 0 ? 'right' : 'left',
    });

    // Start transition animation
    translateX.value = withSpring(
      direction * SCREEN_WIDTH,
      {
        damping: 20,
        stiffness: 150,
        mass: 1,
      },
      () => {
        // Reset position and update tab
        runOnJS(() => {
          setActiveTabIndex(newIndex);
          setIsTransitioning(false);
        })();
        
        translateX.value = withSpring(0, {
          damping: 25,
          stiffness: 200,
        });
      }
    );

    // Fade transition for smoother experience
    tabOpacity.value = withTiming(0.3, { duration: 150 }, () => {
      tabOpacity.value = withTiming(1, { duration: 200 });
    });

    // Subtle background pulse
    backgroundOpacity.value = withTiming(0.95, { duration: 100 }, () => {
      backgroundOpacity.value = withTiming(1, { duration: 150 });
    });
  };

  // Animated styles
  const screenAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: tabOpacity.value,
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const tabBarAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      tabOpacity.value,
      [0.3, 1],
      [0.98, 1]
    );
    
    return {
      transform: [{ scale }],
    };
  });

  // Render current screen
  const renderCurrentScreen = () => {
    const CurrentComponent = tabs[activeTabIndex].component;
    currentScreenRef.current = <CurrentComponent />;
    return currentScreenRef.current;
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Animated Background */}
      <Animated.View style={[styles.screenContainer, backgroundAnimatedStyle]}>
        <LinearGradient
          colors={['#0F0F23', '#1E1B4B']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Screen Content */}
      <Animated.View style={[styles.screenContainer, screenAnimatedStyle]}>
        {renderCurrentScreen()}
      </Animated.View>

      {/* Enhanced Tab Bar */}
      <Animated.View style={[styles.tabBarContainer, tabBarAnimatedStyle]}>
        <LinearGradient
          colors={['rgba(15, 15, 35, 0.95)', 'rgba(30, 27, 75, 0.95)']}
          style={styles.tabBarGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {/* Tab Bar Background Blur Effect */}
          <View style={styles.tabBarBlur} />
          
          {/* Active Tab Indicator */}
          <Animated.View
            style={[
              styles.activeIndicator,
              {
                left: `${(activeTabIndex * 100) / tabs.length}%`,
                width: `${100 / tabs.length}%`,
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.3)', 'rgba(167, 139, 250, 0.3)']}
              style={styles.indicatorGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>

          {/* Tab Buttons */}
          <View style={styles.tabButtonsContainer}>
            {tabs.map((tab, index) => (
              <AnimatedTabIcon
                key={tab.key}
                focused={index === activeTabIndex}
                emoji={tab.emoji}
                label={tab.name}
                onPress={() => switchTab(index)}
                style={styles.tabButton}
                disabled={isTransitioning}
              />
            ))}
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Transition Overlay */}
      {isTransitioning && (
        <Animated.View style={[styles.transitionOverlay, screenAnimatedStyle]}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.1)', 'rgba(167, 139, 250, 0.1)']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  screenContainer: {
    flex: 1,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  tabBarGradient: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  tabBarBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 15, 35, 0.85)',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    height: 3,
    borderRadius: 2,
  },
  indicatorGradient: {
    flex: 1,
    borderRadius: 2,
  },
  tabButtonsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  transitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    pointerEvents: 'none',
  },
});