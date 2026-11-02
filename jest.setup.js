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
