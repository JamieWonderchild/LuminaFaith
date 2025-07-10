import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { AppProvider, useApp } from './src/store/AppContext';
import { RootStackParamList } from './src/types';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import OfflineIndicator from './src/components/common/OfflineIndicator';
import NotificationBanner from './src/components/common/NotificationBanner';
import { initializeSentry } from './src/utils/sentry';
import { analytics } from './src/utils/analytics';
import { breatheTransition } from './src/navigation/transitions';
import SmoothTabNavigator from './src/components/navigation/SmoothTabNavigator';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './src/types';
import AnimatedTabIcon from './src/components/navigation/AnimatedTabIcon';
import SimpleTabBar from './src/components/navigation/SimpleTabBar';
import AuthNavigator from './src/navigation/AuthNavigator';
import { errorHandler } from './src/services/ErrorHandlingService';

// Screen imports for fallback
import HomeScreen from './src/screens/HomeScreen';
import PathsScreen from './src/screens/PathsScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Enhanced stable tab navigator with smooth animations
function FallbackTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <SimpleTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon focused={focused} emoji="🏠" label="Home" />
          ),
        }}
      />
      <Tab.Screen
        name="Paths"
        component={PathsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon focused={focused} emoji="🗺️" label="Paths" />
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon focused={focused} emoji="👥" label="Community" />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon focused={focused} emoji="👤" label="Profile" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Screens
import LessonScreen from './src/screens/LessonScreen';

const Stack = createStackNavigator<RootStackParamList>();

// Toggle this to switch between smooth and fallback navigation
const USE_SMOOTH_NAVIGATION = false; // Back to stable version due to crashes

// Loading screen component
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#8B5CF6" />
    </View>
  );
}

// Main navigation component that handles auth state
function AppNavigator() {
  const { state } = useApp();
  const [notification, setNotification] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'reminder' | 'achievement';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });
  
  // Show loading screen while initializing
  if (state.isLoading) {
    return <LoadingScreen />;
  }
  
  // Show auth screens if no user is logged in
  if (!state.user) {
    return <AuthNavigator />;
  }
  
  // Show main app if user is authenticated
  return (
    <View style={styles.appContainer}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={USE_SMOOTH_NAVIGATION ? SmoothTabNavigator : FallbackTabs}
          options={{ 
            headerShown: false,
            animationEnabled: false, // Disable stack transitions since we handle them internally
          }}
        />
        <Stack.Screen 
          name="Lesson" 
          component={LessonScreen}
          options={{
            headerShown: true,
            headerTitle: '',
            headerStyle: {
              backgroundColor: '#0F0F23',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: '#F1F5F9',
            headerBackTitleVisible: false,
            ...breatheTransition(),
          }}
        />
      </Stack.Navigator>
      
      {/* Offline Indicator */}
      <OfflineIndicator style={styles.offlineIndicator} />
      
      {/* Notification Banner */}
      <NotificationBanner
        visible={notification.visible}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onDismiss={() => setNotification(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize Sentry for error tracking
    initializeSentry();
    
    // Initialize Analytics
    analytics.initialize();
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </AppProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F0F23',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
});