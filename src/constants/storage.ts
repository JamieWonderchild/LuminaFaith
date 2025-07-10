/**
 * Storage keys and configuration for LuminaFaith
 * Centralized storage management for consistency
 */

export const STORAGE_KEYS = {
  // App state persistence
  APP_STATE: '@LuminaFaith:AppState',
  
  // User preferences
  USER_PREFERENCES: '@LuminaFaith:UserPreferences',
  THEME_PREFERENCE: '@LuminaFaith:Theme',
  
  // Learning data
  LESSON_CACHE: '@LuminaFaith:LessonCache',
  OFFLINE_PROGRESS: '@LuminaFaith:OfflineProgress',
  
  // Offline caching
  CACHED_LESSON: '@LuminaFaith:CachedLesson',
  CACHE_METADATA: '@LuminaFaith:CacheMetadata',
  
  // Analytics & tracking
  ANALYTICS_CONSENT: '@LuminaFaith:AnalyticsConsent',
  LAST_SESSION: '@LuminaFaith:LastSession',
} as const;

export const STORAGE_CONFIG = {
  // Debounce time for state persistence (ms)
  PERSIST_DEBOUNCE: 1000,
  
  // Max cache size for lessons (MB)
  MAX_LESSON_CACHE_SIZE: 50,
  
  // Retention policy (days)
  CACHE_RETENTION_DAYS: 30,
} as const;