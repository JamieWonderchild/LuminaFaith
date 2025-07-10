import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render, createMockNavigation } from '@/tests/utils/test-utils';
import HomeScreen from '@/screens/HomeScreen';

// Mock navigation
const mockNavigation = createMockNavigation();

describe('HomeScreen Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all main sections correctly', async () => {
    const { getByText, findByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    // Check header elements
    await waitFor(() => {
      expect(getByText(/Good/)).toBeTruthy(); // Good Morning/Afternoon/Evening
      expect(getByText('Spiritual Seeker')).toBeTruthy();
    });

    // Check stats cards
    expect(getByText('Day Streak')).toBeTruthy();
    expect(getByText('Total XP')).toBeTruthy();
    expect(getByText('Level')).toBeTruthy();

    // Check level progress section
    expect(getByText(/Level \d+/)).toBeTruthy();

    // Check daily challenge
    expect(getByText('Daily Challenge')).toBeTruthy();
    expect(getByText('Mindful Moment')).toBeTruthy();

    // Check continue learning section
    expect(getByText('Continue Learning')).toBeTruthy();
    expect(getByText('Buddhism Fundamentals')).toBeTruthy();
  });

  it('navigates to Paths screen when continue learning is pressed', async () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    const continueButton = getByText('Buddhism Fundamentals');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Paths');
    });
  });

  it('navigates to Paths screen when explore paths button is pressed', async () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    const exploreButton = getByText('Explore Paths');
    fireEvent.press(exploreButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Paths');
  });

  it('navigates to Community screen when community button is pressed', async () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    const communityButton = getByText('Community');
    fireEvent.press(communityButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Community');
  });

  it('displays user statistics correctly', async () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    // Check that numeric values are displayed
    await waitFor(() => {
      expect(getByText('7')).toBeTruthy(); // Streak
      expect(getByText('1250')).toBeTruthy(); // XP
      expect(getByText('3')).toBeTruthy(); // Level
    });
  });

  it('shows correct progress in continue learning section', async () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      // Should show lesson 3 of 20 (based on mock data)
      expect(getByText('Lesson 3 of 20')).toBeTruthy();
    });
  });

  it('displays achievements when available', async () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('Recent Achievements')).toBeTruthy();
      expect(getByText('First Steps')).toBeTruthy();
      expect(getByText('Week Warrior')).toBeTruthy();
    });
  });

  it('renders floating action button', async () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('Start Learning')).toBeTruthy();
    });
  });

  it('handles daily challenge interaction', async () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    const challengeButton = getByText('Start Challenge');
    fireEvent.press(challengeButton);

    // Should not crash and button should be accessible
    expect(challengeButton).toBeTruthy();
  });

  it('displays correct greeting based on time', () => {
    // Mock different times
    const originalDate = Date;
    
    // Mock morning
    const mockMorning = new Date('2024-01-01T08:00:00');
    global.Date = jest.fn(() => mockMorning) as any;
    global.Date.now = jest.fn(() => mockMorning.getTime());
    Object.setPrototypeOf(global.Date, Date);

    const { getByText: getMorning } = render(
      <HomeScreen navigation={mockNavigation} />
    );
    expect(getMorning('Good Morning')).toBeTruthy();

    // Restore original Date
    global.Date = originalDate;
  });
});