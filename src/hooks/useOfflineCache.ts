import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { offlineCache } from '@/services/OfflineCacheService';
import { Lesson } from '@/types';
import { analytics } from '@/utils/analytics';

interface OfflineCacheHook {
  isOnline: boolean;
  cacheLesson: (lesson: Lesson, priority?: 'high' | 'medium' | 'low') => Promise<boolean>;
  getCachedLesson: (lessonId: string) => Promise<Lesson | null>;
  isLessonCached: (lessonId: string) => Promise<boolean>;
  removeCachedLesson: (lessonId: string) => Promise<boolean>;
  getCacheStats: () => Promise<any>;
  clearCache: () => Promise<void>;
  cachedLessons: Lesson[];
  loading: boolean;
  autoDownloadRecentLessons: () => Promise<void>;
}

export function useOfflineCache(): OfflineCacheHook {
  const [isOnline, setIsOnline] = useState(true);
  const [cachedLessons, setCachedLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOnline = isOnline;
      const nowOnline = state.isConnected && state.isInternetReachable;
      
      setIsOnline(!!nowOnline);
      
      // Log connectivity changes
      if (wasOnline !== nowOnline) {
        console.log(`📶 Network status changed: ${nowOnline ? 'Online' : 'Offline'}`);
        analytics.logEvent('network_status_change', {
          status: nowOnline ? 'online' : 'offline',
          connection_type: state.type,
        });
      }
    });

    return unsubscribe;
  }, [isOnline]);

  // Load cached lessons on mount
  useEffect(() => {
    loadCachedLessons();
  }, []);

  const loadCachedLessons = useCallback(async () => {
    try {
      setLoading(true);
      const cached = await offlineCache.getAllCachedLessons();
      setCachedLessons(cached);
      console.log(`📚 Loaded ${cached.length} cached lessons`);
    } catch (error) {
      console.error('❌ Failed to load cached lessons:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const cacheLesson = useCallback(async (
    lesson: Lesson, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const success = await offlineCache.cacheLesson(lesson, priority);
      
      if (success) {
        // Refresh cached lessons list
        await loadCachedLessons();
        
        analytics.logEvent('lesson_downloaded_for_offline', {
          lesson_id: lesson.id,
          religion: lesson.religion || 'unknown',
          priority,
        });
      }
      
      return success;
    } catch (error) {
      console.error('❌ Failed to cache lesson:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadCachedLessons]);

  const getCachedLesson = useCallback(async (lessonId: string): Promise<Lesson | null> => {
    try {
      const cached = await offlineCache.getCachedLesson(lessonId);
      
      if (cached) {
        analytics.logEvent('cached_lesson_accessed', {
          lesson_id: lessonId,
          is_offline: !isOnline,
        });
      }
      
      return cached;
    } catch (error) {
      console.error('❌ Failed to get cached lesson:', error);
      return null;
    }
  }, [isOnline]);

  const isLessonCached = useCallback(async (lessonId: string): Promise<boolean> => {
    try {
      return await offlineCache.isLessonCached(lessonId);
    } catch (error) {
      console.error('❌ Failed to check lesson cache:', error);
      return false;
    }
  }, []);

  const removeCachedLesson = useCallback(async (lessonId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const success = await offlineCache.removeCachedLesson(lessonId);
      
      if (success) {
        await loadCachedLessons();
        
        analytics.logEvent('cached_lesson_removed', {
          lesson_id: lessonId,
        });
      }
      
      return success;
    } catch (error) {
      console.error('❌ Failed to remove cached lesson:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadCachedLessons]);

  const getCacheStats = useCallback(async () => {
    try {
      return await offlineCache.getCacheStats();
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
      return null;
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      setLoading(true);
      await offlineCache.clearAllCache();
      setCachedLessons([]);
      
      analytics.logEvent('offline_cache_cleared', {
        cleared_by: 'user',
      });
      
      console.log('🗑️ Cache cleared by user');
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Smart auto-download: Cache recently accessed and high-priority lessons
   */
  const autoDownloadRecentLessons = useCallback(async () => {
    if (!isOnline) {
      console.log('📵 Skipping auto-download: offline');
      return;
    }

    try {
      setLoading(true);
      console.log('⬇️ Starting auto-download of recent lessons...');

      // This would typically fetch from your API
      // For now, we'll simulate with some example lessons
      const recentLessons: Lesson[] = [
        // These would come from your API based on user's recent activity
        // We'll implement this when we have the actual lesson data structure
      ];

      // Auto-cache recent lessons with medium priority
      let downloadedCount = 0;
      for (const lesson of recentLessons.slice(0, 10)) { // Limit to 10 recent
        const alreadyCached = await isLessonCached(lesson.id);
        if (!alreadyCached) {
          const success = await cacheLesson(lesson, 'medium');
          if (success) downloadedCount++;
        }
      }

      console.log(`✅ Auto-downloaded ${downloadedCount} lessons for offline access`);
      
      analytics.logEvent('auto_download_completed', {
        lessons_downloaded: downloadedCount,
        total_cached: cachedLessons.length + downloadedCount,
      });

    } catch (error) {
      console.error('❌ Auto-download failed:', error);
    } finally {
      setLoading(false);
    }
  }, [isOnline, cacheLesson, isLessonCached, cachedLessons.length]);

  // Auto-download when coming back online
  useEffect(() => {
    if (isOnline) {
      // Wait a bit to ensure stable connection
      const timer = setTimeout(() => {
        autoDownloadRecentLessons();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, autoDownloadRecentLessons]);

  return {
    isOnline,
    cacheLesson,
    getCachedLesson,
    isLessonCached,
    removeCachedLesson,
    getCacheStats,
    clearCache,
    cachedLessons,
    loading,
    autoDownloadRecentLessons,
  };
}