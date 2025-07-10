// Analytics utility for tracking user events
// This is a placeholder implementation for Phase A
// TODO: Replace with Firebase Analytics in Phase B

interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, string | number | boolean>;
}

class AnalyticsService {
  private isEnabled: boolean = !__DEV__;

  // Initialize analytics (placeholder for Firebase Analytics)
  initialize() {
    if (__DEV__) {
      console.log('📊 Analytics initialized (development mode)');
    }
  }

  // Track user events
  logEvent(eventName: string, parameters?: Record<string, string | number | boolean>) {
    if (!this.isEnabled) {
      console.log(`📊 Analytics Event: ${eventName}`, parameters);
      return;
    }

    // TODO: Implement Firebase Analytics
    // analytics().logEvent(eventName, parameters);
    
    // For now, just log to console in production
    console.log(`📊 Analytics Event: ${eventName}`, parameters);
  }

  // Track screen views
  logScreenView(screenName: string, screenClass?: string) {
    this.logEvent('screen_view', {
      firebase_screen: screenName,
      firebase_screen_class: screenClass || screenName,
    });
  }

  // Track lesson completion
  logLessonComplete(lessonId: string, religion: string, timeSpent: number) {
    this.logEvent('lesson_complete', {
      lesson_id: lessonId,
      religion,
      time_spent_seconds: timeSpent,
    });
  }

  // Track quiz completion
  logQuizComplete(lessonId: string, score: number, accuracy: number) {
    this.logEvent('quiz_complete', {
      lesson_id: lessonId,
      score,
      accuracy_percentage: accuracy,
    });
  }

  // Track user engagement
  logUserEngagement(action: string, target?: string) {
    this.logEvent('user_engagement', {
      engagement_type: action,
      target: target || 'unknown',
    });
  }

  // Set user properties
  setUserProperty(name: string, value: string) {
    if (__DEV__) {
      console.log(`📊 User Property: ${name} = ${value}`);
      return;
    }

    // TODO: Implement Firebase Analytics user properties
    // analytics().setUserProperty(name, value);
  }

  // Set user ID for tracking
  setUserId(userId: string) {
    if (__DEV__) {
      console.log(`📊 User ID set: ${userId}`);
      return;
    }

    // TODO: Implement Firebase Analytics user ID
    // analytics().setUserId(userId);
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Helper functions for common tracking scenarios
export const trackScreenView = (screenName: string) => {
  analytics.logScreenView(screenName);
};

export const trackLessonStart = (lessonId: string, religion: string) => {
  analytics.logEvent('lesson_start', {
    lesson_id: lessonId,
    religion,
  });
};

export const trackLessonComplete = (lessonId: string, religion: string, timeSpent: number) => {
  analytics.logLessonComplete(lessonId, religion, timeSpent);
};

export const trackQuizComplete = (lessonId: string, score: number, accuracy: number) => {
  analytics.logQuizComplete(lessonId, score, accuracy);
};

export const trackUserAction = (action: string, target?: string) => {
  analytics.logUserEngagement(action, target);
};