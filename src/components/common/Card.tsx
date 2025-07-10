import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import AnimatedPressable from './AnimatedPressable';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  onPress?: () => void;
  elevation?: number;
  backgroundColor?: string;
  animationType?: 'scale' | 'ripple' | 'glow' | 'breathe';
  analyticsEvent?: string;
}

export default function Card({
  children,
  style,
  padding = 16,
  onPress,
  elevation = 1,
  backgroundColor = '#1E293B',
  animationType = 'scale',
  analyticsEvent
}: CardProps) {
  const cardStyle = [
    styles.card,
    {
      padding,
      elevation,
      backgroundColor,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: elevation },
      shadowOpacity: 0.3,
      shadowRadius: elevation * 1.5,
    },
    style
  ];

  if (onPress) {
    return (
      <AnimatedPressable 
        style={cardStyle as any} 
        onPress={onPress}
        animationType={animationType}
        analyticsEvent={analyticsEvent}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#334155',
  },
});