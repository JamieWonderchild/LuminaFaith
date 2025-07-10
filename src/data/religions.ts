import { Religion, LearningPath, Lesson, Question } from '../types';

export const religions: Religion[] = [
  {
    id: 'buddhism',
    name: 'buddhism',
    displayName: 'Buddhism',
    icon: '🧘',
    color: '#FF6B35',
    description: 'Explore the teachings of Buddha, meditation practices, and the path to enlightenment.',
    totalPaths: 8,
    estimatedDuration: '3-4 months'
  },
  {
    id: 'christianity',
    name: 'christianity',
    displayName: 'Christianity',
    icon: '✝️',
    color: '#4A90E2',
    description: 'Learn about Jesus Christ, Christian values, and the diverse traditions of Christianity.',
    totalPaths: 12,
    estimatedDuration: '4-5 months'
  },
  {
    id: 'islam',
    name: 'islam',
    displayName: 'Islam',
    icon: '☪️',
    color: '#50C878',
    description: 'Understand the teachings of the Quran, Islamic practices, and the Five Pillars.',
    totalPaths: 10,
    estimatedDuration: '3-4 months'
  },
  {
    id: 'hinduism',
    name: 'hinduism',
    displayName: 'Hinduism',
    icon: '🕉️',
    color: '#FF8C00',
    description: 'Discover ancient wisdom, diverse traditions, and spiritual practices of Hinduism.',
    totalPaths: 15,
    estimatedDuration: '5-6 months'
  },
  {
    id: 'judaism',
    name: 'judaism',
    displayName: 'Judaism',
    icon: '✡️',
    color: '#6B46C1',
    description: 'Learn about Jewish history, traditions, and the rich tapestry of Jewish culture.',
    totalPaths: 9,
    estimatedDuration: '3-4 months'
  },
  {
    id: 'interfaith',
    name: 'interfaith',
    displayName: 'Interfaith Studies',
    icon: '🌍',
    color: '#E11D48',
    description: 'Compare and contrast different religious traditions and explore common values.',
    totalPaths: 6,
    estimatedDuration: '2-3 months'
  }
];

// Sample questions for Buddhism path
const buddhismQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    question: 'What is the first of the Four Noble Truths?',
    options: [
      'The truth of suffering (Dukkha)',
      'The truth of the origin of suffering',
      'The truth of the cessation of suffering',
      'The truth of the path to the cessation of suffering'
    ],
    correctAnswer: 'The truth of suffering (Dukkha)',
    explanation: 'The First Noble Truth acknowledges that suffering is an inherent part of existence.',
    difficulty: 'easy',
    tags: ['four-noble-truths', 'basic-concepts']
  },
  {
    id: 'q2',
    type: 'multiple-choice',
    question: 'How many steps are in the Noble Eightfold Path?',
    options: ['6', '8', '10', '12'],
    correctAnswer: '8',
    explanation: 'The Noble Eightfold Path consists of eight interconnected steps toward enlightenment.',
    difficulty: 'easy',
    tags: ['eightfold-path', 'basic-concepts']
  },
  {
    id: 'q3',
    type: 'true-false',
    question: 'The Buddha taught that all suffering comes from attachment and craving.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'The Second Noble Truth states that the root of suffering is attachment (tanha) and craving.',
    difficulty: 'medium',
    tags: ['four-noble-truths', 'attachment']
  }
];

// Sample lessons for Buddhism
const buddhismLessons: Lesson[] = [
  {
    id: 'lesson-1',
    pathId: 'buddhism-basics',
    title: 'Who Was the Buddha?',
    description: 'Learn about the life and awakening of Siddhartha Gautama.',
    type: 'reading',
    content: {
      text: `Siddhartha Gautama, who became known as the Buddha ("the awakened one"), was born around 563 BCE in what is now Nepal. He was a prince who lived in luxury until he encountered the realities of aging, sickness, and death.

This encounter led him to leave his comfortable life and seek understanding of suffering and the path to liberation. After years of spiritual practice, he achieved enlightenment under the Bodhi tree and spent the rest of his life teaching others.

The Buddha's teachings, known as the Dharma, form the foundation of Buddhism practiced by millions worldwide today.`,
      images: ['buddha-statue.jpg', 'bodhi-tree.jpg'],
      references: [
        {
          title: 'The Life of Buddha',
          source: 'Buddhist Studies',
          type: 'scholarly'
        }
      ]
    },
    duration: 5,
    xpReward: 25,
    isCompleted: false
  },
  {
    id: 'lesson-2',
    pathId: 'buddhism-basics',
    title: 'The Four Noble Truths',
    description: 'Understand the core teaching of Buddhism.',
    type: 'quiz',
    content: {
      text: `The Four Noble Truths are the foundation of Buddhist teaching:

1. **Dukkha** - Life contains suffering and dissatisfaction
2. **Samudaya** - Suffering arises from attachment and craving
3. **Nirodha** - Suffering can be overcome and ended
4. **Magga** - The path to end suffering is the Noble Eightfold Path

These truths provide a framework for understanding human experience and the path to liberation.`,
      questions: buddhismQuestions,
      references: [
        {
          title: 'Dhammacakkappavattana Sutta',
          source: 'Pali Canon',
          type: 'scripture'
        }
      ]
    },
    duration: 10,
    xpReward: 50,
    isCompleted: false
  },
  {
    id: 'lesson-3',
    pathId: 'buddhism-basics',
    title: 'Introduction to Meditation',
    description: 'Learn the basics of mindfulness meditation.',
    type: 'interactive',
    content: {
      text: `Meditation is a central practice in Buddhism. Mindfulness meditation helps develop awareness of the present moment and understanding of the nature of mind.

**Basic Meditation Steps:**
1. Find a quiet, comfortable place to sit
2. Close your eyes or soften your gaze
3. Focus on your breath
4. When thoughts arise, gently return attention to breath
5. Practice for 5-10 minutes initially`,
      audio: 'guided-meditation-intro.mp3',
      activities: [
        {
          id: 'meditation-1',
          type: 'meditation',
          title: '5-Minute Guided Meditation',
          instructions: 'Follow along with this guided meditation for beginners.',
          duration: 5
        }
      ]
    },
    duration: 15,
    xpReward: 75,
    isCompleted: false
  }
];

export const learningPaths: LearningPath[] = [
  {
    id: 'buddhism-basics',
    religionId: 'buddhism',
    title: 'Buddhism Fundamentals',
    description: 'Start your journey with the core teachings of Buddhism.',
    level: 'beginner',
    totalLessons: 20,
    estimatedTime: '15 minutes per lesson',
    lessons: buddhismLessons,
    progress: {
      completedLessons: 0,
      totalLessons: 20,
      xpEarned: 0,
      accuracy: 0,
      streak: 0
    }
  },
  {
    id: 'meditation-practice',
    religionId: 'buddhism',
    title: 'Meditation & Mindfulness',
    description: 'Develop your meditation practice with guided sessions.',
    level: 'beginner',
    totalLessons: 15,
    estimatedTime: '10-20 minutes per lesson',
    prerequisites: ['buddhism-basics'],
    lessons: [],
    progress: {
      completedLessons: 0,
      totalLessons: 15,
      xpEarned: 0,
      accuracy: 0,
      streak: 0
    }
  },
  {
    id: 'christian-basics',
    religionId: 'christianity',
    title: 'Christianity Essentials',
    description: 'Explore the life and teachings of Jesus Christ.',
    level: 'beginner',
    totalLessons: 18,
    estimatedTime: '12 minutes per lesson',
    lessons: [],
    progress: {
      completedLessons: 0,
      totalLessons: 18,
      xpEarned: 0,
      accuracy: 0,
      streak: 0
    }
  },
  {
    id: 'islam-basics',
    religionId: 'islam',
    title: 'Islam Foundations',
    description: 'Learn about the Five Pillars and Islamic teachings.',
    level: 'beginner',
    totalLessons: 16,
    estimatedTime: '14 minutes per lesson',
    lessons: [],
    progress: {
      completedLessons: 0,
      totalLessons: 16,
      xpEarned: 0,
      accuracy: 0,
      streak: 0
    }
  }
];