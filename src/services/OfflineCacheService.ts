import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';
import { Lesson } from '@/types';
import { analytics } from '@/utils/analytics';

interface CachedLesson extends Lesson {
  cachedAt: string;
  lastAccessed: string;
  downloadSize: number;
  priority: 'high' | 'medium' | 'low';
}

interface CacheMetadata {
  totalSize: number;
  lessonCount: number;
  lastCleanup: string;
  maxSize: number; // in bytes
}

export class OfflineCacheService {
  private static instance: OfflineCacheService;
  private maxCacheSize = 50 * 1024 * 1024; // 50MB default
  private maxLessons = 100;

  static getInstance(): OfflineCacheService {
    if (!OfflineCacheService.instance) {
      OfflineCacheService.instance = new OfflineCacheService();
    }
    return OfflineCacheService.instance;
  }

  /**
   * Cache a lesson for offline access
   */
  async cacheLesson(lesson: Lesson, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<boolean> {
    try {
      const cachedLesson: CachedLesson = {
        ...lesson,
        cachedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        downloadSize: this.estimateLessonSize(lesson),
        priority,
      };

      // Check if we have space
      const canCache = await this.ensureSpaceAvailable(cachedLesson.downloadSize);
      if (!canCache) {
        console.log('🚫 Insufficient space for caching lesson:', lesson.id);
        return false;
      }

      // Store the lesson
      const cacheKey = `${STORAGE_KEYS.CACHED_LESSON}:${lesson.id}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedLesson));

      // Update metadata
      await this.updateCacheMetadata(cachedLesson.downloadSize, 1);

      console.log('💾 Lesson cached successfully:', lesson.title);
      
      // Track analytics
      analytics.logEvent('lesson_cached', {
        lesson_id: lesson.id,
        religion: lesson.religion || 'unknown',
        priority,
        size_mb: (cachedLesson.downloadSize / 1024 / 1024).toFixed(2),
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to cache lesson:', error);
      return false;
    }
  }

  /**
   * Get a cached lesson
   */
  async getCachedLesson(lessonId: string): Promise<CachedLesson | null> {
    try {
      const cacheKey = `${STORAGE_KEYS.CACHED_LESSON}:${lessonId}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedData) {
        return null;
      }

      const cachedLesson: CachedLesson = JSON.parse(cachedData);
      
      // Update last accessed time
      cachedLesson.lastAccessed = new Date().toISOString();
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedLesson));

      console.log('📖 Retrieved cached lesson:', cachedLesson.title);
      return cachedLesson;
    } catch (error) {
      console.error('❌ Failed to get cached lesson:', error);
      return null;
    }
  }

  /**
   * Check if a lesson is cached
   */
  async isLessonCached(lessonId: string): Promise<boolean> {
    try {
      const cacheKey = `${STORAGE_KEYS.CACHED_LESSON}:${lessonId}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      return cachedData !== null;
    } catch (error) {
      console.error('❌ Failed to check lesson cache:', error);
      return false;
    }
  }

  /**
   * Get all cached lessons
   */
  async getAllCachedLessons(): Promise<CachedLesson[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const lessonKeys = keys.filter(key => key.startsWith(`${STORAGE_KEYS.CACHED_LESSON}:`));
      
      const cachedLessons: CachedLesson[] = [];
      
      for (const key of lessonKeys) {
        const cachedData = await AsyncStorage.getItem(key);
        if (cachedData) {
          cachedLessons.push(JSON.parse(cachedData));
        }
      }

      // Sort by priority and last accessed
      return cachedLessons.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
      });
    } catch (error) {
      console.error('❌ Failed to get cached lessons:', error);
      return [];
    }
  }

  /**
   * Remove a lesson from cache
   */
  async removeCachedLesson(lessonId: string): Promise<boolean> {
    try {
      const cacheKey = `${STORAGE_KEYS.CACHED_LESSON}:${lessonId}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (cachedData) {
        const cachedLesson: CachedLesson = JSON.parse(cachedData);
        await AsyncStorage.removeItem(cacheKey);
        
        // Update metadata
        await this.updateCacheMetadata(-cachedLesson.downloadSize, -1);
        
        console.log('🗑️ Removed cached lesson:', lessonId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to remove cached lesson:', error);
      return false;
    }
  }

  /**
   * Smart cache cleanup - removes least important lessons
   */
  async cleanupCache(): Promise<void> {
    try {
      console.log('🧹 Starting cache cleanup...');
      
      const cachedLessons = await this.getAllCachedLessons();
      const metadata = await this.getCacheMetadata();
      
      // If we're under limits, no cleanup needed
      if (metadata.totalSize <= this.maxCacheSize && metadata.lessonCount <= this.maxLessons) {
        console.log('✅ Cache within limits, no cleanup needed');
        return;
      }

      // Sort by removal priority (oldest, low priority first)
      const lessonsToRemove = cachedLessons
        .filter(lesson => lesson.priority !== 'high') // Never remove high priority
        .sort((a, b) => {
          // Prioritize removal: low priority + old lessons
          const priorityWeight = { low: 3, medium: 2, high: 1 };
          const ageWeight = new Date().getTime() - new Date(a.lastAccessed).getTime();
          const bAgeWeight = new Date().getTime() - new Date(b.lastAccessed).getTime();
          
          return (priorityWeight[a.priority] * ageWeight) - (priorityWeight[b.priority] * bAgeWeight);
        });

      // Remove lessons until we're under limits
      let removedCount = 0;
      for (const lesson of lessonsToRemove) {
        const currentMetadata = await this.getCacheMetadata();
        
        if (currentMetadata.totalSize <= this.maxCacheSize * 0.8 && 
            currentMetadata.lessonCount <= this.maxLessons * 0.8) {
          break; // We've freed enough space
        }
        
        await this.removeCachedLesson(lesson.id);
        removedCount++;
      }

      // Update cleanup timestamp
      await this.updateCacheMetadata(0, 0, new Date().toISOString());
      
      console.log(`🧹 Cache cleanup complete: removed ${removedCount} lessons`);
      
      analytics.logEvent('cache_cleanup', {
        lessons_removed: removedCount,
        total_cached: cachedLessons.length - removedCount,
      });
    } catch (error) {
      console.error('❌ Cache cleanup failed:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalLessons: number;
    totalSize: string;
    maxSize: string;
    usagePercentage: number;
    lastCleanup: string;
  }> {
    try {
      const metadata = await this.getCacheMetadata();
      
      return {
        totalLessons: metadata.lessonCount,
        totalSize: this.formatBytes(metadata.totalSize),
        maxSize: this.formatBytes(metadata.maxSize),
        usagePercentage: Math.round((metadata.totalSize / metadata.maxSize) * 100),
        lastCleanup: metadata.lastCleanup,
      };
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
      return {
        totalLessons: 0,
        totalSize: '0 B',
        maxSize: this.formatBytes(this.maxCacheSize),
        usagePercentage: 0,
        lastCleanup: 'Never',
      };
    }
  }

  /**
   * Clear all cached lessons
   */
  async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const lessonKeys = keys.filter(key => key.startsWith(`${STORAGE_KEYS.CACHED_LESSON}:`));
      
      await AsyncStorage.multiRemove(lessonKeys);
      await AsyncStorage.removeItem(STORAGE_KEYS.CACHE_METADATA);
      
      console.log('🗑️ All cached lessons cleared');
      
      analytics.logEvent('cache_cleared', {
        lessons_removed: lessonKeys.length,
      });
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }

  // Private helper methods

  private async getCacheMetadata(): Promise<CacheMetadata> {
    try {
      const metadata = await AsyncStorage.getItem(STORAGE_KEYS.CACHE_METADATA);
      if (metadata) {
        return JSON.parse(metadata);
      }
      
      // Return default metadata
      return {
        totalSize: 0,
        lessonCount: 0,
        lastCleanup: new Date().toISOString(),
        maxSize: this.maxCacheSize,
      };
    } catch (error) {
      console.error('❌ Failed to get cache metadata:', error);
      return {
        totalSize: 0,
        lessonCount: 0,
        lastCleanup: new Date().toISOString(),
        maxSize: this.maxCacheSize,
      };
    }
  }

  private async updateCacheMetadata(
    sizeChange: number, 
    countChange: number, 
    cleanupTime?: string
  ): Promise<void> {
    try {
      const current = await this.getCacheMetadata();
      
      const updated: CacheMetadata = {
        totalSize: Math.max(0, current.totalSize + sizeChange),
        lessonCount: Math.max(0, current.lessonCount + countChange),
        lastCleanup: cleanupTime || current.lastCleanup,
        maxSize: this.maxCacheSize,
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.CACHE_METADATA, JSON.stringify(updated));
    } catch (error) {
      console.error('❌ Failed to update cache metadata:', error);
    }
  }

  private async ensureSpaceAvailable(requiredSize: number): Promise<boolean> {
    const metadata = await this.getCacheMetadata();
    
    if (metadata.totalSize + requiredSize > this.maxCacheSize) {
      // Try cleanup first
      await this.cleanupCache();
      
      const updatedMetadata = await this.getCacheMetadata();
      return updatedMetadata.totalSize + requiredSize <= this.maxCacheSize;
    }
    
    return true;
  }

  private estimateLessonSize(lesson: Lesson): number {
    // Rough estimation based on content
    const baseSize = 1024; // 1KB base
    const textSize = (lesson.description?.length || 0) * 2; // 2 bytes per char
    const questionsSize = (lesson.content.questions?.length || 0) * 500; // 500 bytes per question
    
    return baseSize + textSize + questionsSize;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const offlineCache = OfflineCacheService.getInstance();