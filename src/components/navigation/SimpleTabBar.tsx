import React from 'react';
import { View, StyleSheet, Pressable, Text, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Simple, stable tab bar with smooth animations
export default function SimpleTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Create scale values for each tab
  const tabScales = state.routes.map(() => useSharedValue(1));

  const handleTabPress = (routeName: string, index: number) => {
    // Simple press animation
    tabScales[index].value = withSpring(0.95, { damping: 15 }, () => {
      tabScales[index].value = withSpring(1, { damping: 15 });
    });

    navigation.navigate(routeName);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(15, 15, 35, 0.95)', 'rgba(30, 27, 75, 0.95)']}
        style={styles.tabBar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {/* Simple sliding indicator */}
        <Animated.View 
          style={[
            styles.indicator,
            {
              left: `${(state.index * 100) / state.routes.length}%`,
              width: `${100 / state.routes.length}%`,
            }
          ]}
        >
          <LinearGradient
            colors={['#8B5CF6', '#A78BFA']}
            style={styles.indicatorGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>

        {/* Tab buttons */}
        <View style={styles.tabsContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            // Get the tab icon
            const TabIcon = options.tabBarIcon;
            
            const tabAnimatedStyle = useAnimatedStyle(() => ({
              transform: [{ scale: tabScales[index].value }],
            }));

            return (
              <AnimatedPressable
                key={route.name}
                style={[styles.tab, tabAnimatedStyle]}
                onPress={() => handleTabPress(route.name, index)}
              >
                {TabIcon && (
                  <TabIcon 
                    focused={isFocused} 
                    color={isFocused ? '#8B5CF6' : '#64748B'} 
                    size={20} 
                  />
                )}
                <Text style={[
                  styles.tabLabel,
                  { color: isFocused ? '#8B5CF6' : '#64748B' }
                ]}>
                  {route.name}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  indicator: {
    position: 'absolute',
    top: 0,
    height: 3,
    borderRadius: 2,
  },
  indicatorGradient: {
    flex: 1,
    borderRadius: 2,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
});