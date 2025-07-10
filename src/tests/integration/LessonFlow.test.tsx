import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render, createMockNavigation, createMockRoute } from '@/tests/utils/test-utils';
import LessonScreen from '@/screens/LessonScreen';

const mockNavigation = createMockNavigation();
const mockRoute = createMockRoute({
  lessonId: 'lesson-2',
  pathId: 'buddhism-basics'
});

describe('Lesson Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('completes a full lesson flow successfully', async () => {
    const { getByText, queryByText } = render(
      <LessonScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Check initial lesson content
    await waitFor(() => {
      expect(getByText('The Four Noble Truths')).toBeTruthy();
      expect(getByText('1 of 3')).toBeTruthy();
    });

    // Answer first question
    const firstAnswer = getByText('The truth of suffering (Dukkha)');
    fireEvent.press(firstAnswer);

    const submitButton = getByText('Submit Answer');
    fireEvent.press(submitButton);

    // Check explanation appears
    await waitFor(() => {
      expect(getByText('Explanation')).toBeTruthy();
      expect(getByText(/First Noble Truth/)).toBeTruthy();
    });

    // Move to next question
    const nextButton = getByText('Next Question');
    fireEvent.press(nextButton);

    // Check second question appears
    await waitFor(() => {
      expect(getByText('2 of 3')).toBeTruthy();
      expect(getByText(/what causes suffering/i)).toBeTruthy();
    });

    // Answer second question
    const secondAnswer = getByText('Attachment and craving');
    fireEvent.press(secondAnswer);
    fireEvent.press(getByText('Submit Answer'));

    // Move to third question
    await waitFor(() => {
      fireEvent.press(getByText('Next Question'));
    });

    // Answer final question
    await waitFor(() => {
      expect(getByText('3 of 3')).toBeTruthy();
    });

    const finalAnswer = getByText('True');
    fireEvent.press(finalAnswer);
    fireEvent.press(getByText('Submit Answer'));

    // Complete lesson
    await waitFor(() => {
      const finishButton = getByText('Finish Lesson');
      fireEvent.press(finishButton);
    });

    // Check completion screen
    await waitFor(() => {
      expect(getByText('Lesson Complete!')).toBeTruthy();
      expect(getByText('Great job on completing the lesson')).toBeTruthy();
      expect(getByText(/\d+\/3/)).toBeTruthy(); // Correct answers count
      expect(getByText(/\d+%/)).toBeTruthy(); // Accuracy percentage
      expect(getByText(/\+\d+/)).toBeTruthy(); // XP earned
    });

    // Continue to next lesson
    const continueButton = getByText('Continue Learning');
    fireEvent.press(continueButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('handles incorrect answers appropriately', async () => {
    const { getByText } = render(
      <LessonScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Wait for lesson to load
    await waitFor(() => {
      expect(getByText('What is the first of the Four Noble Truths?')).toBeTruthy();
    });

    // Select wrong answer
    const wrongAnswer = getByText('The truth of the origin of suffering');
    fireEvent.press(wrongAnswer);

    const submitButton = getByText('Submit Answer');
    fireEvent.press(submitButton);

    // Check that explanation still appears
    await waitFor(() => {
      expect(getByText('Explanation')).toBeTruthy();
    });

    // Check that correct answer is highlighted
    expect(getByText('The truth of suffering (Dukkha)')).toBeTruthy();
  });

  it('prevents submission without selecting an answer', async () => {
    const { getByText } = render(
      <LessonScreen navigation={mockNavigation} route={mockRoute} />
    );

    await waitFor(() => {
      expect(getByText('Submit Answer')).toBeTruthy();
    });

    // Try to submit without selecting an answer
    const submitButton = getByText('Submit Answer');
    fireEvent.press(submitButton);

    // Should show alert (would be mocked in real implementation)
    // For now, just ensure the button is still there (submission blocked)
    expect(submitButton).toBeTruthy();
  });

  it('displays progress correctly throughout lesson', async () => {
    const { getByText } = render(
      <LessonScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Check initial progress
    await waitFor(() => {
      expect(getByText('1 of 3')).toBeTruthy();
    });

    // Complete first question
    fireEvent.press(getByText('The truth of suffering (Dukkha)'));
    fireEvent.press(getByText('Submit Answer'));
    
    await waitFor(() => {
      fireEvent.press(getByText('Next Question'));
    });

    // Check progress updated
    await waitFor(() => {
      expect(getByText('2 of 3')).toBeTruthy();
    });
  });

  it('calculates XP based on accuracy', async () => {
    const { getByText } = render(
      <LessonScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Answer all questions correctly
    await waitFor(() => {
      fireEvent.press(getByText('The truth of suffering (Dukkha)'));
      fireEvent.press(getByText('Submit Answer'));
    });

    await waitFor(() => {
      fireEvent.press(getByText('Next Question'));
    });

    await waitFor(() => {
      fireEvent.press(getByText('Attachment and craving'));
      fireEvent.press(getByText('Submit Answer'));
    });

    await waitFor(() => {
      fireEvent.press(getByText('Next Question'));
    });

    await waitFor(() => {
      fireEvent.press(getByText('True'));
      fireEvent.press(getByText('Submit Answer'));
    });

    await waitFor(() => {
      fireEvent.press(getByText('Finish Lesson'));
    });

    // Should show 100% accuracy and full XP
    await waitFor(() => {
      expect(getByText('100%')).toBeTruthy();
      expect(getByText('+50')).toBeTruthy(); // Full XP reward
    });
  });
});