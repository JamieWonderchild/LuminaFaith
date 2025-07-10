import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useReligions, useUserProgress } from '../store/AppContext';
import { lessonsService } from '../services/LessonsService';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import LessonCard from '../components/lesson/LessonCard';

interface PathsScreenProps {
  navigation: any;
}

export default function PathsScreen({ navigation }: PathsScreenProps) {
  const religions = useReligions();
  const userProgress = useUserProgress();
  const [selectedReligion, setSelectedReligion] = useState<string | null>(null);
  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const [pathLessons, setPathLessons] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLearningPaths();
  }, [selectedReligion]);

  const loadLearningPaths = async () => {
    try {
      setIsLoading(true);
      
      if (selectedReligion) {
        // Load paths for specific religion
        const paths = await lessonsService.getLearningPaths(selectedReligion);
        setLearningPaths(paths);
        
        // Use parallel preloading for better performance
        console.log('🚀 Preloading lessons for', paths.length, 'paths');
        const pathIds = paths.map(p => p.id);
        const lessonsData = await lessonsService.preloadLessonsForPaths(pathIds);
        setPathLessons(lessonsData);
        
        // Start background preloading for user's next lessons
        if (user?.id) {
          for (const path of paths) {
            // Don't await - this is background optimization
            lessonsService.preloadNextLessons(user.id, path.id, 3);
          }
        }
      } else {
        // Load all paths across all religions
        const allPaths: any[] = [];
        const pathsByReligion: Record<string, string[]> = {};
        
        // First collect all paths
        for (const religion of religions) {
          const paths = await lessonsService.getLearningPaths(religion.id);
          allPaths.push(...paths);
          pathsByReligion[religion.id] = paths.map(p => p.id);
        }
        
        setLearningPaths(allPaths);
        
        // Preload lessons for all paths in parallel
        const allPathIds = allPaths.map(p => p.id);
        console.log('🚀 Preloading lessons for', allPathIds.length, 'paths across all religions');
        const lessonsData = await lessonsService.preloadLessonsForPaths(allPathIds);
        setPathLessons(lessonsData);
        
        // Start background preloading for each religion
        for (const religion of religions) {
          // Don't await - this is background optimization
          lessonsService.preloadReligionLessons(religion.id);
        }
      }
    } catch (error) {
      console.error('Error loading learning paths:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPaths = learningPaths;

  const getReligionByPath = (pathId: string) => {
    const path = learningPaths.find(p => p.id === pathId);
    return religions.find(r => r.id === path?.religion_id);
  };

  const getPathProgress = (pathId: string) => {
    const progress = userProgress[pathId];
    if (!progress) return 0;
    return (progress.completedLessons / progress.totalLessons) * 100;
  };

  const handleLessonPress = (lesson: any, pathId: string) => {
    navigation.navigate('Lesson', {
      lessonId: lesson.id,
      pathId: pathId,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Learning Paths</Text>
          <Text style={styles.subtitle}>Choose your spiritual journey</Text>
        </View>

        {/* Religion Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                !selectedReligion && styles.filterButtonActive
              ]}
              onPress={() => setSelectedReligion(null)}
            >
              <Text style={[
                styles.filterButtonText,
                !selectedReligion && styles.filterButtonTextActive
              ]}>
                All Paths
              </Text>
            </TouchableOpacity>
            
            {religions.map((religion) => (
              <TouchableOpacity
                key={religion.id}
                style={[
                  styles.filterButton,
                  selectedReligion === religion.id && styles.filterButtonActive
                ]}
                onPress={() => setSelectedReligion(religion.id)}
              >
                <Text style={styles.filterIcon}>{religion.icon}</Text>
                <Text style={[
                  styles.filterButtonText,
                  selectedReligion === religion.id && styles.filterButtonTextActive
                ]}>
                  {religion.display_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Learning Paths */}
        <View style={styles.pathsContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={styles.loadingText}>Loading learning paths...</Text>
            </View>
          ) : (
            filteredPaths.map((path) => {
              const religion = getReligionByPath(path.id);
              const progress = getPathProgress(path.id);
              const nextLessonIndex = userProgress[path.id]?.completedLessons || 0;
              const lessons = pathLessons[path.id] || [];
              
              return (
                <Card key={path.id} style={styles.pathCard}>
                  <LinearGradient
                    colors={[religion?.color || '#3498DB', '#2980B9']}
                    style={styles.pathHeader}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View style={styles.pathInfo}>
                      <Text style={styles.pathIcon}>{religion?.icon}</Text>
                      <View style={styles.pathDetails}>
                        <Text style={styles.pathTitle}>{path.title}</Text>
                        <Text style={styles.pathReligion}>{religion?.display_name}</Text>
                      </View>
                    </View>
                    <View style={styles.pathMeta}>
                      <Text style={styles.pathLevel}>{path.level}</Text>
                      <Text style={styles.pathDuration}>{path.estimated_time ? `${path.estimated_time} min` : 'Varies'}</Text>
                    </View>
                  </LinearGradient>

                  <View style={styles.pathContent}>
                    <Text style={styles.pathDescription}>{path.description}</Text>
                    
                    <View style={styles.progressSection}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressTitle}>Progress</Text>
                        <Text style={styles.progressText}>
                          {userProgress[path.id]?.completedLessons || 0} / {path.total_lessons} lessons
                        </Text>
                      </View>
                      <ProgressBar progress={progress} height={8} />
                    </View>

                    {/* Show first 3 lessons */}
                    <View style={styles.lessonsPreview}>
                      <Text style={styles.lessonsTitle}>Lessons</Text>
                      {lessons.slice(0, 3).map((lesson, index) => (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          onPress={() => handleLessonPress(lesson, path.id)}
                          isLocked={index > nextLessonIndex}
                          isNext={index === nextLessonIndex}
                        />
                      ))}
                      
                      {lessons.length > 3 && (
                        <TouchableOpacity style={styles.showMoreButton}>
                          <Text style={styles.showMoreText}>
                            Show {lessons.length - 3} more lessons
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </View>

        {/* Empty State */}
        {filteredPaths.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No paths found</Text>
            <Text style={styles.emptyDescription}>
              Try selecting a different religion or check back later for new content.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#CBD5E1',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  pathsContainer: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#CBD5E1',
    marginTop: 16,
  },
  pathCard: {
    marginBottom: 20,
    padding: 0,
    overflow: 'hidden',
  },
  pathHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pathInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pathIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  pathDetails: {
    flex: 1,
  },
  pathTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  pathReligion: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  pathMeta: {
    alignItems: 'flex-end',
  },
  pathLevel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  pathDuration: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  pathContent: {
    padding: 20,
  },
  pathDescription: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
    marginBottom: 20,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  progressText: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  lessonsPreview: {
    marginTop: 8,
  },
  lessonsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  showMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 20,
  },
});