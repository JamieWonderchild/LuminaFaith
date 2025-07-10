import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

import { AppState, User, LearningPath, Lesson, Achievement, DailyChallenge } from '@/types';
import { usePersistence } from '@/hooks/usePersistence';
import { authService } from '@/services/AuthService';
import { lessonsService } from '@/services/LessonsService';
import { analytics } from '@/utils/analytics';

// Actions
type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_CURRENT_PATH'; payload: LearningPath }
  | { type: 'SET_CURRENT_LESSON'; payload: Lesson }
  | { type: 'UPDATE_PROGRESS'; payload: { pathId: string; lessonId: string; xp: number; accuracy: number } }
  | { type: 'COMPLETE_LESSON'; payload: { pathId: string; lessonId: string } }
  | { type: 'UPDATE_STREAK'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: Achievement }
  | { type: 'SET_DAILY_CHALLENGE'; payload: DailyChallenge }
  | { type: 'SET_RELIGIONS'; payload: any[] }
  | { type: 'SET_LEARNING_PATHS'; payload: LearningPath[] }
  | { type: 'SET_ACHIEVEMENTS'; payload: Achievement[] }
  | { type: 'HYDRATE_STATE'; payload: Partial<AppState> }
  | { type: 'INITIALIZE_APP' };

// Initial state
const initialState: AppState = {
  user: null,
  currentPath: null,
  currentLesson: null,
  religions: [],
  userProgress: {},
  achievements: [],
  dailyChallenge: null,
  isLoading: true,
  error: null
};

// Sample user data
const sampleUser: User = {
  id: 'user-1',
  name: 'Spiritual Seeker',
  email: 'seeker@luminafaith.com',
  streak: 7,
  totalXP: 1250,
  currentLevel: 3,
  selectedReligions: ['buddhism', 'christianity', 'interfaith'],
  preferences: {
    notifications: true,
    soundEnabled: true,
    darkMode: false,
    language: 'en',
    difficultyLevel: 'beginner',
    dailyGoal: 15
  },
  createdAt: new Date('2024-01-15'),
  lastActiveAt: new Date()
};

// Sample daily challenge
const sampleDailyChallenge: DailyChallenge = {
  id: 'daily-1',
  date: new Date(),
  type: 'reflection',
  title: 'Mindful Moment',
  description: 'Take 3 minutes to practice mindful breathing and reflect on gratitude.',
  xpReward: 30,
  isCompleted: false
};

// Sample achievements
const sampleAchievements: Achievement[] = [
  {
    id: 'achievement-1',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🌟',
    category: 'completion',
    requirement: 1,
    xpReward: 50,
    isUnlocked: true,
    unlockedAt: new Date('2024-01-16')
  },
  {
    id: 'achievement-2',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'streak',
    requirement: 7,
    xpReward: 100,
    isUnlocked: true,
    unlockedAt: new Date('2024-01-22')
  },
  {
    id: 'achievement-3',
    title: 'Scholar',
    description: 'Complete 10 lessons with 90% accuracy',
    icon: '📚',
    category: 'accuracy',
    requirement: 10,
    xpReward: 200,
    isUnlocked: false
  }
];

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'INITIALIZE_APP':
      return {
        ...state,
        isLoading: false,
      };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_CURRENT_PATH':
      return { ...state, currentPath: action.payload };
    
    case 'SET_CURRENT_LESSON':
      return { ...state, currentLesson: action.payload };
    
    case 'SET_RELIGIONS':
      return { ...state, religions: action.payload };
    
    case 'SET_LEARNING_PATHS':
      return { ...state, learningPaths: action.payload };
    
    case 'SET_ACHIEVEMENTS':
      return { ...state, achievements: action.payload };
    
    case 'UPDATE_PROGRESS':
      const { pathId, lessonId, xp, accuracy } = action.payload;
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          [pathId]: {
            ...state.userProgress[pathId],
            xpEarned: (state.userProgress[pathId]?.xpEarned || 0) + xp,
            accuracy: ((state.userProgress[pathId]?.accuracy || 0) + accuracy) / 2
          }
        },
        user: state.user ? {
          ...state.user,
          totalXP: state.user.totalXP + xp
        } : null
      };
    
    case 'COMPLETE_LESSON':
      const { pathId: completedPathId, lessonId: completedLessonId } = action.payload;
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          [completedPathId]: {
            ...state.userProgress[completedPathId],
            completedLessons: (state.userProgress[completedPathId]?.completedLessons || 0) + 1,
            lastStudied: new Date()
          }
        }
      };
    
    case 'UPDATE_STREAK':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          streak: action.payload
        } : null
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievements: state.achievements.map(achievement =>
          achievement.id === action.payload.id 
            ? { ...achievement, isUnlocked: true, unlockedAt: new Date() }
            : achievement
        )
      };
    
    case 'SET_DAILY_CHALLENGE':
      return { ...state, dailyChallenge: action.payload };
    
    case 'HYDRATE_STATE':
      // Merge persisted state with current state, preserving non-persistent data
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: null,
      };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  clearPersistedState: () => Promise<void>;
} | null>(null);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Integrate persistence
  const { loadPersistedState, clearPersistedState } = usePersistence(state, dispatch);

  // Intelligent preloading for better performance
  const startIntelligentPreloading = async (userId: string, religions: any[]) => {
    try {
      console.log('🧠 Starting intelligent preloading for user:', userId);
      
      // Get user's progress to determine what to preload
      const userProgress = await lessonsService.getUserProgress(userId);
      
      // Preload user's active/current lessons first (high priority)
      if (userProgress.length > 0) {
        const activeLessons = userProgress
          .filter(p => p.current_lesson_id)
          .map(p => p.current_lesson_id)
          .filter(Boolean);
        
        if (activeLessons.length > 0) {
          console.log('🎯 Preloading active lessons:', activeLessons.length);
          await lessonsService.preloadLessons(activeLessons);
        }
        
        // Preload next lessons for each active path
        for (const progress of userProgress) {
          if (progress.current_lesson_id) {
            // Don't await - background optimization
            lessonsService.preloadNextLessons(userId, progress.path_id, 3);
          }
        }
      }
      
      // Preload recommended lessons (medium priority)
      const recommendedLessons = await lessonsService.getRecommendedLessons(userId, 5);
      if (recommendedLessons.length > 0) {
        console.log('💡 Preloading recommended lessons:', recommendedLessons.length);
        const recommendedIds = recommendedLessons.map(l => l.id);
        // Don't await - background optimization
        lessonsService.preloadLessons(recommendedIds);
      }
      
      // Start background preloading for popular religions (low priority)
      const popularReligions = religions.slice(0, 3); // Top 3 religions
      for (const religion of popularReligions) {
        // Don't await - background optimization
        lessonsService.preloadReligionLessons(religion.id);
      }
      
      console.log('✅ Intelligent preloading initialized');
    } catch (error) {
      console.error('❌ Intelligent preloading failed:', error);
      // Don't throw - this is optimization, not critical
    }
  };

  useEffect(() => {
    // Initialize app with Supabase data
    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Initialize analytics
        analytics.initialize();
        
        // Load persisted state first
        await loadPersistedState();
        
        // Load religions from Supabase
        console.log('🔄 Loading religions from Supabase...');
        const religions = await lessonsService.getReligions();
        dispatch({ type: 'SET_RELIGIONS', payload: religions });
        
        // Check for authenticated user
        const session = await authService.getCurrentSession();
        if (session?.user) {
          console.log('✅ User authenticated, loading profile...');
          const userProfile = await authService.getUserProfile(session.user.id);
          if (userProfile) {
            // Convert Supabase user to app user format
            const appUser = {
              id: userProfile.id,
              name: userProfile.name,
              email: userProfile.email,
              streak: userProfile.streak,
              totalXP: userProfile.total_xp,
              currentLevel: userProfile.current_level,
              selectedReligions: [], // Will be populated from user preferences
              preferences: {
                notifications: true,
                soundEnabled: true,
                darkMode: false,
                language: 'en',
                difficultyLevel: 'beginner' as const,
                dailyGoal: userProfile.daily_goal
              },
              createdAt: new Date(userProfile.created_at),
              lastActiveAt: new Date(userProfile.last_active_at)
            };
            dispatch({ type: 'SET_USER', payload: appUser });
            
            // Start intelligent preloading for the user
            startIntelligentPreloading(appUser.id, religions);
            
            // Load achievements
            // Note: You'd need to implement getUserAchievements method in lessonsService
            // const achievements = await lessonsService.getUserAchievements(session.user.id);
            // dispatch({ type: 'SET_ACHIEVEMENTS', payload: achievements });
          }
        } else {
          console.log('🆕 No authenticated user found');
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
        console.log('✅ App initialized with Supabase data');
        
      } catch (error) {
        console.error('Failed to initialize app:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load app data' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeApp();
  }, [loadPersistedState]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = authService.onAuthStateChange(async (session) => {
      if (session?.user) {
        const userProfile = await authService.getUserProfile(session.user.id);
        if (userProfile) {
          const appUser = {
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            streak: userProfile.streak,
            totalXP: userProfile.total_xp,
            currentLevel: userProfile.current_level,
            selectedReligions: [],
            preferences: {
              notifications: true,
              soundEnabled: true,
              darkMode: false,
              language: 'en',
              difficultyLevel: 'beginner' as const,
              dailyGoal: userProfile.daily_goal
            },
            createdAt: new Date(userProfile.created_at),
            lastActiveAt: new Date(userProfile.last_active_at)
          };
          dispatch({ type: 'SET_USER', payload: appUser });
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Expose clear function for development/logout
  const contextValue = {
    state,
    dispatch,
    clearPersistedState,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Selector hooks for specific data
export function useUser() {
  const { state } = useApp();
  return state.user;
}

export function useCurrentPath() {
  const { state } = useApp();
  return state.currentPath;
}

export function useUserProgress() {
  const { state } = useApp();
  return state.userProgress;
}

export function useAchievements() {
  const { state } = useApp();
  return state.achievements;
}

export function useDailyChallenge() {
  const { state } = useApp();
  return state.dailyChallenge;
}

export function useReligions() {
  const { state } = useApp();
  return state.religions;
}

export function useLearningPaths() {
  const { state } = useApp();
  return state.learningPaths || [];
}