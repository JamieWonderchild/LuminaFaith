import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Text, Platform, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { analytics } from '@/utils/analytics';

// Screen imports
import HomeScreen from '@/screens/HomeScreen';
import PathsScreen from '@/screens/PathsScreen';
import CommunityScreen from '@/screens/CommunityScreen';
import ProfileScreen from '@/screens/ProfileScreen';

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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SmoothTabNavigator() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const insets = useSafeAreaInsets();
  
  // Simple fade animation for screen transitions
  const fadeValue = useSharedValue(1);
  
  // Individual tab scales for press feedback
  const tabScales = tabs.map(() => useSharedValue(1));

  const switchTab = useCallback((newIndex: number) => {
    if (newIndex === activeTabIndex) return;

    // Analytics tracking
    analytics.logEvent('tab_switched', {
      from_tab: tabs[activeTabIndex].key,
      to_tab: tabs[newIndex].key,
    });

    // Ultra-smooth fade transition with spring
    fadeValue.value = withTiming(0.8, { duration: 100 }, () => {
      setActiveTabIndex(newIndex);
      fadeValue.value = withSpring(1, { 
        damping: 15, 
        stiffness: 150,
        mass: 0.8
      });
    });
  }, [activeTabIndex, fadeValue]);

  const handleTabPress = useCallback((index: number) => {
    // Refined tab press animation
    tabScales[index].value = withSpring(0.92, { damping: 25, stiffness: 400 }, () => {
      tabScales[index].value = withSpring(1, { damping: 18, stiffness: 250 });
    });

    switchTab(index);
  }, [switchTab, tabScales]);

  // Screen animation
  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeValue.value,
    transform: [
      {
        scale: interpolate(fadeValue.value, [0.8, 1], [0.99, 1])
      }
    ],
  }));

  // Tab bar indicator animation
  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    const screenWidth = Dimensions.get('window').width;
    const translateXValue = (activeTabIndex * screenWidth) / tabs.length;
    return {
      transform: [
        { 
          translateX: withSpring(
            translateXValue, 
            { damping: 20, stiffness: 150 }
          )
        }
      ],
    };
  });

  // Render current screen
  const CurrentComponent = tabs[activeTabIndex].component;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Screen Content with smooth transition */}
      <Animated.View style={[styles.screenContainer, screenAnimatedStyle]}>
        <CurrentComponent />
      </Animated.View>

      {/* Enhanced Tab Bar */}
      <View style={styles.tabBarContainer}>
        <LinearGradient
          colors={['rgba(15, 15, 35, 0.95)', 'rgba(30, 27, 75, 0.95)']}
          style={styles.tabBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {/* Active Tab Indicator */}
          <Animated.View style={[styles.activeIndicator, indicatorAnimatedStyle]}>
            <LinearGradient
              colors={['#8B5CF6', '#A78BFA']}
              style={styles.indicatorGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>

          {/* Tab Buttons */}
          <View style={styles.tabButtonsContainer}>
            {tabs.map((tab, index) => {
              const isActive = index === activeTabIndex;
              
              const tabAnimatedStyle = useAnimatedStyle(() => ({
                transform: [{ scale: tabScales[index].value }],
              }));

              return (
                <AnimatedPressable
                  key={tab.key}
                  style={[styles.tabButton, tabAnimatedStyle]}
                  onPress={() => handleTabPress(index)}
                >
                  <Text style={[
                    styles.tabEmoji,
                    { opacity: isActive ? 1 : 0.6 }
                  ]}>
                    {tab.emoji}
                  </Text>
                  <Text style={[
                    styles.tabLabel,
                    { 
                      color: isActive ? '#8B5CF6' : '#64748B',
                      opacity: isActive ? 1 : 0.8,
                    }
                  ]}>
                    {tab.name}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>
        </LinearGradient>
      </View>
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
  tabBar: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    paddingTop: 8,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    width: '25%', // 100% / 4 tabs
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
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  tabEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});