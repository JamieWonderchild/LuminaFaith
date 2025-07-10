import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from './Button';
import Card from './Card';
import ProgressBar from './ProgressBar';
import OfflineIndicator from './OfflineIndicator';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { Lesson } from '@/types';

interface OfflineCacheManagerProps {
  onClose?: () => void;
}

export default function OfflineCacheManager({ onClose }: OfflineCacheManagerProps) {
  const {
    isOnline,
    cachedLessons,
    loading,
    getCacheStats,
    clearCache,
    removeCachedLesson,
    autoDownloadRecentLessons,
  } = useOfflineCache();

  const [cacheStats, setCacheStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCacheStats();
  }, [cachedLessons]);

  const loadCacheStats = async () => {
    try {
      const stats = await getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Offline Cache',
      'This will remove all downloaded lessons. You\'ll need to re-download them for offline access. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            await clearCache();
            await loadCacheStats();
          },
        },
      ]
    );
  };

  const handleAutoDownload = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Connect to the internet to download lessons for offline access.');
      return;
    }

    setRefreshing(true);
    try {
      await autoDownloadRecentLessons();
      await loadCacheStats();
    } catch (error) {
      console.error('Auto download failed:', error);
      Alert.alert('Download Failed', 'Unable to download lessons. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRemoveLesson = (lesson: Lesson) => {
    Alert.alert(
      'Remove Lesson',
      `Remove "${lesson.title}" from offline cache?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeCachedLesson(lesson.id);
            await loadCacheStats();
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityLabel = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1E1B4B', '#312E81']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Offline Cache Manager</Text>
        <Text style={styles.headerSubtitle}>
          Download lessons for offline spiritual practice
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Network Status */}
        <OfflineIndicator showCacheStats={true} />

        {/* Cache Statistics */}
        {cacheStats && (
          <Card style={styles.statsCard}>
            <Text style={styles.statsTitle}>Cache Statistics</Text>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Cached Lessons:</Text>
              <Text style={styles.statValue}>{cacheStats.totalLessons}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Storage Used:</Text>
              <Text style={styles.statValue}>
                {cacheStats.totalSize} / {cacheStats.maxSize}
              </Text>
            </View>
            
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={cacheStats.usagePercentage}
                height={8}
                backgroundColor="rgba(71, 85, 105, 0.3)"
                showGradient={true}
                spiritual={true}
                glowEffect={cacheStats.usagePercentage > 80}
              />
              <Text style={styles.progressText}>
                {cacheStats.usagePercentage}% used
              </Text>
            </View>
          </Card>
        )}

        {/* Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionButtons}>
            <Button
              title={refreshing ? "Downloading..." : "Download Recent"}
              onPress={handleAutoDownload}
              disabled={!isOnline || refreshing}
              variant="primary"
              size="medium"
              icon="⬇️"
              animationType="glow"
              analyticsEvent="download_recent_lessons"
            />
            
            <Button
              title="Clear All Cache"
              onPress={handleClearCache}
              disabled={cachedLessons.length === 0 || loading}
              variant="outline"
              size="medium"
              icon="🗑️"
              animationType="scale"
              analyticsEvent="clear_cache"
            />
          </View>
        </Card>

        {/* Cached Lessons List */}
        <Card style={styles.lessonsCard}>
          <Text style={styles.sectionTitle}>
            Cached Lessons ({cachedLessons.length})
          </Text>
          
          {cachedLessons.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📱</Text>
              <Text style={styles.emptyTitle}>No Offline Lessons</Text>
              <Text style={styles.emptyDescription}>
                {isOnline 
                  ? "Download lessons above for offline access"
                  : "Connect to the internet to download lessons"
                }
              </Text>
            </View>
          ) : (
            <View style={styles.lessonsList}>
              {cachedLessons.map((lesson, index) => (
                <View key={lesson.id} style={styles.lessonItem}>
                  <View style={styles.lessonHeader}>
                    <Text style={styles.lessonTitle} numberOfLines={1}>
                      {lesson.title}
                    </Text>
                    <View 
                      style={[
                        styles.priorityBadge, 
                        { backgroundColor: getPriorityColor((lesson as any).priority || 'medium') }
                      ]}
                    >
                      <Text style={styles.priorityText}>
                        {getPriorityLabel((lesson as any).priority || 'medium')}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.lessonDetails}>
                    <Text style={styles.lessonType}>
                      {lesson.type || 'Lesson'} • {lesson.religion || 'General'}
                    </Text>
                    <Text style={styles.lessonCached}>
                      Cached: {new Date((lesson as any).cachedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <Button
                    title="Remove"
                    onPress={() => handleRemoveLesson(lesson)}
                    variant="ghost"
                    size="small"
                    analyticsEvent={`remove_cached_lesson_${lesson.type}`}
                  />
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Footer Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Tips for Offline Practice</Text>
          <Text style={styles.infoText}>
            • Lessons are automatically downloaded when you have a good connection{'\n'}
            • High-priority lessons are never automatically removed{'\n'}
            • Cache is cleaned up when storage gets full{'\n'}
            • Your progress syncs when you're back online
          </Text>
        </Card>
      </ScrollView>

      {/* Close Button */}
      {onClose && (
        <View style={styles.footer}>
          <Button
            title="Done"
            onPress={onClose}
            variant="primary"
            fullWidth
            analyticsEvent="close_cache_manager"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 8,
  },
  actionsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  lessonsCard: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  lessonsList: {
    gap: 12,
  },
  lessonItem: {
    padding: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.6)',
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  lessonTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  lessonDetails: {
    marginBottom: 12,
  },
  lessonType: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  lessonCached: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '400',
  },
  infoCard: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  infoText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
});