import { supabase } from '@/config/supabase';
import { analytics } from '@/utils/analytics';
import { errorHandler } from './ErrorHandlingService';
import { offlineCache } from './OfflineCacheService';

export interface Religion {
  id: string;
  name: string;
  display_name: string;
  icon: string;
  color: string;
  description: string;
  total_paths: number;
  estimated_duration?: string;
  is_active: boolean;
  created_at: string;
}

export interface LearningPath {
  id: string;
  religion_id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  total_lessons: number;
  estimated_time?: number;
  prerequisites?: string[];
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  religion?: Religion; // joined data
}

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
  correct_answer: string | string[];
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

export interface Lesson {
  id: string;
  path_id: string;
  title: string;
  description: string;
  type: 'reading' | 'quiz' | 'matching' | 'audio' | 'video' | 'interactive' | 'reflection' | 'practice';
  content: LessonContent;
  duration: number;
  xp_reward: number;
  prerequisites?: string[];
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  religion?: string; // for offline cache compatibility
}

export interface UserProgress {
  id: string;
  user_id: string;
  path_id: string;
  completed_lessons: number;
  current_lesson_id?: string;
  xp_earned: number;
  accuracy: number;
  streak: number;
  last_studied_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LessonCompletion {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
  accuracy?: number;
  xp_earned: number;
  time_spent?: number;
  answers?: any;
}

class LessonsService {
  /**
   * Get all active religions
   */
  async getReligions(): Promise<Religion[]> {
    try {
      const { data, error } = await supabase
        .from('religions')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      analytics.logEvent('religions_fetched', {
        count: data?.length || 0,
      });

      return data || [];
    } catch (error) {
      console.error('Get religions error:', error);
      throw error;
    }
  }

  /**
   * Get learning paths for a religion
   */
  async getLearningPaths(religionId: string, level?: string): Promise<LearningPath[]> {
    try {
      let query = supabase
        .from('learning_paths')
        .select(`
          *,
          religion:religions(*)
        `)
        .eq('religion_id', religionId)
        .eq('is_published', true)
        .order('order_index');

      if (level) {
        query = query.eq('level', level);
      }

      const { data, error } = await query;
      if (error) throw error;

      analytics.logEvent('learning_paths_fetched', {
        religion_id: religionId,
        level: level || 'all',
        count: data?.length || 0,
      });

      return data || [];
    } catch (error) {
      console.error('Get learning paths error:', error);
      throw error;
    }
  }

  /**
   * Get lessons for a learning path
   */
  async getLessons(pathId: string): Promise<Lesson[]> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('path_id', pathId)
        .eq('is_published', true)
        .order('order_index');

      if (error) throw error;

      // Add religion field for offline cache compatibility
      const lessons = data?.map(lesson => ({
        ...lesson,
        religion: 'general', // This would be populated from the path's religion
      })) || [];

      analytics.logEvent('lessons_fetched', {
        path_id: pathId,
        count: lessons.length,
      });

      return lessons;
    } catch (error) {
      console.error('Get lessons error:', error);
      throw error;
    }
  }

  /**
   * Get a specific lesson by ID
   */
  async getLesson(lessonId: string): Promise<Lesson | null> {
    try {
      // Try to get from cache first
      const cachedLesson = await offlineCache.getCachedLesson(lessonId);
      if (cachedLesson) {
        analytics.logEvent('lesson_viewed', {
          lesson_id: lessonId,
          lesson_type: cachedLesson.type,
          source: 'cache',
        });
        return cachedLesson;
      }

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('is_published', true)
        .single();

      if (error) throw error;

      const lesson = data ? { ...data, religion: 'general' } : null;
      
      if (lesson) {
        // Cache the lesson for offline access
        await offlineCache.cacheLesson(lesson, 'high');
        
        analytics.logEvent('lesson_viewed', {
          lesson_id: lessonId,
          lesson_type: lesson.type,
          source: 'network',
        });
      }

      return lesson;
    } catch (error) {
      console.error('Get lesson error:', error);
      
      // Use error handler for better user experience
      return await errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to load lesson'),
        {
          screen: 'LessonScreen',
          action: 'getLesson',
          lessonId,
        },
        {
          showAlert: true,
          alertTitle: 'Lesson Loading Error',
          alertMessage: 'Unable to load the lesson. Please try again.',
          enableRetry: true,
          fallbackData: null,
        }
      );
    }
  }

  /**
   * Get user progress for all paths
   */
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user progress error:', error);
      throw error;
    }
  }

  /**
   * Get user progress for a specific path
   */
  async getPathProgress(userId: string, pathId: string): Promise<UserProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('path_id', pathId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Get path progress error:', error);
      return null;
    }
  }

  /**
   * Update user progress for a path
   */
  async updateProgress(userId: string, pathId: string, updates: Partial<UserProgress>): Promise<UserProgress> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          path_id: pathId,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      analytics.logEvent('user_progress_updated', {
        user_id: userId,
        path_id: pathId,
        updates: Object.keys(updates),
      });

      return data;
    } catch (error) {
      console.error('Update progress error:', error);
      throw error;
    }
  }

  /**
   * Complete a lesson
   */
  async completeLesson(
    userId: string,
    lessonId: string,
    accuracy?: number,
    xpEarned: number = 10,
    timeSpent?: number,
    answers?: any
  ): Promise<LessonCompletion> {
    try {
      const { data, error } = await supabase
        .from('lesson_completions')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          accuracy,
          xp_earned: xpEarned,
          time_spent: timeSpent,
          answers,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update user's total XP
      const { error: userError } = await supabase.rpc('increment_user_xp', {
        user_id: userId,
        xp_amount: xpEarned,
      });

      if (userError) {
        console.error('Failed to update user XP:', userError);
      }

      analytics.logEvent('lesson_completed', {
        user_id: userId,
        lesson_id: lessonId,
        accuracy: accuracy || 0,
        xp_earned: xpEarned,
        time_spent: timeSpent || 0,
      });

      return data;
    } catch (error) {
      console.error('Complete lesson error:', error);
      throw error;
    }
  }

  /**
   * Get lesson completions for a user
   */
  async getLessonCompletions(userId: string, lessonIds?: string[]): Promise<LessonCompletion[]> {
    try {
      let query = supabase
        .from('lesson_completions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (lessonIds) {
        query = query.in('lesson_id', lessonIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get lesson completions error:', error);
      throw error;
    }
  }

  /**
   * Check if lesson is completed
   */
  async isLessonCompleted(userId: string, lessonId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('lesson_completions')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Check lesson completion error:', error);
      return false;
    }
  }

  /**
   * Get recommended lessons for user
   */
  async getRecommendedLessons(userId: string, limit: number = 5): Promise<Lesson[]> {
    try {
      // This is a simplified recommendation
      // In production, you'd use AI/ML for personalized recommendations
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          learning_paths!inner(religion_id)
        `)
        .eq('is_published', true)
        .limit(limit);

      if (error) throw error;

      analytics.logEvent('recommendations_fetched', {
        user_id: userId,
        count: data?.length || 0,
      });

      return data?.map(lesson => ({ ...lesson, religion: 'general' })) || [];
    } catch (error) {
      console.error('Get recommended lessons error:', error);
      throw error;
    }
  }

  /**
   * Search lessons by text
   */
  async searchLessons(query: string, religionId?: string): Promise<Lesson[]> {
    try {
      let dbQuery = supabase
        .from('lessons')
        .select(`
          *,
          learning_paths!inner(religion_id)
        `)
        .eq('is_published', true)
        .textSearch('title', query);

      if (religionId) {
        dbQuery = dbQuery.eq('learning_paths.religion_id', religionId);
      }

      const { data, error } = await dbQuery.limit(20);
      if (error) throw error;

      analytics.logEvent('lessons_searched', {
        query,
        religion_id: religionId || 'all',
        results_count: data?.length || 0,
      });

      return data?.map(lesson => ({ ...lesson, religion: 'general' })) || [];
    } catch (error) {
      console.error('Search lessons error:', error);
      throw error;
    }
  }

  /**
   * Preload lessons for multiple paths in parallel
   */
  async preloadLessonsForPaths(pathIds: string[]): Promise<Record<string, Lesson[]>> {
    try {
      console.log('🚀 Starting preload for', pathIds.length, 'paths');
      
      const pathPromises = pathIds.map(async (pathId) => {
        const lessons = await this.getLessons(pathId);
        return { pathId, lessons };
      });

      const results = await Promise.all(pathPromises);
      
      const lessonsMap: Record<string, Lesson[]> = {};
      results.forEach(({ pathId, lessons }) => {
        lessonsMap[pathId] = lessons;
      });

      analytics.logEvent('lessons_preloaded', {
        paths_count: pathIds.length,
        total_lessons: Object.values(lessonsMap).flat().length,
      });

      console.log('✅ Preloaded lessons for', pathIds.length, 'paths');
      return lessonsMap;
    } catch (error) {
      console.error('Preload lessons error:', error);
      throw error;
    }
  }

  /**
   * Preload multiple lessons by IDs in parallel
   */
  async preloadLessons(lessonIds: string[]): Promise<void> {
    try {
      console.log('🚀 Starting preload for', lessonIds.length, 'lessons');
      
      const lessonPromises = lessonIds.map(async (lessonId) => {
        const isAlreadyCached = await offlineCache.isLessonCached(lessonId);
        if (!isAlreadyCached) {
          return this.getLesson(lessonId);
        }
        return null;
      });

      await Promise.all(lessonPromises);
      
      analytics.logEvent('individual_lessons_preloaded', {
        lessons_count: lessonIds.length,
      });

      console.log('✅ Preloaded', lessonIds.length, 'individual lessons');
    } catch (error) {
      console.error('Preload individual lessons error:', error);
      throw error;
    }
  }

  /**
   * Preload user's next lessons based on progress
   */
  async preloadNextLessons(userId: string, pathId: string, limit: number = 3): Promise<void> {
    try {
      const userProgress = await this.getPathProgress(userId, pathId);
      const allLessons = await this.getLessons(pathId);
      
      let nextLessons: Lesson[] = [];
      
      if (userProgress && userProgress.current_lesson_id) {
        // Find the current lesson index
        const currentIndex = allLessons.findIndex(l => l.id === userProgress.current_lesson_id);
        if (currentIndex !== -1) {
          // Get the next lessons
          nextLessons = allLessons.slice(currentIndex + 1, currentIndex + 1 + limit);
        }
      } else {
        // User hasn't started, preload first few lessons
        nextLessons = allLessons.slice(0, limit);
      }

      if (nextLessons.length > 0) {
        await this.preloadLessons(nextLessons.map(l => l.id));
        console.log('✅ Preloaded next', nextLessons.length, 'lessons for user');
      }
    } catch (error) {
      console.error('Preload next lessons error:', error);
      // Don't throw - this is background optimization
    }
  }

  /**
   * Preload all lessons for a religion (background operation)
   */
  async preloadReligionLessons(religionId: string): Promise<void> {
    try {
      console.log('🚀 Starting background preload for religion:', religionId);
      
      const paths = await this.getLearningPaths(religionId);
      const pathIds = paths.map(p => p.id);
      
      // Preload in batches to avoid overwhelming the system
      const batchSize = 3;
      for (let i = 0; i < pathIds.length; i += batchSize) {
        const batch = pathIds.slice(i, i + batchSize);
        await this.preloadLessonsForPaths(batch);
        
        // Small delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      analytics.logEvent('religion_lessons_preloaded', {
        religion_id: religionId,
        paths_count: pathIds.length,
      });
      
      console.log('✅ Background preload completed for religion:', religionId);
    } catch (error) {
      console.error('Background preload error:', error);
      // Don't throw - this is background optimization
    }
  }
}

export const lessonsService = new LessonsService();
export default lessonsService;