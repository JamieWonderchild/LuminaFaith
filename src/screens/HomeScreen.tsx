import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser, useDailyChallenge, useUserProgress, useAchievements } from '../store/AppContext';
import AnimatedCard from '../components/common/AnimatedCard';
import AnimatedButton from '../components/common/AnimatedButton';
import AnimatedProgressBar from '../components/common/AnimatedProgressBar';
import FloatingActionButton from '../components/common/FloatingActionButton';
import { SkeletonStats, SkeletonCard } from '../components/common/LoadingSkeleton';
import Card from '../components/common/Card';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const user = useUser();
  const dailyChallenge = useDailyChallenge();
  const userProgress = useUserProgress();
  const achievements = useAchievements();
  const [isLoading, setIsLoading] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStreakMessage = () => {
    if (!user?.streak) return 'Start your learning journey!';
    if (user.streak === 1) return 'Great start! Keep it up!';
    if (user.streak < 7) return `${user.streak} days strong! 🔥`;
    if (user.streak < 30) return `Amazing ${user.streak}-day streak! 🌟`;
    return `Incredible ${user.streak}-day streak! 🏆`;
  };

  const getCurrentLevel = () => {
    if (!user?.totalXP) return 1;
    return Math.floor(user.totalXP / 500) + 1;
  };

  const getXPForNextLevel = () => {
    const currentLevel = getCurrentLevel();
    return currentLevel * 500;
  };

  const getXPProgress = () => {
    if (!user?.totalXP) return 0;
    const currentLevelXP = (getCurrentLevel() - 1) * 500;
    const xpInCurrentLevel = user.totalXP - currentLevelXP;
    return (xpInCurrentLevel / 500) * 100;
  };

  const recentAchievements = achievements.filter(a => a.isUnlocked).slice(-2);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#1E1B4B', '#312E81']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.name || 'Spiritual Seeker'}</Text>
          <Text style={styles.streakMessage}>{getStreakMessage()}</Text>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {isLoading ? (
            <SkeletonStats />
          ) : (
            <>
              <AnimatedCard style={styles.statCard} index={0} animationType="scaleIn">
                <Text style={styles.statNumber}>{user?.streak || 0}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
                <Text style={styles.statIcon}>🔥</Text>
              </AnimatedCard>
              
              <AnimatedCard style={styles.statCard} index={1} animationType="scaleIn">
                <Text style={styles.statNumber}>{user?.totalXP || 0}</Text>
                <Text style={styles.statLabel}>Total XP</Text>
                <Text style={styles.statIcon}>⭐</Text>
              </AnimatedCard>
              
              <AnimatedCard style={styles.statCard} index={2} animationType="scaleIn">
                <Text style={styles.statNumber}>{getCurrentLevel()}</Text>
                <Text style={styles.statLabel}>Level</Text>
                <Text style={styles.statIcon}>🏆</Text>
              </AnimatedCard>
            </>
          )}
        </View>

        {/* Level Progress */}
        <AnimatedCard style={styles.levelCard} index={3} animationType="slideUp">
          <View style={styles.levelHeader}>
            <Text style={styles.levelTitle}>Level {getCurrentLevel()}</Text>
            <Text style={styles.levelXP}>{user?.totalXP || 0} / {getXPForNextLevel()} XP</Text>
          </View>
          <AnimatedProgressBar progress={getXPProgress()} height={8} showGradient delay={1000} />
          <Text style={styles.levelDescription}>
            {500 - ((user?.totalXP || 0) % 500)} XP to level {getCurrentLevel() + 1}
          </Text>
        </AnimatedCard>

        {/* Daily Challenge */}
        {dailyChallenge && (
          <AnimatedCard style={styles.challengeCard} index={4} animationType="fadeIn">
            <LinearGradient
              colors={['#553C9A', '#44337A']}
              style={styles.challengeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeTitle}>Daily Challenge</Text>
                <Text style={styles.challengeXP}>+{dailyChallenge.xpReward} XP</Text>
              </View>
              <Text style={styles.challengeName}>{dailyChallenge.title}</Text>
              <Text style={styles.challengeDescription}>{dailyChallenge.description}</Text>
              <AnimatedButton
                title={dailyChallenge.isCompleted ? 'Completed ✅' : 'Start Challenge'}
                onPress={() => {/* Handle challenge */}}
                variant="secondary"
                style={styles.challengeButton}
                disabled={dailyChallenge.isCompleted}
              />
            </LinearGradient>
          </AnimatedCard>
        )}

        {/* Continue Learning */}
        <AnimatedCard 
          style={styles.continueCard} 
          index={5} 
          animationType="slideUp"
          onPress={() => navigation.navigate('Paths')}
        >
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <View style={styles.pathPreview}>
            <View style={styles.pathIcon}>
              <Text style={styles.pathEmoji}>🧘</Text>
            </View>
            <View style={styles.pathInfo}>
              <Text style={styles.pathTitle}>Buddhism Fundamentals</Text>
              <Text style={styles.pathProgress}>
                Lesson {(userProgress['buddhism-basics']?.completedLessons || 0) + 1} of 20
              </Text>
              <AnimatedProgressBar 
                progress={((userProgress['buddhism-basics']?.completedLessons || 0) / 20) * 100} 
                height={6}
                delay={1500}
              />
            </View>
            <Text style={styles.continueArrow}>→</Text>
          </View>
        </AnimatedCard>

        {/* Daily Inspiration */}
        <AnimatedCard style={styles.inspirationCard} index={6} animationType="fadeIn">
          <Text style={styles.sectionTitle}>Daily Inspiration</Text>
          <View style={styles.inspirationContent}>
            <Text style={styles.inspirationQuote}>
              "Peace comes from within. Do not seek it without."
            </Text>
            <Text style={styles.inspirationAuthor}>— Buddha</Text>
          </View>
          <View style={styles.inspirationActions}>
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.favoriteButton}>
              <Text style={styles.favoriteIcon}>♡</Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Today's Reflection */}
        <AnimatedCard style={styles.reflectionCard} index={7} animationType="slideUp">
          <Text style={styles.sectionTitle}>Today's Reflection</Text>
          <Text style={styles.reflectionPrompt}>
            How can you bring more mindfulness into your daily activities?
          </Text>
          <TouchableOpacity style={styles.reflectionButton}>
            <Text style={styles.reflectionButtonText}>Start Reflection</Text>
          </TouchableOpacity>
        </AnimatedCard>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <Card style={styles.achievementsCard}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            {recentAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
                <Text style={styles.achievementXP}>+{achievement.xpReward}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Quick Actions */}
        <View style={[styles.quickActions, { backgroundColor: '#1E293B', borderRadius: 12, padding: 16 }]}>
          <AnimatedButton
            title="Explore Paths"
            onPress={() => navigation.navigate('Paths')}
            icon="🗺️"
            style={styles.quickAction}
          />
          <AnimatedButton
            title="Community"
            onPress={() => navigation.navigate('Community')}
            variant="outline"
            icon="👥"
            style={styles.quickAction}
          />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={() => navigation.navigate('Paths')}
        icon="▶️"
        label="Start Learning"
        pulse={true}
        bottomOffset={130}
      />
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
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  streakMessage: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statIcon: {
    fontSize: 16,
    marginTop: 8,
  },
  levelCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  levelXP: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  levelDescription: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  challengeCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 0,
  },
  challengeGradient: {
    padding: 20,
    borderRadius: 12,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  challengeXP: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 16,
  },
  challengeButton: {
    backgroundColor: '#FFFFFF',
  },
  continueCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  pathPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pathIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pathEmoji: {
    fontSize: 24,
  },
  pathInfo: {
    flex: 1,
  },
  pathTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  pathProgress: {
    fontSize: 12,
    color: '#CBD5E1',
    marginBottom: 8,
  },
  continueArrow: {
    fontSize: 16,
    color: '#805AD5',
    fontWeight: '400',
  },
  achievementsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F8FAFC',
  },
  achievementDescription: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
  },
  achievementXP: {
    fontSize: 11,
    color: '#805AD5',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  quickAction: {
    flex: 1,
    minHeight: 50,
  },
  inspirationCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  inspirationContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  inspirationQuote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#F1F5F9',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  inspirationAuthor: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '500',
  },
  inspirationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#312E81',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareButtonText: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 20,
    color: '#A78BFA',
  },
  reflectionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  reflectionPrompt: {
    fontSize: 15,
    color: '#E2E8F0',
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'center',
  },
  reflectionButton: {
    backgroundColor: '#553C9A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
  },
  reflectionButtonText: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '600',
  },
});