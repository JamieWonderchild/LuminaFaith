import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { usePersistence } from '../usePersistence';
import { STORAGE_KEYS } from '@/constants/storage';
import { AppState } from '@/types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock console to avoid noise in tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  error: jest.fn(),
};

describe('usePersistence', () => {
  const mockDispatch = jest.fn();
  const mockState: AppState = {
    user: {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      streak: 5,
      totalXP: 1000,
      currentLevel: 2,
      selectedReligions: ['buddhism'],
      preferences: {
        notifications: true,
        soundEnabled: true,
        darkMode: true,
        language: 'en',
        difficultyLevel: 'beginner',
        dailyGoal: 15,
      },
      createdAt: new Date('2024-01-01'),
      lastActiveAt: new Date('2024-01-15'),
    },
    currentPath: null,
    currentLesson: null,
    religions: [],
    userProgress: {
      'buddhism-basics': {
        completedLessons: 3,
        totalLessons: 10,
        xpEarned: 300,
        accuracy: 85,
        streak: 3,
        lastStudied: new Date('2024-01-15'),
      },
    },
    achievements: [
      {
        id: 'achievement-1',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🌟',
        category: 'completion',
        requirement: 1,
        xpReward: 50,
        isUnlocked: true,
        unlockedAt: new Date('2024-01-02'),
      },
    ],
    dailyChallenge: {
      id: 'daily-1',
      date: new Date('2024-01-15'),
      type: 'reflection',
      title: 'Test Challenge',
      description: 'A test daily challenge',
      xpReward: 30,
      isCompleted: false,
    },
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load persisted state successfully', async () => {
    const persistedData = {
      user: mockState.user,
      userProgress: mockState.userProgress,
      achievements: mockState.achievements.map(a => ({
        ...a,
        unlockedAt: a.unlockedAt?.toISOString(),
      })),
      dailyChallenge: mockState.dailyChallenge,
    };

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(persistedData)
    );

    const { result } = renderHook(() => usePersistence(mockState, mockDispatch));

    await act(async () => {
      await result.current.loadPersistedState();
    });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.APP_STATE);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'HYDRATE_STATE',
      payload: expect.objectContaining({
        user: expect.objectContaining({
          id: 'test-user',
          name: 'Test User',
        }),
        userProgress: expect.objectContaining({
          'buddhism-basics': expect.any(Object),
        }),
        achievements: expect.arrayContaining([
          expect.objectContaining({
            id: 'achievement-1',
          }),
        ]),
        dailyChallenge: expect.objectContaining({
          id: 'daily-1',
        }),
      }),
    });
  });

  it('should handle missing persisted state gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => usePersistence(mockState, mockDispatch));

    await act(async () => {
      await result.current.loadPersistedState();
    });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.APP_STATE);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should persist state changes', async () => {
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => usePersistence(mockState, mockDispatch));

    await act(async () => {
      await result.current.persistState(mockState);
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.APP_STATE,
      expect.stringContaining('"id":"test-user"')
    );
  });

  it('should clear persisted state', async () => {
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => usePersistence(mockState, mockDispatch));

    await act(async () => {
      await result.current.clearPersistedState();
    });

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.APP_STATE);
  });

  it('should handle persistence errors gracefully', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
      new Error('Storage error')
    );

    const { result } = renderHook(() => usePersistence(mockState, mockDispatch));

    await act(async () => {
      await result.current.persistState(mockState);
    });

    expect(console.error).toHaveBeenCalledWith(
      'Failed to store @LuminaFaith:AppState:',
      expect.any(Error)
    );
  });
});