import { Easing } from 'react-native';
import { StackNavigationOptions } from '@react-navigation/stack';
import { TransitionSpec, StackCardInterpolationProps } from '@react-navigation/stack/lib/typescript/src/types';

// Custom transition timing for spiritual, serene feel
const TRANSITION_DURATION = 400;

const transitionSpec: TransitionSpec = {
  animation: 'timing',
  config: {
    duration: TRANSITION_DURATION,
    easing: Easing.out(Easing.quad), // Smooth, spiritual curve
  },
};

// Smooth fade + slide transition for screen navigation
export const fadeSlideTransition = (): StackNavigationOptions => ({
  transitionSpec: {
    open: transitionSpec,
    close: transitionSpec,
  },
  cardStyleInterpolator: ({ current, next, layouts }: StackCardInterpolationProps) => {
    const progress = current.progress;
    const nextProgress = next?.progress;

    return {
      cardStyle: {
        opacity: progress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.8, 1],
          extrapolate: 'clamp',
        }),
        transform: [
          {
            translateX: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width * 0.3, 0],
              extrapolate: 'clamp',
            }),
          },
          {
            scale: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
              extrapolate: 'clamp',
            }),
          },
        ],
      },
      overlayStyle: nextProgress
        ? {
            opacity: nextProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
              extrapolate: 'clamp',
            }),
          }
        : {},
    };
  },
});

// Spiritual "breathe" transition for lesson entries
export const breatheTransition = (): StackNavigationOptions => ({
  transitionSpec: {
    open: transitionSpec,
    close: transitionSpec,
  },
  cardStyleInterpolator: ({ current, layouts }: StackCardInterpolationProps) => {
    const progress = current.progress;

    return {
      cardStyle: {
        opacity: progress.interpolate({
          inputRange: [0, 0.3, 1],
          outputRange: [0, 0.7, 1],
          extrapolate: 'clamp',
        }),
        transform: [
          {
            scale: progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.8, 0.95, 1],
              extrapolate: 'clamp',
            }),
          },
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height * 0.1, 0],
              extrapolate: 'clamp',
            }),
          },
        ],
      },
    };
  },
});

// Zen slide for tab navigation
export const zenSlideTransition = (): StackNavigationOptions => ({
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      },
    },
  },
  cardStyleInterpolator: ({ current, layouts }: StackCardInterpolationProps) => {
    const progress = current.progress;

    return {
      cardStyle: {
        transform: [
          {
            translateX: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
              extrapolate: 'clamp',
            }),
          },
        ],
      },
    };
  },
});

// Modal-style transition for overlays
export const modalTransition = (): StackNavigationOptions => ({
  presentation: 'modal',
  transitionSpec: {
    open: transitionSpec,
    close: transitionSpec,
  },
  cardStyleInterpolator: ({ current, layouts }: StackCardInterpolationProps) => {
    const progress = current.progress;

    return {
      cardStyle: {
        opacity: progress,
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
              extrapolate: 'clamp',
            }),
          },
          {
            scale: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
              extrapolate: 'clamp',
            }),
          },
        ],
      },
    };
  },
});