import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing } from '@/constants/theme';

type ShortcutCardProps = {
  title: string;
  actionLabel: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

/** A card in the planner carousel that links to another part of the app. */
export function ShortcutCard({ title, actionLabel, onPress, style }: ShortcutCardProps) {
  return (
    <Card style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>
      <Button label={actionLabel} onPress={onPress} style={styles.action} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: Colors.light.text,
  },
  action: {
    alignSelf: 'flex-start',
  },
});
