import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lesson } from '../../types';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import AnimatedCard from '../common/AnimatedCardList';

interface LessonCardProps {
  lesson: Lesson;
  onPress: () => void;
  progress?: number;
  isLocked?: boolean;
  isNext?: boolean;
  index?: number;
  animationType?: 'fadeIn' | 'slideUp' | 'scaleIn' | 'spiritual';
}

export default function LessonCard({
  lesson,
  onPress,
  progress = 0,
  isLocked = false,
  isNext = false,
  index = 0,
  animationType = 'spiritual'
}: LessonCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reading': return '📖';
      case 'quiz': return '❓';
      case 'audio': return '🎧';
      case 'video': return '📹';
      case 'interactive': return '🎮';
      case 'meditation': return '🧘';
      case 'reflection': return '💭';
      default: return '📚';
    }
  };

  const getTypeName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (isLocked) {
    return (
      <Card style={styles.lockedCard}>
        <View style={styles.lockedContent}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockedTitle}>{lesson.title}</Text>
          <Text style={styles.lockedDescription}>Complete previous lessons to unlock</Text>
        </View>
      </Card>
    );
  }

  return (
    <AnimatedCard 
      onPress={onPress} 
      index={index}
      animationType={animationType}
      spiritualGlow={isNext}
      analyticsEvent={`lesson_card_${lesson.type}`}
      style={[styles.card, isNext && styles.nextCard].filter(Boolean) as any}
    >
      {isNext && (
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.nextBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.nextBadgeText}>NEXT</Text>
        </LinearGradient>
      )}
      
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeIcon}>{getTypeIcon(lesson.type)}</Text>
          <Text style={styles.typeName}>{getTypeName(lesson.type)}</Text>
        </View>
        <View style={styles.xpContainer}>
          <Text style={styles.xpIcon}>⭐</Text>
          <Text style={styles.xpText}>{lesson.xpReward} XP</Text>
        </View>
      </View>

      <Text style={styles.title}>{lesson.title}</Text>
      <Text style={styles.description}>{lesson.description}</Text>

      <View style={styles.footer}>
        <View style={styles.durationContainer}>
          <Text style={styles.durationIcon}>⏱️</Text>
          <Text style={styles.durationText}>{lesson.duration} min</Text>
        </View>
        
        {lesson.isCompleted && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedIcon}>✅</Text>
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
      </View>

      {progress > 0 && progress < 100 && (
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={progress} 
            height={6} 
            animated={true}
            spiritual={true}
            glowEffect={progress > 80}
          />
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      )}
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    marginBottom: 16,
  },
  nextCard: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  nextBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 8,
    zIndex: 1,
  },
  nextBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  typeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A78BFA',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  completedText: {
    fontSize: 12,
    color: '#6EE7B7',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressText: {
    fontSize: 10,
    color: '#CBD5E1',
    marginLeft: 8,
  },
  
  // Locked styles
  lockedCard: {
    backgroundColor: '#1E293B',
    opacity: 0.6,
  },
  lockedContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  lockIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  lockedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 4,
    textAlign: 'center',
  },
  lockedDescription: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
  },
});