import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AppProvider, useApp, useUser } from '../AppContext';

// Wrapper component for testing hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe('AppContext', () => {
  it('provides initial state correctly', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    expect(result.current.state.user).toBeDefined();
    expect(result.current.state.religions).toHaveLength(6);
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toBe(null);
  });

  it('updates user streak correctly', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: 'UPDATE_STREAK',
        payload: 10
      });
    });

    expect(result.current.state.user?.streak).toBe(10);
  });

  it('updates progress correctly', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: 'UPDATE_PROGRESS',
        payload: {
          pathId: 'test-path',
          lessonId: 'test-lesson',
          xp: 50,
          accuracy: 90
        }
      });
    });

    expect(result.current.state.userProgress['test-path']).toBeDefined();
    expect(result.current.state.user?.totalXP).toBeGreaterThan(1250);
  });

  it('completes lesson correctly', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: 'COMPLETE_LESSON',
        payload: {
          pathId: 'buddhism-basics',
          lessonId: 'test-lesson'
        }
      });
    });

    const progress = result.current.state.userProgress['buddhism-basics'];
    expect(progress.completedLessons).toBe(3); // Should increment from initial 2
  });

  it('sets loading state correctly', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: 'SET_LOADING',
        payload: true
      });
    });

    expect(result.current.state.isLoading).toBe(true);

    act(() => {
      result.current.dispatch({
        type: 'SET_LOADING',
        payload: false
      });
    });

    expect(result.current.state.isLoading).toBe(false);
  });

  it('sets error state correctly', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    const errorMessage = 'Test error message';

    act(() => {
      result.current.dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
    });

    expect(result.current.state.error).toBe(errorMessage);

    act(() => {
      result.current.dispatch({
        type: 'SET_ERROR',
        payload: null
      });
    });

    expect(result.current.state.error).toBe(null);
  });

  it('unlocks achievement correctly', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    const achievementId = 'achievement-3'; // Initially locked

    act(() => {
      result.current.dispatch({
        type: 'UNLOCK_ACHIEVEMENT',
        payload: result.current.state.achievements.find(a => a.id === achievementId)!
      });
    });

    const achievement = result.current.state.achievements.find(a => a.id === achievementId);
    expect(achievement?.isUnlocked).toBe(true);
    expect(achievement?.unlockedAt).toBeDefined();
  });
});

describe('useUser hook', () => {
  it('returns user from context', () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current?.name).toBe('Spiritual Seeker');
    expect(result.current?.streak).toBeDefined();
    expect(result.current?.totalXP).toBeDefined();
  });

  it('throws error when used outside provider', () => {
    // Mock console.error to prevent error logging during test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useUser());
    }).toThrow('useApp must be used within an AppProvider');

    consoleSpy.mockRestore();
  });
});