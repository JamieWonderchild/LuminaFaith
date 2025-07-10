import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render, mockLesson } from '@/tests/utils/test-utils';
import LessonCard from '../LessonCard';

describe('LessonCard Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders lesson information correctly', () => {
    const { getByText } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} />
    );

    expect(getByText(mockLesson.title)).toBeTruthy();
    expect(getByText(mockLesson.description)).toBeTruthy();
    expect(getByText(`${mockLesson.duration} min`)).toBeTruthy();
    expect(getByText(`${mockLesson.xpReward} XP`)).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const { getByText } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} />
    );

    fireEvent.press(getByText(mockLesson.title));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('displays correct lesson type icon and name', () => {
    const { getByText } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} />
    );

    expect(getByText('❓')).toBeTruthy(); // Quiz icon
    expect(getByText('Quiz')).toBeTruthy(); // Quiz type name
  });

  it('shows completed status when lesson is completed', () => {
    const completedLesson = { ...mockLesson, isCompleted: true };
    const { getByText } = render(
      <LessonCard lesson={completedLesson} onPress={mockOnPress} />
    );

    expect(getByText('Completed')).toBeTruthy();
    expect(getByText('✅')).toBeTruthy();
  });

  it('shows progress bar when progress is provided', () => {
    const { getByText } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} progress={75} />
    );

    expect(getByText('75%')).toBeTruthy();
  });

  it('displays locked state correctly', () => {
    const { getByText } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} isLocked={true} />
    );

    expect(getByText('🔒')).toBeTruthy();
    expect(getByText('Complete previous lessons to unlock')).toBeTruthy();
  });

  it('shows next lesson indicator', () => {
    const { getByText } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} isNext={true} />
    );

    expect(getByText('NEXT')).toBeTruthy();
  });

  it('does not trigger onPress when locked', () => {
    const { getByText } = render(
      <LessonCard lesson={mockLesson} onPress={mockOnPress} isLocked={true} />
    );

    // Try to press the locked card
    fireEvent.press(getByText(mockLesson.title));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('renders different lesson types with correct icons', () => {
    const lessonTypes = [
      { type: 'reading', icon: '📖' },
      { type: 'audio', icon: '🎧' },
      { type: 'video', icon: '📹' },
      { type: 'interactive', icon: '🎮' },
      { type: 'meditation', icon: '🧘' },
      { type: 'reflection', icon: '💭' }
    ];

    lessonTypes.forEach(({ type, icon }) => {
      const lesson = { ...mockLesson, type: type as any };
      const { getByText } = render(
        <LessonCard lesson={lesson} onPress={mockOnPress} />
      );
      expect(getByText(icon)).toBeTruthy();
    });
  });
});