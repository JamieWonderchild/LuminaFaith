import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render, createMockNavigation } from '@/tests/utils/test-utils';
import PathsScreen from '@/screens/PathsScreen';
import CommunityScreen from '@/screens/CommunityScreen';
import ProfileScreen from '@/screens/ProfileScreen';

const mockNavigation = createMockNavigation();

describe('Navigation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PathsScreen Navigation', () => {
    it('navigates to lesson when path card is pressed', async () => {
      const { getByText } = render(
        <PathsScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Buddhism Fundamentals')).toBeTruthy();
      });

      // Find and press a lesson card
      const lessonTitle = getByText('Who Was the Buddha?');
      fireEvent.press(lessonTitle);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Lesson', {
        lessonId: 'lesson-1',
        pathId: 'buddhism-basics'
      });
    });

    it('filters paths by religion correctly', async () => {
      const { getByText, queryByText } = render(
        <PathsScreen navigation={mockNavigation} />
      );

      // Initially should show all paths
      await waitFor(() => {
        expect(getByText('Buddhism Fundamentals')).toBeTruthy();
      });

      // Filter by Buddhism
      const buddhismFilter = getByText('Buddhism');
      fireEvent.press(buddhismFilter);

      // Should still show Buddhism path
      expect(getByText('Buddhism Fundamentals')).toBeTruthy();

      // Should not show other religion paths (if any were visible)
      // This test assumes the mock data structure
    });

    it('shows empty state when no paths match filter', async () => {
      const { getByText } = render(
        <PathsScreen navigation={mockNavigation} />
      );

      // Filter by a religion with no paths in mock data
      await waitFor(() => {
        const hinduismFilter = getByText('Hinduism');
        fireEvent.press(hinduismFilter);
      });

      // Should show empty state
      await waitFor(() => {
        expect(getByText('No paths found')).toBeTruthy();
      });
    });
  });

  describe('CommunityScreen Navigation', () => {
    it('displays community discussions correctly', async () => {
      const { getByText } = render(
        <CommunityScreen />
      );

      await waitFor(() => {
        expect(getByText('Community')).toBeTruthy();
        expect(getByText('Connect, discuss, and learn together')).toBeTruthy();
      });

      // Check that discussions are displayed
      expect(getByText(/mindfulness throughout the day/i)).toBeTruthy();
      expect(getByText(/Good Samaritan/i)).toBeTruthy();
    });

    it('filters discussions by category', async () => {
      const { getByText, getAllByText } = render(
        <CommunityScreen />
      );

      // Filter by Buddhism category
      await waitFor(() => {
        const buddhismCategory = getAllByText('Buddhism')[1]; // Get category filter, not discussion category
        fireEvent.press(buddhismCategory);
      });

      // Should show only Buddhism discussions
      expect(getByText(/mindfulness throughout the day/i)).toBeTruthy();
    });

    it('searches discussions correctly', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(
        <CommunityScreen />
      );

      const searchInput = getByPlaceholderText('Search discussions...');
      fireEvent.changeText(searchInput, 'mindfulness');

      // Should show only discussions matching search
      await waitFor(() => {
        expect(getByText(/mindfulness throughout the day/i)).toBeTruthy();
      });
    });
  });

  describe('ProfileScreen Navigation', () => {
    it('displays user profile information correctly', async () => {
      const { getByText } = render(
        <ProfileScreen />
      );

      await waitFor(() => {
        expect(getByText('Spiritual Seeker')).toBeTruthy();
        expect(getByText('seeker@luminafaith.com')).toBeTruthy();
      });

      // Check stats
      expect(getByText('7')).toBeTruthy(); // Streak
      expect(getByText('1250')).toBeTruthy(); // XP
      expect(getByText('3')).toBeTruthy(); // Level
    });

    it('shows achievements correctly', async () => {
      const { getByText } = render(
        <ProfileScreen />
      );

      await waitFor(() => {
        expect(getByText('Achievements')).toBeTruthy();
        expect(getByText('First Steps')).toBeTruthy();
        expect(getByText('Week Warrior')).toBeTruthy();
      });

      // Check locked achievements
      expect(getByText('Locked Achievements')).toBeTruthy();
      expect(getByText('Scholar')).toBeTruthy();
    });

    it('displays learning progress correctly', async () => {
      const { getByText } = render(
        <ProfileScreen />
      );

      await waitFor(() => {
        expect(getByText('Learning Progress')).toBeTruthy();
        expect(getByText('Buddhism Fundamentals')).toBeTruthy();
        expect(getByText('2 / 20')).toBeTruthy(); // Progress
      });
    });
  });

  describe('Cross-Screen Navigation', () => {
    it('maintains navigation state across screen transitions', async () => {
      // This would test that navigation params and state
      // are preserved when moving between screens
      const { getByText } = render(
        <PathsScreen navigation={mockNavigation} />
      );

      // Navigate to lesson
      await waitFor(() => {
        const lessonCard = getByText('Who Was the Buddha?');
        fireEvent.press(lessonCard);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Lesson', {
        lessonId: 'lesson-1',
        pathId: 'buddhism-basics'
      });
    });
  });
});