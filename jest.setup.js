/* global jest */
// Lets modules that import @/lib/supabase load without real credentials.
process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// No native notifications module under Jest: the real hook crashes reading a tap that isn't there.
// A phone with no tapped notification returns null, so do the same. Everything else stays real.
jest.mock('expo-notifications', () => ({
  ...jest.requireActual('expo-notifications'),
  useLastNotificationResponse: () => null,
}));

// No biometrics under Jest: a phone with Face ID set up that always lets its owner in. Tests change
// authenticateAsync / getEnrolledLevelAsync to try the other cases.
jest.mock('expo-local-authentication', () => ({
  SecurityLevel: { NONE: 0, SECRET: 1, BIOMETRIC_WEAK: 2, BIOMETRIC_STRONG: 3 },
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
  getEnrolledLevelAsync: jest.fn(async () => 3),
  isEnrolledAsync: jest.fn(async () => true),
  supportedAuthenticationTypesAsync: jest.fn(async () => [2]),
  authenticateAsync: jest.fn(async () => ({ success: true })),
}));

// @expo/ui draws real SwiftUI / Compose views, which Jest can't render or tap. Stand in plain React Native
// views that behave the same: a Host that passes its props through, and a Switch that toggles when
// pressed and carries its name and state for screen readers (as the native one does).
jest.mock('@expo/ui', () => {
  const React = require('react');
  const { Pressable, View } = require('react-native');
  return {
    ...jest.requireActual('@expo/ui'),
    Host: ({ children, matchContents: _m, seedColor: _s, ...props }) => React.createElement(View, props, children),
    Switch: ({ value, onValueChange, label, disabled, testID }) =>
      React.createElement(Pressable, {
        accessibilityRole: 'switch',
        accessibilityLabel: label,
        accessibilityState: { checked: value, disabled: !!disabled },
        disabled,
        testID,
        onPress: () => onValueChange(!value),
      }),
    // A slider screen readers can step up and down, as the native one can.
    Slider: ({ value, onValueChange, min = 0, max = 1, step = 1, disabled }) =>
      React.createElement(View, {
        accessibilityRole: 'adjustable',
        accessibilityValue: { min, max, now: value },
        accessibilityState: { disabled: !!disabled },
        accessibilityActions: [{ name: 'increment' }, { name: 'decrement' }],
        onAccessibilityAction: (event) =>
          onValueChange(Math.min(max, Math.max(min, value + (event.nativeEvent.actionName === 'increment' ? step : -step)))),
      }),
    // A menu picker: one pressable per option, so a test can choose one by its label.
    Picker: Object.assign(
      ({ selectedValue, onValueChange, children }) =>
        React.createElement(
          View,
          { accessibilityRole: 'combobox', accessibilityValue: { text: String(selectedValue) } },
          React.Children.toArray(children).map((child) =>
            React.createElement(Pressable, {
              key: String(child.props.value),
              accessibilityRole: 'menuitem',
              accessibilityLabel: child.props.label,
              accessibilityState: { selected: child.props.value === selectedValue },
              onPress: () => onValueChange(child.props.value),
            }),
          ),
        ),
      { Item: () => null },
    ),
  };
});
