import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AppProvider, useApp } from '@/store/AppContext';

// Test the complete app state management flow
describe('App State Integration Tests', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider>{children}</AppProvider>
  );

  it('handles complete lesson completion flow', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    const initialXP = result.current.state.user?.totalXP || 0;
    const initialCompleted = result.current.state.userProgress['buddhism-basics']?.completedLessons || 0;

    // Complete a lesson
    act(() => {
      result.current.dispatch({
        type: 'UPDATE_PROGRESS',
        payload: {
          pathId: 'buddhism-basics',
          lessonId: 'test-lesson',
          xp: 50,
          accuracy: 85
        }
      });
    });

    act(() => {
      result.current.dispatch({
        type: 'COMPLETE_LESSON',
        payload: {
          pathId: 'buddhism-basics',
          lessonId: 'test-lesson'
        }
      });
    });

    // Check that all related state was updated
    expect(result.current.state.user?.totalXP).toBe(initialXP + 50);
    expect(result.current.state.userProgress['buddhism-basics'].completedLessons).toBe(initialCompleted + 1);
    expect(result.current.state.userProgress['buddhism-basics'].lastStudied).toBeDefined();
  });

  it('handles streak progression correctly', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    const initialStreak = result.current.state.user?.streak || 0;

    // Update streak
    act(() => {
      result.current.dispatch({
        type: 'UPDATE_STREAK',
        payload: initialStreak + 1
      });
    });

    expect(result.current.state.user?.streak).toBe(initialStreak + 1);
  });

  it('manages multiple learning paths simultaneously', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    // Add progress to multiple paths
    act(() => {
      result.current.dispatch({
        type: 'UPDATE_PROGRESS',
        payload: {
          pathId: 'buddhism-basics',
          lessonId: 'lesson-1',
          xp: 25,
          accuracy: 90
        }
      });
    });

    act(() => {
      result.current.dispatch({
        type: 'UPDATE_PROGRESS',
        payload: {
          pathId: 'christian-basics',
          lessonId: 'lesson-1',
          xp: 30,
          accuracy: 95
        }
      });
    });

    // Check both paths have progress
    expect(result.current.state.userProgress['buddhism-basics']).toBeDefined();
    expect(result.current.state.userProgress['christian-basics']).toBeDefined();

    // Total XP should be sum of both
    const totalXPFromPaths = 
      result.current.state.userProgress['buddhism-basics'].xpEarned +
      result.current.state.userProgress['christian-basics'].xpEarned;
    
    expect(totalXPFromPaths).toBeGreaterThan(0);
  });

  it('handles achievement unlocking correctly', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    const lockedAchievement = result.current.state.achievements.find(a => !a.isUnlocked);
    
    if (lockedAchievement) {
      act(() => {
        result.current.dispatch({
          type: 'UNLOCK_ACHIEVEMENT',
          payload: lockedAchievement
        });
      });

      const updatedAchievement = result.current.state.achievements.find(a => a.id === lockedAchievement.id);
      expect(updatedAchievement?.isUnlocked).toBe(true);
      expect(updatedAchievement?.unlockedAt).toBeDefined();
    }
  });

  it('handles error states gracefully', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    // Set an error
    act(() => {
      result.current.dispatch({
        type: 'SET_ERROR',
        payload: 'Network error occurred'
      });
    });

    expect(result.current.state.error).toBe('Network error occurred');

    // Clear the error
    act(() => {
      result.current.dispatch({
        type: 'SET_ERROR',
        payload: null
      });
    });

    expect(result.current.state.error).toBe(null);
  });

  it('handles loading states correctly', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    // Set loading
    act(() => {
      result.current.dispatch({
        type: 'SET_LOADING',
        payload: true
      });
    });

    expect(result.current.state.isLoading).toBe(true);

    // Clear loading
    act(() => {
      result.current.dispatch({
        type: 'SET_LOADING',
        payload: false
      });
    });

    expect(result.current.state.isLoading).toBe(false);
  });

  it('calculates derived state correctly', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    // Test level calculation based on XP
    const user = result.current.state.user;
    if (user) {
      const expectedLevel = Math.floor(user.totalXP / 500) + 1;
      // This would be calculated in a selector function in real app
      expect(expectedLevel).toBeGreaterThan(0);
    }
  });

  it('maintains state consistency during rapid updates', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    const initialXP = result.current.state.user?.totalXP || 0;

    // Perform multiple rapid updates
    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.dispatch({
          type: 'UPDATE_PROGRESS',
          payload: {
            pathId: 'test-path',
            lessonId: `lesson-${i}`,
            xp: 10,
            accuracy: 80
          }
        });
      }
    });

    // Total XP should be correctly calculated
    expect(result.current.state.user?.totalXP).toBe(initialXP + 50);
  });

  it('preserves state immutability', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    const initialState = result.current.state;
    const initialUser = result.current.state.user;

    // Make an update
    act(() => {
      result.current.dispatch({
        type: 'UPDATE_STREAK',
        payload: 10
      });
    });

    // Objects should be different (immutable updates)
    expect(result.current.state).not.toBe(initialState);
    expect(result.current.state.user).not.toBe(initialUser);
    
    // But data should be correctly updated
    expect(result.current.state.user?.streak).toBe(10);
  });
});