import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, TextInput, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { Video } from 'expo-av';
import { useApp } from '../store/AppContext';
import { lessonsService } from '../services/LessonsService';
import { Question } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';

const { width } = Dimensions.get('window');

interface LessonScreenProps {
  navigation: any;
  route: {
    params: {
      lessonId: string;
      pathId: string;
    };
  };
}

export default function LessonScreen({ navigation, route }: LessonScreenProps) {
  const { lessonId, pathId } = route.params;
  const { state, dispatch } = useApp();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [meditationTimer, setMeditationTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(10);

  useEffect(() => {
    loadLesson();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [lessonId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && meditationTimer > 0) {
      interval = setInterval(() => {
        setMeditationTimer(prev => prev - 1);
      }, 1000);
    } else if (meditationTimer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, meditationTimer]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const lessonData = await lessonsService.getLesson(lessonId);
      setLesson(lessonData);
    } catch (error) {
      console.error('Error loading lesson:', error);
      Alert.alert('Error', 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (url: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const startMeditationTimer = () => {
    setMeditationTimer(selectedDuration * 60);
    setIsTimerActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading lesson...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lesson not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const questions = lesson.content.questions as Question[] || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 100;

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      Alert.alert('Please select an answer', 'Choose an option before continuing.');
      return;
    }

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }

    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      completeLesson();
    }
  };

  const completeLesson = async () => {
    let accuracy = 100;
    let xpEarned = lesson.xpReward || 50;
    
    // Calculate accuracy for quiz-type lessons
    if (questions.length > 0) {
      accuracy = (correctAnswers / questions.length) * 100;
      xpEarned = Math.round(lesson.xpReward * (accuracy / 100));
    }

    // Save to Supabase
    try {
      if (state.user) {
        await lessonsService.completeLesson(
          state.user.id,
          lessonId,
          accuracy,
          xpEarned,
          lesson.duration * 60, // Convert minutes to seconds
          { 
            correctAnswers, 
            totalQuestions: questions.length,
            lessonType: lesson.type,
            reflectionText: reflectionText || undefined
          }
        );
        
        // Preload next lessons for this user in this path (background optimization)
        console.log('🚀 Preloading next lessons after completion');
        lessonsService.preloadNextLessons(state.user.id, pathId, 3);
      }
    } catch (error) {
      console.error('Error saving lesson completion:', error);
      Alert.alert('Error', 'Failed to save progress. Please try again.');
      return;
    }

    // Update local state
    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: {
        pathId,
        lessonId,
        xp: xpEarned,
        accuracy
      }
    });

    dispatch({
      type: 'COMPLETE_LESSON',
      payload: {
        pathId,
        lessonId
      }
    });

    setIsCompleted(true);
  };

  const handleFinish = () => {
    navigation.goBack();
  };

  const renderContentByType = () => {
    if (!lesson.content) return null;

    switch (lesson.type) {
      case 'reading':
        return renderReadingContent();
      case 'practice':
        return renderPracticeContent();
      case 'audio':
        return renderAudioContent();
      case 'video':
        return renderVideoContent();
      case 'interactive':
        return renderInteractiveContent();
      case 'reflection':
        return renderReflectionContent();
      default:
        return renderQuizContent();
    }
  };

  const renderReadingContent = () => (
    <Card style={styles.contentCard}>
      <Text style={styles.contentTitle}>Reading</Text>
      <Text style={styles.contentText}>{lesson.content.text}</Text>
      {lesson.content.questions && lesson.content.questions.length > 0 && (
        <View style={styles.quizSection}>
          <Text style={styles.quizTitle}>Check Your Understanding</Text>
          {renderQuizContent()}
        </View>
      )}
    </Card>
  );

  const renderPracticeContent = () => (
    <Card style={styles.contentCard}>
      <Text style={styles.contentTitle}>Practice</Text>
      <Text style={styles.contentText}>{lesson.content.instructions}</Text>
      
      {lesson.content.steps && (
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Steps:</Text>
          {lesson.content.steps.map((step: string, index: number) => (
            <Text key={index} style={styles.stepText}>{index + 1}. {step}</Text>
          ))}
        </View>
      )}
      
      {lesson.content.prayer_text && (
        <View style={styles.prayerContainer}>
          <Text style={styles.prayerTitle}>Prayer Text:</Text>
          <Text style={styles.prayerText}>{lesson.content.prayer_text}</Text>
        </View>
      )}
    </Card>
  );

  const renderAudioContent = () => (
    <Card style={styles.contentCard}>
      <Text style={styles.contentTitle}>Audio Lesson</Text>
      <Text style={styles.contentText}>{lesson.content.instructions}</Text>
      
      <View style={styles.audioControls}>
        <TouchableOpacity
          style={styles.audioButton}
          onPress={() => isPlaying ? pauseAudio() : playAudio(lesson.content.audio_url)}
        >
          <Text style={styles.audioButtonText}>{isPlaying ? '⏸️ Pause' : '▶️ Play'}</Text>
        </TouchableOpacity>
      </View>
      
      {lesson.content.transcript && (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptTitle}>Transcript:</Text>
          <Text style={styles.transcriptText}>{lesson.content.transcript}</Text>
        </View>
      )}
      
      {lesson.content.benefits && (
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Benefits:</Text>
          {lesson.content.benefits.map((benefit: string, index: number) => (
            <Text key={index} style={styles.benefitText}>• {benefit}</Text>
          ))}
        </View>
      )}
    </Card>
  );

  const renderVideoContent = () => (
    <Card style={styles.contentCard}>
      <Text style={styles.contentTitle}>Video Lesson</Text>
      
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: lesson.content.video_url }}
          style={styles.video}
          useNativeControls
          resizeMode="contain"
          shouldPlay={false}
        />
      </View>
      
      {lesson.content.transcript && (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptTitle}>What you'll learn:</Text>
          <Text style={styles.transcriptText}>{lesson.content.transcript}</Text>
        </View>
      )}
      
      {lesson.content.materials_needed && (
        <View style={styles.materialsContainer}>
          <Text style={styles.materialsTitle}>Materials needed:</Text>
          {lesson.content.materials_needed.map((material: string, index: number) => (
            <Text key={index} style={styles.materialText}>• {material}</Text>
          ))}
        </View>
      )}
    </Card>
  );

  const renderInteractiveContent = () => (
    <Card style={styles.contentCard}>
      <Text style={styles.contentTitle}>Interactive Meditation</Text>
      <Text style={styles.contentText}>{lesson.content.guidance}</Text>
      
      <View style={styles.meditationControls}>
        <Text style={styles.durationTitle}>Choose Duration:</Text>
        <View style={styles.durationOptions}>
          {lesson.content.timer_options?.map((duration: number) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.durationButton,
                selectedDuration === duration && styles.selectedDuration
              ]}
              onPress={() => setSelectedDuration(duration)}
            >
              <Text style={[
                styles.durationText,
                selectedDuration === duration && styles.selectedDurationText
              ]}>
                {duration}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.timerDisplay}>
          <Text style={styles.timerText}>{formatTime(meditationTimer)}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.startButton}
          onPress={startMeditationTimer}
          disabled={isTimerActive}
        >
          <Text style={styles.startButtonText}>
            {isTimerActive ? 'Meditation in Progress' : 'Start Meditation'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {lesson.content.progressive_steps && (
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Meditation Steps:</Text>
          {lesson.content.progressive_steps.map((step: string, index: number) => (
            <Text key={index} style={styles.stepText}>{index + 1}. {step}</Text>
          ))}
        </View>
      )}
    </Card>
  );

  const renderReflectionContent = () => (
    <Card style={styles.contentCard}>
      <Text style={styles.contentTitle}>Reflection</Text>
      <Text style={styles.contentText}>Theme: {lesson.content.theme}</Text>
      
      {lesson.content.reflection_prompts && (
        <View style={styles.promptsContainer}>
          <Text style={styles.promptsTitle}>Reflection Prompts:</Text>
          {lesson.content.reflection_prompts.map((prompt: string, index: number) => (
            <Text key={index} style={styles.promptText}>• {prompt}</Text>
          ))}
        </View>
      )}
      
      <View style={styles.reflectionInput}>
        <Text style={styles.reflectionTitle}>Your Reflection:</Text>
        <TextInput
          style={styles.reflectionTextInput}
          multiline
          numberOfLines={6}
          placeholder="Share your thoughts and reflections..."
          placeholderTextColor="#94A3B8"
          value={reflectionText}
          onChangeText={setReflectionText}
        />
      </View>
    </Card>
  );

  const renderQuizContent = () => {
    if (!questions || questions.length === 0) return null;
    
    return (
      <Card style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionType}>
            {currentQuestion.type === 'multiple-choice' ? 'Multiple Choice' : 'True/False'}
          </Text>
          <Text style={styles.questionDifficulty}>
            {currentQuestion.difficulty?.toUpperCase()}
          </Text>
        </View>
        
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options?.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correctAnswer;
            const showResult = showExplanation;

            const optionStyle = [styles.optionButton];
            const textStyle = [styles.optionText];

            if (showResult) {
              if (isCorrect) {
                optionStyle.push(styles.correctOption as any);
                textStyle.push(styles.correctOptionText as any);
              } else if (isSelected && !isCorrect) {
                optionStyle.push(styles.incorrectOption as any);
                textStyle.push(styles.incorrectOptionText as any);
              }
            } else if (isSelected) {
              optionStyle.push(styles.selectedOption as any);
              textStyle.push(styles.selectedOptionText as any);
            }

            return (
              <TouchableOpacity
                key={index}
                style={optionStyle}
                onPress={() => handleAnswerSelect(option)}
                disabled={showExplanation}
              >
                <Text style={textStyle}>{option}</Text>
                {showResult && isCorrect && (
                  <Text style={styles.correctIcon}>✓</Text>
                )}
                {showResult && isSelected && !isCorrect && (
                  <Text style={styles.incorrectIcon}>✗</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {showExplanation && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>Explanation</Text>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </View>
        )}
      </Card>
    );
  };

  if (isCompleted) {
    let accuracy = 100;
    let xpEarned = lesson.xpReward || 50;
    
    if (questions.length > 0) {
      accuracy = (correctAnswers / questions.length) * 100;
      xpEarned = Math.round(lesson.xpReward * (accuracy / 100));
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedContainer}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.completedCard}
          >
            <Text style={styles.completedIcon}>🎉</Text>
            <Text style={styles.completedTitle}>Lesson Complete!</Text>
            <Text style={styles.completedSubtitle}>Great job on completing the lesson</Text>
            
            <View style={styles.resultsContainer}>
              {questions.length > 0 && (
                <>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultNumber}>{correctAnswers}/{questions.length}</Text>
                    <Text style={styles.resultLabel}>Correct</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultNumber}>{Math.round(accuracy)}%</Text>
                    <Text style={styles.resultLabel}>Accuracy</Text>
                  </View>
                </>
              )}
              <View style={styles.resultItem}>
                <Text style={styles.resultNumber}>+{xpEarned}</Text>
                <Text style={styles.resultLabel}>XP Earned</Text>
              </View>
            </View>

            <Button
              title="Continue Learning"
              onPress={handleFinish}
              variant="secondary"
              style={styles.finishButton}
            />
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <ProgressBar progress={progress} height={8} />
            <Text style={styles.progressText}>
              {currentQuestionIndex + 1} of {questions.length}
            </Text>
          </View>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
        </View>

        {/* Content */}
        {renderContentByType()}

        {/* Question */}
        {questions.length > 0 && (
          <Card style={styles.questionCard}>
            <View style={styles.questionHeader}>
            <Text style={styles.questionType}>
              {currentQuestion.type === 'multiple-choice' ? 'Multiple Choice' : 'True/False'}
            </Text>
            <Text style={styles.questionDifficulty}>
              {currentQuestion.difficulty?.toUpperCase()}
            </Text>
          </View>
          
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              const showResult = showExplanation;

              const optionStyle = [styles.optionButton];
              const textStyle = [styles.optionText];

              if (showResult) {
                if (isCorrect) {
                  optionStyle.push(styles.correctOption as any);
                  textStyle.push(styles.correctOptionText as any);
                } else if (isSelected && !isCorrect) {
                  optionStyle.push(styles.incorrectOption as any);
                  textStyle.push(styles.incorrectOptionText as any);
                }
              } else if (isSelected) {
                optionStyle.push(styles.selectedOption as any);
                textStyle.push(styles.selectedOptionText as any);
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={optionStyle}
                  onPress={() => handleAnswerSelect(option)}
                  disabled={showExplanation}
                >
                  <Text style={textStyle}>{option}</Text>
                  {showResult && isCorrect && (
                    <Text style={styles.correctIcon}>✓</Text>
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <Text style={styles.incorrectIcon}>✗</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {showExplanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explanation</Text>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
            </View>
          )}
          </Card>
        )}

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {questions.length > 0 && !showExplanation ? (
            <Button
              title="Submit Answer"
              onPress={handleSubmitAnswer}
              disabled={!selectedAnswer}
              fullWidth
            />
          ) : questions.length > 0 && showExplanation ? (
            <Button
              title={currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Lesson'}
              onPress={handleNextQuestion}
              fullWidth
            />
          ) : (
            <Button
              title="Complete Lesson"
              onPress={completeLesson}
              fullWidth
            />
          )}
        </View>
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
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressText: {
    fontSize: 12,
    color: '#F1F5F9',
    marginLeft: 12,
    fontWeight: '500',
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contentCard: {
    margin: 20,
    marginBottom: 12,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 14,
    color: '#F1F5F9',
    lineHeight: 22,
  },
  questionCard: {
    margin: 20,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionType: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  questionDifficulty: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#334155',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#4C1D95',
    borderColor: '#8B5CF6',
  },
  correctOption: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  incorrectOption: {
    backgroundColor: '#7F1D1D',
    borderColor: '#EF4444',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#E0E7FF',
    fontWeight: '600',
  },
  correctOptionText: {
    color: '#6EE7B7',
    fontWeight: '600',
  },
  incorrectOptionText: {
    color: '#FCA5A5',
    fontWeight: '600',
  },
  correctIcon: {
    fontSize: 16,
    color: '#6EE7B7',
    fontWeight: 'bold',
  },
  incorrectIcon: {
    fontSize: 16,
    color: '#FCA5A5',
    fontWeight: 'bold',
  },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#F1F5F9',
    lineHeight: 22,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  // Completion styles
  completedContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  completedCard: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  completedIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 30,
    textAlign: 'center',
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  resultItem: {
    alignItems: 'center',
  },
  resultNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  finishButton: {
    backgroundColor: '#1E293B',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginBottom: 20,
  },
  quizSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  stepsContainer: {
    marginTop: 16,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#F1F5F9',
    marginBottom: 8,
    lineHeight: 20,
  },
  prayerContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#1E293B',
    borderRadius: 8,
  },
  prayerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  prayerText: {
    fontSize: 14,
    color: '#F1F5F9',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  audioControls: {
    alignItems: 'center',
    marginVertical: 20,
  },
  audioButton: {
    backgroundColor: '#553C9A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  audioButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  transcriptContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#1E293B',
    borderRadius: 8,
  },
  transcriptTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  benefitsContainer: {
    marginTop: 16,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 13,
    color: '#10B981',
    marginBottom: 4,
  },
  videoContainer: {
    marginVertical: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: 200,
  },
  materialsContainer: {
    marginTop: 16,
  },
  materialsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  materialText: {
    fontSize: 13,
    color: '#CBD5E1',
    marginBottom: 4,
  },
  meditationControls: {
    alignItems: 'center',
    marginVertical: 20,
  },
  durationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedDuration: {
    backgroundColor: '#553C9A',
    borderColor: '#8B5CF6',
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedDurationText: {
    color: '#E0E7FF',
    fontWeight: '600',
  },
  timerDisplay: {
    marginVertical: 20,
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  promptsContainer: {
    marginTop: 16,
  },
  promptsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 13,
    color: '#CBD5E1',
    marginBottom: 6,
    lineHeight: 20,
  },
  reflectionInput: {
    marginTop: 20,
  },
  reflectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  reflectionTextInput: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#334155',
  },
});