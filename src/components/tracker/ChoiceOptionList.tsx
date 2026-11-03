import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

/**
 * The bordered box that holds a question's answer options inside a `ChoiceCard`. It takes the space
 * the card has left, and scrolls when the options (or large system text) do not fit.
 */
export function ChoiceOptionList({ children, testID }: { children: ReactNode; testID?: string }) {
  return (
    <View testID={testID} style={styles.box}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.divider,
    borderRadius: Radius.card,
    backgroundColor: Colors.light.surface,
  },
});
