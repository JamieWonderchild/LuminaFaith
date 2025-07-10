# Error Handling and Offline Support

This document describes the comprehensive error handling and offline support implementation in LuminaFaith.

## Overview

The app implements a multi-layered approach to error handling and offline functionality:

1. **Error Boundary** - Catches React component errors
2. **Error Handling Service** - Centralized error management
3. **Offline Cache Service** - Intelligent content caching
4. **Network Detection** - Real-time connectivity monitoring
5. **User Feedback** - Contextual notifications and alerts

## Error Handling

### Error Boundary

The `ErrorBoundary` component catches JavaScript errors anywhere in the component tree:

```tsx
// Wraps the entire app
<ErrorBoundary>
  <AppProvider>
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  </AppProvider>
</ErrorBoundary>
```

**Features:**
- Spiritual-themed error messages
- Graceful error recovery
- Automatic error reporting to Sentry
- Debug information in development

### Error Handling Service

Centralized error management with contextual handling:

```typescript
import { errorHandler } from '@/services/ErrorHandlingService';

// Basic error handling
try {
  await someAsyncOperation();
} catch (error) {
  await errorHandler.handleError(error, {
    screen: 'LessonScreen',
    action: 'loadLesson',
    lessonId: '123',
  });
}
```

**Error Types Handled:**
- **Network Errors**: Connection issues, timeouts
- **Database Errors**: Supabase/SQL errors
- **Authentication Errors**: Token expiration, unauthorized access
- **Validation Errors**: Form input validation
- **Generic Errors**: Fallback for unknown errors

**Error Handling Features:**
- Automatic retry with exponential backoff
- Offline fallback data
- User-friendly error messages
- Contextual error reporting
- Error frequency tracking

### Error Types and Responses

#### Network Errors
```typescript
// Automatically tries offline cache
// Shows appropriate offline message
// Enables retry functionality
const result = await errorHandler.handleError(networkError, context, {
  enableRetry: true,
  fallbackData: cachedData,
});
```

#### Database Errors
```typescript
// Attempts offline cache retrieval
// Shows data error message
// Provides retry option
const result = await errorHandler.handleError(dbError, context, {
  alertTitle: 'Data Error',
  alertMessage: 'There was an issue accessing your data.',
});
```

#### Authentication Errors
```typescript
// Prompts user to log in again
// Navigates to login screen
// Clears invalid tokens
const result = await errorHandler.handleError(authError, context, {
  showAlert: true,
  alertTitle: 'Authentication Error',
});
```

## Offline Support

### Offline Cache Service

Intelligent content caching with automatic management:

```typescript
import { offlineCache } from '@/services/OfflineCacheService';

// Cache a lesson
await offlineCache.cacheLesson(lesson, 'high'); // Priority: high, medium, low

// Retrieve cached lesson
const cachedLesson = await offlineCache.getCachedLesson(lessonId);

// Check if lesson is cached
const isCached = await offlineCache.isLessonCached(lessonId);
```

**Cache Features:**
- **Priority-based caching**: High, medium, low priority levels
- **Automatic cleanup**: Removes old/low-priority content when storage is full
- **Size management**: 50MB default limit with compression
- **Usage tracking**: Tracks access patterns for intelligent cleanup
- **Metadata tracking**: Cache statistics and health monitoring

### Cache Management

#### Cache Priorities
- **High**: Currently viewed lessons, user's path content
- **Medium**: Recently accessed lessons, recommended content
- **Low**: General browsing content, older lessons

#### Cache Cleanup Strategy
```typescript
// Automatic cleanup triggers:
// 1. When cache size exceeds 80% of limit
// 2. When lesson count exceeds 80% of limit
// 3. During app startup (background cleanup)

// Manual cleanup
await offlineCache.cleanupCache();

// Clear all cache
await offlineCache.clearAllCache();
```

### Network Detection

Real-time connectivity monitoring:

```typescript
import { useOfflineCache } from '@/hooks/useOfflineCache';

function MyComponent() {
  const { isOnline, cachedLessons } = useOfflineCache();
  
  return (
    <View>
      {!isOnline && (
        <Text>Offline Mode - {cachedLessons.length} lessons available</Text>
      )}
    </View>
  );
}
```

## User Interface Components

### Offline Indicator

```tsx
import OfflineIndicator from '@/components/common/OfflineIndicator';

<OfflineIndicator 
  showCacheStats={true}
  style={styles.offlineIndicator} 
/>
```

**Features:**
- Animated appearance/disappearance
- Shows offline status and cached content count
- Cache statistics display
- Gentle pulsing animation when offline

### Notification Banner

```tsx
import NotificationBanner from '@/components/common/NotificationBanner';

<NotificationBanner
  visible={showNotification}
  title="Offline Mode"
  message="You are currently offline. Showing cached content."
  type="info"
  onDismiss={() => setShowNotification(false)}
/>
```

**Notification Types:**
- **info**: General information (blue)
- **success**: Success messages (green)
- **reminder**: Reminders and tips (purple)
- **achievement**: Achievements and milestones (gold)

## Implementation Examples

### Service Integration

```typescript
// LessonsService with error handling and offline support
async getLesson(lessonId: string): Promise<Lesson | null> {
  try {
    // Try cache first
    const cachedLesson = await offlineCache.getCachedLesson(lessonId);
    if (cachedLesson) {
      return cachedLesson;
    }

    // Fetch from network
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (error) throw error;

    // Cache for offline access
    if (data) {
      await offlineCache.cacheLesson(data, 'high');
    }

    return data;
  } catch (error) {
    // Handle error with context
    return await errorHandler.handleError(error, {
      screen: 'LessonScreen',
      action: 'getLesson',
      lessonId,
    }, {
      enableRetry: true,
      fallbackData: null,
    });
  }
}
```

### Component Usage

```tsx
// LessonScreen with error handling
function LessonScreen({ route }: LessonScreenProps) {
  const { lessonId } = route.params;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const lessonData = await lessonsService.getLesson(lessonId);
      setLesson(lessonData);
    } catch (error) {
      // Error is already handled by the service
      console.error('Failed to load lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of component...
}
```

## Testing

### Error Scenarios

1. **Network Disconnection**
   - Disable network connection
   - Verify offline indicator appears
   - Test cached content accessibility

2. **Database Errors**
   - Simulate Supabase connection issues
   - Verify error handling and fallback

3. **Authentication Expiration**
   - Simulate token expiration
   - Verify redirect to login screen

4. **Cache Overflow**
   - Fill cache beyond capacity
   - Verify automatic cleanup

### Testing Tools

```bash
# Run error handling tests
npm run test -- --testNamePattern="error"

# Run offline tests
npm run test -- --testNamePattern="offline"

# Test cache functionality
npm run test -- --testNamePattern="cache"
```

## Configuration

### Cache Settings

```typescript
// Configure cache limits
const cacheConfig = {
  maxSize: 50 * 1024 * 1024, // 50MB
  maxLessons: 100,
  cleanupThreshold: 0.8, // 80%
};
```

### Error Reporting

```typescript
// Configure error reporting
const errorConfig = {
  enableSentry: true,
  enableAnalytics: true,
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};
```

## Best Practices

### For Developers

1. **Always use error handling service** for async operations
2. **Provide context** when handling errors
3. **Cache important content** proactively
4. **Test offline scenarios** regularly
5. **Monitor cache usage** and cleanup

### For Users

1. **Graceful degradation** when offline
2. **Clear feedback** about connection status
3. **Intuitive retry mechanisms**
4. **Preserved user progress** during errors
5. **Seamless online/offline transitions**

## Monitoring and Analytics

### Error Tracking

- **Sentry Integration**: Automatic crash reporting
- **Analytics Events**: Error frequency and patterns
- **Performance Monitoring**: Error impact on app performance

### Cache Analytics

- **Cache Hit Rate**: Percentage of successful cache retrievals
- **Cache Size Usage**: Storage utilization over time
- **Cleanup Frequency**: How often cache cleanup occurs

### User Experience Metrics

- **Offline Usage**: Time spent in offline mode
- **Retry Success Rate**: Percentage of successful retries
- **Error Recovery Time**: Time to recover from errors

## Troubleshooting

### Common Issues

1. **Cache Not Working**
   - Check storage permissions
   - Verify AsyncStorage functionality
   - Check cache size limits

2. **Offline Detection Issues**
   - Verify NetInfo configuration
   - Check network state listeners
   - Test on different network types

3. **Error Handling Not Triggered**
   - Verify error boundary setup
   - Check error service integration
   - Validate error type detection

### Debug Tools

```typescript
// Enable debug logging
const DEBUG_CACHE = __DEV__;
const DEBUG_ERRORS = __DEV__;

// Get cache statistics
const stats = await offlineCache.getCacheStats();
console.log('Cache Stats:', stats);

// Get error statistics
const errorStats = errorHandler.getErrorStats();
console.log('Error Stats:', errorStats);
```