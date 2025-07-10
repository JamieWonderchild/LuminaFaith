import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with React Native specific configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage for session persistence
    storage: AsyncStorage,
    // Automatically refresh sessions
    autoRefreshToken: true,
    // Persist sessions across app restarts
    persistSession: true,
    // Detect session in URL (for deep linking)
    detectSessionInUrl: false,
  },
  // Real-time configuration
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database type definitions (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          streak: number;
          total_xp: number;
          current_level: number;
          daily_goal: number;
          created_at: string;
          updated_at: string;
          last_active_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          streak?: number;
          total_xp?: number;
          current_level?: number;
          daily_goal?: number;
          created_at?: string;
          updated_at?: string;
          last_active_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          streak?: number;
          total_xp?: number;
          current_level?: number;
          daily_goal?: number;
          created_at?: string;
          updated_at?: string;
          last_active_at?: string;
        };
      };
      religions: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          icon: string;
          color: string;
          description: string;
          total_paths: number;
          estimated_duration: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          icon: string;
          color: string;
          description: string;
          total_paths?: number;
          estimated_duration?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          icon?: string;
          color?: string;
          description?: string;
          total_paths?: number;
          estimated_duration?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      learning_paths: {
        Row: {
          id: string;
          religion_id: string;
          title: string;
          description: string;
          level: 'beginner' | 'intermediate' | 'advanced';
          total_lessons: number;
          estimated_time: number | null;
          prerequisites: string[] | null;
          order_index: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          religion_id: string;
          title: string;
          description: string;
          level: 'beginner' | 'intermediate' | 'advanced';
          total_lessons?: number;
          estimated_time?: number | null;
          prerequisites?: string[] | null;
          order_index: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          religion_id?: string;
          title?: string;
          description?: string;
          level?: 'beginner' | 'intermediate' | 'advanced';
          total_lessons?: number;
          estimated_time?: number | null;
          prerequisites?: string[] | null;
          order_index?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          path_id: string;
          title: string;
          description: string;
          type: 'reading' | 'quiz' | 'matching' | 'audio' | 'video' | 'interactive' | 'reflection' | 'practice';
          content: any; // JSONB
          duration: number;
          xp_reward: number;
          prerequisites: string[] | null;
          order_index: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          path_id: string;
          title: string;
          description: string;
          type: 'reading' | 'quiz' | 'matching' | 'audio' | 'video' | 'interactive' | 'reflection' | 'practice';
          content: any;
          duration: number;
          xp_reward?: number;
          prerequisites?: string[] | null;
          order_index: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          path_id?: string;
          title?: string;
          description?: string;
          type?: 'reading' | 'quiz' | 'matching' | 'audio' | 'video' | 'interactive' | 'reflection' | 'practice';
          content?: any;
          duration?: number;
          xp_reward?: number;
          prerequisites?: string[] | null;
          order_index?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          path_id: string;
          completed_lessons: number;
          current_lesson_id: string | null;
          xp_earned: number;
          accuracy: number;
          streak: number;
          last_studied_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          path_id: string;
          completed_lessons?: number;
          current_lesson_id?: string | null;
          xp_earned?: number;
          accuracy?: number;
          streak?: number;
          last_studied_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          path_id?: string;
          completed_lessons?: number;
          current_lesson_id?: string | null;
          xp_earned?: number;
          accuracy?: number;
          streak?: number;
          last_studied_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      lesson_completions: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed_at: string;
          accuracy: number | null;
          xp_earned: number;
          time_spent: number | null;
          answers: any | null; // JSONB
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          completed_at?: string;
          accuracy?: number | null;
          xp_earned: number;
          time_spent?: number | null;
          answers?: any | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          completed_at?: string;
          accuracy?: number | null;
          xp_earned?: number;
          time_spent?: number | null;
          answers?: any | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Utility function to check if Supabase is properly configured
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('religions').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};

// Utility function to get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

// Utility function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
};

export default supabase;