import { Alert } from 'react-native';
import { captureException } from '@/utils/sentry';
import { analytics } from '@/utils/analytics';
import { offlineCache } from './OfflineCacheService';

interface ErrorContext {
  screen?: string;
  action?: string;
  userId?: string;
  lessonId?: string;
  pathId?: string;
  timestamp?: string;
  isOffline?: boolean;
  retryCount?: number;
  [key: string]: any;
}

interface ErrorHandlingOptions {
  showAlert?: boolean;
  alertTitle?: string;
  alertMessage?: string;
  enableRetry?: boolean;
  maxRetries?: number;
  fallbackData?: any;
  shouldReport?: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private retryQueue: Map<string, { fn: () => Promise<any>; retries: number }> = new Map();
  private errorCounts: Map<string, number> = new Map();
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Handle errors with contextual information and user-friendly messages
   */
  async handleError(
    error: Error,
    context: ErrorContext = {},
    options: ErrorHandlingOptions = {}
  ): Promise<any> {
    const errorId = this.generateErrorId();
    const enhancedContext = {
      ...context,
      errorId,
      timestamp: new Date().toISOString(),
      isOffline: !(await this.isOnline()),
    };

    // Log error details
    console.error(`[${errorId}] Error:`, error.message, enhancedContext);

    // Track error frequency
    const errorKey = `${context.screen || 'unknown'}_${error.name}`;
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    // Report to analytics and crash reporting
    if (options.shouldReport !== false) {
      this.reportError(error, enhancedContext, options.severity || 'medium');
    }

    // Handle different error types
    if (this.isNetworkError(error)) {
      return this.handleNetworkError(error, enhancedContext, options);
    }

    if (this.isDatabaseError(error)) {
      return this.handleDatabaseError(error, enhancedContext, options);
    }

    if (this.isAuthError(error)) {
      return this.handleAuthError(error, enhancedContext, options);
    }

    if (this.isValidationError(error)) {
      return this.handleValidationError(error, enhancedContext, options);
    }

    // Generic error handling
    return this.handleGenericError(error, enhancedContext, options);
  }

  /**
   * Handle network-related errors with offline fallback
   */
  private async handleNetworkError(
    error: Error,
    context: ErrorContext,
    options: ErrorHandlingOptions
  ): Promise<any> {
    const isOffline = context.isOffline;
    
    if (isOffline) {
      // Try to provide offline data
      const offlineData = await this.getOfflineFallback(context);
      
      if (offlineData) {
        this.showOfflineNotification();
        return offlineData;
      }
    }

    // Show network error alert
    if (options.showAlert !== false) {
      const title = isOffline ? 'No Internet Connection' : 'Connection Error';
      const message = isOffline 
        ? 'You appear to be offline. Some features may not be available.'
        : 'Unable to connect to the server. Please check your internet connection and try again.';
      
      Alert.alert(title, message, [
        { text: 'OK', style: 'default' },
        ...(options.enableRetry ? [{ 
          text: 'Retry', 
          onPress: () => this.retryOperation(context, options) 
        }] : [])
      ]);
    }

    return options.fallbackData || null;
  }

  /**
   * Handle database-related errors
   */
  private async handleDatabaseError(
    error: Error,
    context: ErrorContext,
    options: ErrorHandlingOptions
  ): Promise<any> {
    console.error('Database error:', error.message, context);

    // Try offline cache first
    const offlineData = await this.getOfflineFallback(context);
    if (offlineData) {
      this.showOfflineNotification();
      return offlineData;
    }

    if (options.showAlert !== false) {
      Alert.alert(
        'Data Error',
        'There was an issue accessing your data. Please try again.',
        [
          { text: 'OK', style: 'default' },
          ...(options.enableRetry ? [{ 
            text: 'Retry', 
            onPress: () => this.retryOperation(context, options) 
          }] : [])
        ]
      );
    }

    return options.fallbackData || null;
  }

  /**
   * Handle authentication errors
   */
  private async handleAuthError(
    error: Error,
    context: ErrorContext,
    options: ErrorHandlingOptions
  ): Promise<any> {
    console.error('Auth error:', error.message, context);

    if (options.showAlert !== false) {
      Alert.alert(
        'Authentication Error',
        'Your session has expired. Please log in again.',
        [
          { text: 'OK', style: 'default' },
          { text: 'Log In', onPress: () => this.navigateToLogin() }
        ]
      );
    }

    return null;
  }

  /**
   * Handle validation errors
   */
  private async handleValidationError(
    error: Error,
    context: ErrorContext,
    options: ErrorHandlingOptions
  ): Promise<any> {
    console.error('Validation error:', error.message, context);

    if (options.showAlert !== false) {
      Alert.alert(
        'Invalid Input',
        error.message || 'Please check your input and try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }

    return null;
  }

  /**
   * Handle generic errors
   */
  private async handleGenericError(
    error: Error,
    context: ErrorContext,
    options: ErrorHandlingOptions
  ): Promise<any> {
    console.error('Generic error:', error.message, context);

    if (options.showAlert !== false) {
      Alert.alert(
        options.alertTitle || 'Something went wrong',
        options.alertMessage || 'An unexpected error occurred. Please try again.',
        [
          { text: 'OK', style: 'default' },
          ...(options.enableRetry ? [{ 
            text: 'Retry', 
            onPress: () => this.retryOperation(context, options) 
          }] : [])
        ]
      );
    }

    return options.fallbackData || null;
  }

  /**
   * Get offline fallback data
   */
  private async getOfflineFallback(context: ErrorContext): Promise<any> {
    try {
      if (context.lessonId) {
        const cachedLesson = await offlineCache.getCachedLesson(context.lessonId);
        if (cachedLesson) {
          return cachedLesson;
        }
      }

      // Try to get any cached lessons for the current path
      if (context.pathId) {
        const allCached = await offlineCache.getAllCachedLessons();
        const pathLessons = allCached.filter(lesson => lesson.pathId === context.pathId);
        if (pathLessons.length > 0) {
          return pathLessons;
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to get offline fallback:', error);
      return null;
    }
  }

  /**
   * Show offline notification
   */
  private showOfflineNotification(): void {
    Alert.alert(
      'Offline Mode',
      'You are currently offline. Showing cached content.',
      [{ text: 'OK', style: 'default' }]
    );
  }

  /**
   * Retry operation with exponential backoff
   */
  private async retryOperation(
    context: ErrorContext,
    options: ErrorHandlingOptions
  ): Promise<void> {
    const retryKey = `${context.screen}_${context.action}_${context.timestamp}`;
    const currentRetry = this.retryQueue.get(retryKey) || { fn: () => Promise.resolve(), retries: 0 };

    if (currentRetry.retries >= (options.maxRetries || this.maxRetries)) {
      Alert.alert(
        'Maximum Retries Reached',
        'Unable to complete the operation after multiple attempts. Please try again later.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Exponential backoff
    const delay = this.retryDelay * Math.pow(2, currentRetry.retries);
    
    setTimeout(async () => {
      try {
        await currentRetry.fn();
        this.retryQueue.delete(retryKey);
      } catch (error) {
        currentRetry.retries++;
        this.retryQueue.set(retryKey, currentRetry);
        
        if (error instanceof Error) {
          this.handleError(error, { ...context, retryCount: currentRetry.retries }, options);
        }
      }
    }, delay);
  }

  /**
   * Report error to analytics and crash reporting
   */
  private reportError(error: Error, context: ErrorContext, severity: string): void {
    // Report to Sentry
    captureException(error, {
      tags: {
        screen: context.screen,
        action: context.action,
        severity,
      },
      extra: context,
    });

    // Report to analytics
    analytics.logEvent('error_occurred', {
      error_name: error.name,
      error_message: error.message.substring(0, 100), // Truncate for privacy
      screen: context.screen || 'unknown',
      severity,
      is_offline: context.isOffline,
      retry_count: context.retryCount || 0,
    });
  }

  /**
   * Error type detection methods
   */
  private isNetworkError(error: Error): boolean {
    return (
      error.message.includes('Network') ||
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout') ||
      error.name === 'NetworkError' ||
      error.name === 'TimeoutError'
    );
  }

  private isDatabaseError(error: Error): boolean {
    return (
      error.message.includes('database') ||
      error.message.includes('Database') ||
      error.message.includes('SQL') ||
      error.message.includes('Supabase') ||
      error.name === 'DatabaseError'
    );
  }

  private isAuthError(error: Error): boolean {
    return (
      error.message.includes('auth') ||
      error.message.includes('Auth') ||
      error.message.includes('unauthorized') ||
      error.message.includes('Unauthorized') ||
      error.message.includes('token') ||
      error.name === 'AuthError'
    );
  }

  private isValidationError(error: Error): boolean {
    return (
      error.message.includes('validation') ||
      error.message.includes('Validation') ||
      error.message.includes('invalid') ||
      error.message.includes('Invalid') ||
      error.name === 'ValidationError'
    );
  }

  /**
   * Utility methods
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private async isOnline(): Promise<boolean> {
    try {
      const NetInfo = require('@react-native-community/netinfo');
      const state = await NetInfo.fetch();
      return state.isConnected && state.isInternetReachable;
    } catch {
      return true; // Assume online if we can't check
    }
  }

  private navigateToLogin(): void {
    // This should be implemented based on your navigation structure
    console.log('Navigate to login screen');
  }

  /**
   * Get error statistics
   */
  getErrorStats(): { errorType: string; count: number }[] {
    return Array.from(this.errorCounts.entries()).map(([errorType, count]) => ({
      errorType,
      count,
    }));
  }

  /**
   * Clear error statistics
   */
  clearErrorStats(): void {
    this.errorCounts.clear();
  }
}

// Export singleton instance
export const errorHandler = ErrorHandlingService.getInstance();
export type { ErrorContext, ErrorHandlingOptions };