import { useEffect, useCallback } from 'react';

import { AppState } from '@/types';
import { StorageService } from '@/utils/storage';
import { STORAGE_KEYS, STORAGE_CONFIG } from '@/constants/storage';

export const usePersistence = (
  state: AppState,
  dispatch: React.Dispatch<any>
) => {
  // Load persisted state on app startup
  const loadPersistedState = useCallback(async () => {
    try {
      const persistedState = await StorageService.getItem<Partial<AppState>>(
        STORAGE_KEYS.APP_STATE
      );
      
      if (persistedState) {
        // Rehydrate dates
        const hydratedState = {
          ...persistedState,
          achievements: persistedState.achievements?.map(achievement => ({
            ...achievement,
            unlockedAt: achievement.unlockedAt 
              ? new Date(achievement.unlockedAt) 
              : undefined,
          })) || [],
        };
        
        dispatch({ type: 'HYDRATE_STATE', payload: hydratedState });
        console.log('✅ State successfully loaded from storage');
      }
    } catch (error) {
      console.error('❌ Failed to load persisted state:', error);
    }
  }, [dispatch]);

  // Save state to storage whenever it changes
  const persistState = useCallback(async (stateToSave: AppState) => {
    try {
      // Only persist essential user data
      const stateToPersist = {
        user: stateToSave.user,
        userProgress: stateToSave.userProgress,
        achievements: stateToSave.achievements.map(achievement => ({
          ...achievement,
          unlockedAt: achievement.unlockedAt?.toISOString(), // Serialize dates
        })),
        dailyChallenge: stateToSave.dailyChallenge,
        // Don't persist UI state, loading states, errors, etc.
      };
      
      const success = await StorageService.setItem(
        STORAGE_KEYS.APP_STATE, 
        stateToPersist
      );
      
      if (success) {
        console.log('💾 State persisted successfully');
      }
    } catch (error) {
      console.error('❌ Failed to persist state:', error);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadPersistedState();
  }, [loadPersistedState]);

  // Persist on state changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      persistState(state);
    }, STORAGE_CONFIG.PERSIST_DEBOUNCE);

    return () => clearTimeout(timeoutId);
  }, [state, persistState]);

  // Clear storage utility (for development/logout)
  const clearPersistedState = useCallback(async () => {
    try {
      const success = await StorageService.removeItem(STORAGE_KEYS.APP_STATE);
      if (success) {
        console.log('🗑️ Persisted state cleared');
      }
    } catch (error) {
      console.error('❌ Failed to clear persisted state:', error);
    }
  }, []);

  return { 
    loadPersistedState, 
    persistState, 
    clearPersistedState 
  };
};