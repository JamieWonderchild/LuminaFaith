// Core data types for LuminaFaith

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  streak: number;
  totalXP: number;
  currentLevel: number;
  selectedReligions: string[];
  preferences: UserPreferences;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface UserPreferences {
  notifications: boolean;
  soundEnabled: boolean;
  darkMode: boolean;
  language: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  dailyGoal: number; // minutes per day
}

export interface Religion {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  description: string;
  totalPaths: number;
  estimatedDuration: string; // "2-3 months"
}

export interface LearningPath {
  id: string;
  religionId: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  totalLessons: number;
  estimatedTime: string; // "15 minutes"
  prerequisites?: string[];
  lessons: Lesson[];
  progress: PathProgress;
}

export interface Lesson {
  id: string;
  pathId: string;
  title: string;
  description: string;
  type: LessonType;
  content: LessonContent;
  duration: number; // minutes
  xpReward: number;
  prerequisites?: string[];
  isCompleted: boolean;
  completedAt?: Date;
  accuracy?: number;
  religion?: string; // Added for offline cache identification
}

export type LessonType = 
  | 'reading'
  | 'quiz'
  | 'matching'
  | 'audio'
  | 'video'
  | 'interactive'
  | 'reflection'
  | 'practice';

export interface LessonContent {
  text?: string;
  audio?: string;
  video?: string;
  images?: string[];
  questions?: Question[];
  activities?: Activity[];
  references?: Reference[];
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'matching' | 'ordering';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface Activity {
  id: string;
  type: 'meditation' | 'prayer' | 'ritual' | 'reflection' | 'discussion';
  title: string;
  instructions: string;
  duration?: number;
  materials?: string[];
}

export interface Reference {
  title: string;
  author?: string;
  source: string;
  url?: string;
  type: 'scripture' | 'scholarly' | 'traditional' | 'modern';
}

export interface PathProgress {
  completedLessons: number;
  totalLessons: number;
  currentLessonId?: string;
  xpEarned: number;
  accuracy: number;
  streak: number;
  lastStudied?: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'completion' | 'accuracy' | 'participation' | 'milestone';
  requirement: number;
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  lessonId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  accuracy: number;
  xpEarned: number;
  questionsAnswered: number;
  questionsCorrect: number;
}

export interface DailyChallenge {
  id: string;
  date: Date;
  type: 'quiz' | 'reading' | 'reflection' | 'practice';
  title: string;
  description: string;
  xpReward: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  type: 'study-group' | 'discussion' | 'interfaith' | 'regional';
  memberCount: number;
  isPrivate: boolean;
  moderators: string[];
  createdAt: Date;
}

export interface Discussion {
  id: string;
  communityId: string;
  authorId: string;
  title: string;
  content: string;
  tags: string[];
  replies: Reply[];
  likes: number;
  isStickied: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reply {
  id: string;
  discussionId: string;
  authorId: string;
  content: string;
  likes: number;
  createdAt: Date;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Lesson: {
    lessonId: string;
    pathId: string;
  };
  Quiz: {
    lessonId: string;
    questions: Question[];
  };
  Results: {
    sessionId: string;
    xpEarned: number;
    accuracy: number;
  };
  Profile: undefined;
  Settings: undefined;
  Community: {
    communityId?: string;
  };
  Discussion: {
    discussionId: string;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Paths: undefined;
  Community: undefined;
  Profile: undefined;
};

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// App State types
export interface AppState {
  user: User | null;
  currentPath: LearningPath | null;
  currentLesson: Lesson | null;
  religions: Religion[];
  learningPaths?: LearningPath[];
  userProgress: Record<string, PathProgress>;
  achievements: Achievement[];
  dailyChallenge: DailyChallenge | null;
  isLoading: boolean;
  error: string | null;
}