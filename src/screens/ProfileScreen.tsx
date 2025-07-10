import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser, useAchievements, useUserProgress, useApp } from '../store/AppContext';
import { authService } from '../services/AuthService';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';

export default function ProfileScreen() {
  const user = useUser();
  const achievements = useAchievements();
  const userProgress = useUserProgress();
  const { clearPersistedState } = useApp();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
              await clearPersistedState();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked);

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

  const getTotalLessonsCompleted = () => {
    return Object.values(userProgress).reduce((total, progress) => {
      return total + progress.completedLessons;
    }, 0);
  };

  const getAverageAccuracy = () => {
    const progressValues = Object.values(userProgress);
    if (progressValues.length === 0) return 0;
    
    const totalAccuracy = progressValues.reduce((sum, progress) => sum + progress.accuracy, 0);
    return Math.round(totalAccuracy / progressValues.length);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={['#1E1B4B', '#312E81']}
          style={styles.profileHeader}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) || 'S'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user?.name || 'Spiritual Seeker'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'seeker@luminafaith.com'}</Text>
          
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Level {getCurrentLevel()}</Text>
            <Text style={styles.xpText}>{user?.totalXP || 0} XP</Text>
          </View>
        </LinearGradient>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{user?.streak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
            <Text style={styles.statIcon}>🔥</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{getTotalLessonsCompleted()}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
            <Text style={styles.statIcon}>📚</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{getAverageAccuracy()}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
            <Text style={styles.statIcon}>🎯</Text>
          </Card>
        </View>

        {/* Level Progress */}
        <Card style={styles.levelProgressCard}>
          <Text style={styles.cardTitle}>Level Progress</Text>
          <View style={styles.levelProgressContainer}>
            <Text style={styles.currentLevel}>Level {getCurrentLevel()}</Text>
            <Text style={styles.nextLevel}>Level {getCurrentLevel() + 1}</Text>
          </View>
          <ProgressBar progress={getXPProgress()} height={10} />
          <Text style={styles.xpNeeded}>
            {500 - ((user?.totalXP || 0) % 500)} XP needed for next level
          </Text>
        </Card>

        {/* Learning Paths Progress */}
        <Card style={styles.pathsCard}>
          <Text style={styles.cardTitle}>Learning Progress</Text>
          {Object.entries(userProgress).map(([pathId, progress]) => (
            <View key={pathId} style={styles.pathProgressItem}>
              <View style={styles.pathProgressHeader}>
                <Text style={styles.pathName}>
                  {pathId === 'buddhism-basics' ? 'Buddhism Fundamentals' : 'Learning Path'}
                </Text>
                <Text style={styles.pathProgressText}>
                  {progress.completedLessons} / {progress.totalLessons}
                </Text>
              </View>
              <ProgressBar 
                progress={(progress.completedLessons / progress.totalLessons) * 100} 
                height={6}
              />
              <View style={styles.pathStats}>
                <Text style={styles.pathStat}>
                  {progress.xpEarned} XP earned
                </Text>
                <Text style={styles.pathStat}>
                  {progress.accuracy}% accuracy
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Achievements */}
        <Card style={styles.achievementsCard}>
          <Text style={styles.cardTitle}>Achievements</Text>
          <Text style={styles.achievementsSummary}>
            {unlockedAchievements.length} of {achievements.length} unlocked
          </Text>
          
          <View style={styles.achievementsContainer}>
            {unlockedAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                </View>
                <View style={styles.achievementMeta}>
                  <Text style={styles.achievementXP}>+{achievement.xpReward}</Text>
                  <Text style={styles.achievementDate}>
                    {achievement.unlockedAt?.toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {lockedAchievements.length > 0 && (
            <View style={styles.lockedAchievements}>
              <Text style={styles.lockedTitle}>Locked Achievements</Text>
              {lockedAchievements.map((achievement) => (
                <View key={achievement.id} style={styles.lockedAchievementItem}>
                  <Text style={styles.lockedAchievementIcon}>🔒</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.lockedAchievementTitle}>{achievement.title}</Text>
                    <Text style={styles.lockedAchievementDescription}>
                      {achievement.description}
                    </Text>
                  </View>
                  <Text style={styles.lockedAchievementXP}>+{achievement.xpReward}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Settings */}
        <Card style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔔</Text>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingValue}>
              {user?.preferences.notifications ? 'On' : 'Off'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔊</Text>
            <Text style={styles.settingLabel}>Sound</Text>
            <Text style={styles.settingValue}>
              {user?.preferences.soundEnabled ? 'On' : 'Off'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🎯</Text>
            <Text style={styles.settingLabel}>Daily Goal</Text>
            <Text style={styles.settingValue}>
              {user?.preferences.dailyGoal} min
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>📊</Text>
            <Text style={styles.settingLabel}>Difficulty</Text>
            <Text style={styles.settingValue}>
              {user?.preferences.difficultyLevel}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutLabel}>Sign Out</Text>
          </TouchableOpacity>
        </Card>
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
  profileHeader: {
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  editButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 10,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 16,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 8,
  },
  xpText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
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
    paddingVertical: 20,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 4,
  },
  statIcon: {
    fontSize: 20,
    marginTop: 8,
  },
  levelProgressCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  levelProgressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  currentLevel: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  nextLevel: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  xpNeeded: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  pathsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  pathProgressItem: {
    marginBottom: 16,
  },
  pathProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pathName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  pathProgressText: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  pathStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  pathStat: {
    fontSize: 12,
    color: '#64748B',
  },
  achievementsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  achievementsSummary: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 16,
  },
  achievementsContainer: {
    marginBottom: 20,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },
  achievementMeta: {
    alignItems: 'flex-end',
  },
  achievementXP: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  achievementDate: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  lockedAchievements: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  lockedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  lockedAchievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    opacity: 0.6,
  },
  lockedAchievementIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  lockedAchievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  lockedAchievementDescription: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  lockedAchievementXP: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  settingsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#F8FAFC',
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    marginTop: 8,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  logoutLabel: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
});