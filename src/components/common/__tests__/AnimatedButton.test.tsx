import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from '@/tests/utils/test-utils';
import AnimatedButton from '../AnimatedButton';

// Mock timer functions for animation testing
jest.useFakeTimers();

describe('AnimatedButton Component', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(
      <AnimatedButton title="Animated Button" onPress={jest.fn()} />
    );
    
    expect(getByText('Animated Button')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <AnimatedButton title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    
    // Fast forward animation
    jest.advanceTimersByTime(1000);
    
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <AnimatedButton title="Disabled" onPress={mockOnPress} disabled={true} />
    );
    
    fireEvent.press(getByText('Disabled'));
    jest.advanceTimersByTime(1000);
    
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('shows loading text when loading', () => {
    const { getByText } = render(
      <AnimatedButton title="Submit" onPress={jest.fn()} loading={true} />
    );
    
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders different variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost'] as const;
    
    variants.forEach((variant) => {
      const { getByText } = render(
        <AnimatedButton title={variant} onPress={jest.fn()} variant={variant} />
      );
      expect(getByText(variant)).toBeTruthy();
    });
  });

  it('handles press in and press out events', () => {
    const { getByText } = render(
      <AnimatedButton title="Test" onPress={jest.fn()} />
    );
    
    const button = getByText('Test');
    
    // Simulate press in
    fireEvent(button, 'pressIn');
    
    // Simulate press out
    fireEvent(button, 'pressOut');
    
    // Should not throw any errors
    expect(button).toBeTruthy();
  });
});