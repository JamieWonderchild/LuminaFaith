import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from '@/tests/utils/test-utils';
import Button from '../Button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={jest.fn()} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders different variants correctly', () => {
    const { getByText: getPrimary } = render(
      <Button title="Primary" onPress={jest.fn()} variant="primary" />
    );
    
    const { getByText: getSecondary } = render(
      <Button title="Secondary" onPress={jest.fn()} variant="secondary" />
    );
    
    const { getByText: getOutline } = render(
      <Button title="Outline" onPress={jest.fn()} variant="outline" />
    );

    expect(getPrimary('Primary')).toBeTruthy();
    expect(getSecondary('Secondary')).toBeTruthy();
    expect(getOutline('Outline')).toBeTruthy();
  });

  it('renders different sizes correctly', () => {
    const { getByText: getSmall } = render(
      <Button title="Small" onPress={jest.fn()} size="small" />
    );
    
    const { getByText: getMedium } = render(
      <Button title="Medium" onPress={jest.fn()} size="medium" />
    );
    
    const { getByText: getLarge } = render(
      <Button title="Large" onPress={jest.fn()} size="large" />
    );

    expect(getSmall('Small')).toBeTruthy();
    expect(getMedium('Medium')).toBeTruthy();
    expect(getLarge('Large')).toBeTruthy();
  });

  it('disables press when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Disabled Button" onPress={mockOnPress} disabled={true} />
    );
    
    fireEvent.press(getByText('Disabled Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('shows loading text when loading prop is true', () => {
    const { getByText } = render(
      <Button title="Submit" onPress={jest.fn()} loading={true} />
    );
    
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders icon when provided', () => {
    const { getByText } = render(
      <Button title="With Icon" onPress={jest.fn()} icon="🔥" />
    );
    
    expect(getByText('🔥')).toBeTruthy();
    expect(getByText('With Icon')).toBeTruthy();
  });
});