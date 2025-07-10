import React from 'react';
import { render } from '@/tests/utils/test-utils';
import ProgressBar from '../ProgressBar';

describe('ProgressBar Component', () => {
  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <ProgressBar progress={50} testID="progress-bar" />
    );
    
    expect(getByTestId('progress-bar')).toBeTruthy();
  });

  it('handles progress values correctly', () => {
    // Test normal progress
    const { rerender, getByTestId } = render(
      <ProgressBar progress={75} testID="progress-bar" />
    );
    expect(getByTestId('progress-bar')).toBeTruthy();

    // Test edge cases
    rerender(<ProgressBar progress={0} testID="progress-bar" />);
    expect(getByTestId('progress-bar')).toBeTruthy();

    rerender(<ProgressBar progress={100} testID="progress-bar" />);
    expect(getByTestId('progress-bar')).toBeTruthy();

    // Test values outside normal range
    rerender(<ProgressBar progress={-10} testID="progress-bar" />);
    expect(getByTestId('progress-bar')).toBeTruthy();

    rerender(<ProgressBar progress={150} testID="progress-bar" />);
    expect(getByTestId('progress-bar')).toBeTruthy();
  });

  it('renders with custom height', () => {
    const { getByTestId } = render(
      <ProgressBar progress={50} height={12} testID="progress-bar" />
    );
    
    expect(getByTestId('progress-bar')).toBeTruthy();
  });

  it('renders with custom colors', () => {
    const { getByTestId } = render(
      <ProgressBar 
        progress={50} 
        backgroundColor="#FF0000" 
        progressColor="#00FF00"
        testID="progress-bar" 
      />
    );
    
    expect(getByTestId('progress-bar')).toBeTruthy();
  });

  it('renders with and without gradient', () => {
    const { getByTestId, rerender } = render(
      <ProgressBar progress={50} showGradient={true} testID="progress-bar" />
    );
    expect(getByTestId('progress-bar')).toBeTruthy();

    rerender(
      <ProgressBar progress={50} showGradient={false} testID="progress-bar" />
    );
    expect(getByTestId('progress-bar')).toBeTruthy();
  });
});