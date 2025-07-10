import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { AppProvider } from '@/store/AppContext';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };

// Mock data for tests
export const mockUser = {
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  streak: 5,
  totalXP: 1000,
  currentLevel: 2,
  selectedReligions: ['buddhism'],
  preferences: {
    notifications: true,
    soundEnabled: true,
    darkMode: false,
    language: 'en',
    difficultyLevel: 'beginner' as const,
    dailyGoal: 15
  },
  createdAt: new Date('2024-01-01'),
  lastActiveAt: new Date()
};

export const mockLesson = {
  id: 'test-lesson-1',
  pathId: 'test-path-1',
  title: 'Test Lesson',
  description: 'A test lesson for unit testing',
  type: 'quiz' as const,
  content: {
    text: 'This is test content',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice' as const,
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: '4',
        explanation: 'Basic math',
        difficulty: 'easy' as const,
        tags: ['math']
      }
    ]
  },
  duration: 5,
  xpReward: 25,
  isCompleted: false
};

export const mockPath = {
  id: 'test-path-1',
  religionId: 'buddhism',
  title: 'Test Path',
  description: 'A test learning path',
  level: 'beginner' as const,
  totalLessons: 5,
  estimatedTime: '10 minutes',
  lessons: [mockLesson],
  progress: {
    completedLessons: 1,
    totalLessons: 5,
    xpEarned: 25,
    accuracy: 80,
    streak: 2
  }
};

// Helper functions for tests
export const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  canGoBack: jest.fn(() => true),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
});

export const createMockRoute = (params: any = {}) => ({
  key: 'test-route',
  name: 'TestScreen',
  params,
});

// Animation testing helpers
export const advanceAnimationsByTime = (time: number) => {
  jest.advanceTimersByTime(time);
};

export const flushMicrotasksQueue = () => {
  return new Promise(resolve => setImmediate(resolve));
};