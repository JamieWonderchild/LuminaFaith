import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProgressBar from './ProgressBar';
import AnimatedXPGain from './AnimatedXPGain';

interface XPProgressComboProps {
  currentXP: number;
  totalXP: number;
  level: number;
  xpForNextLevel: number;
  recentXPGain?: {
    amount: number;
    variant?: 'standard' | 'bonus' | 'achievement';
  };
  onXPAnimationComplete?: () => void;
  spiritual?: boolean;
}

export default function XPProgressCombo({
  currentXP,
  totalXP,
  level,
  xpForNextLevel,
  recentXPGain,
  onXPAnimationComplete,
  spiritual = true
}: XPProgressComboProps) {
  const [showXPAnimation, setShowXPAnimation] = useState(!!recentXPGain);
  
  // Calculate progress percentage for current level
  const progressPercentage = Math.min((currentXP / xpForNextLevel) * 100, 100);
  
  const handleXPAnimationComplete = useCallback(() => {
    setShowXPAnimation(false);
    onXPAnimationComplete?.();
  }, [onXPAnimationComplete]);

  return (
    <View style={styles.container}>
      {/* Level and Total XP Header */}
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Level {level}</Text>
        </View>
        <Text style={styles.totalXPText}>
          {totalXP.toLocaleString()} XP Total
        </Text>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={styles.currentXPText}>
            {currentXP.toLocaleString()}
          </Text>
          <Text style={styles.nextLevelText}>
            / {xpForNextLevel.toLocaleString()} XP
          </Text>
        </View>
        
        <ProgressBar
          progress={progressPercentage}
          height={12}
          backgroundColor="rgba(71, 85, 105, 0.3)"
          showGradient={true}
          spiritual={spiritual}
          glowEffect={!!recentXPGain}
          animated={true}
        />
        
        <Text style={styles.nextLevelLabel}>
          {currentXP >= xpForNextLevel 
            ? "🎉 Level Up Available!" 
            : `${(xpForNextLevel - currentXP).toLocaleString()} XP to Level ${level + 1}`
          }
        </Text>
      </View>

      {/* Floating XP Animation */}
      {showXPAnimation && recentXPGain && (
        <View style={styles.xpAnimationContainer}>
          <AnimatedXPGain
            xpGained={recentXPGain.amount}
            variant={recentXPGain.variant}
            onAnimationComplete={handleXPAnimationComplete}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalXPText: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '600',
  },
  progressSection: {
    gap: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  currentXPText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextLevelText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  nextLevelLabel: {
    color: '#E2E8F0',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 4,
  },
  xpAnimationContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: 1000,
  },
});