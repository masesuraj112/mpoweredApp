import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing } from '@/constants/theme';
import { describeAccess, describeContact } from '@/features/care-planner/supportPerson';
import type { SupportPerson } from '@/features/care-planner/types';

type SupportPersonListProps = {
  people: readonly SupportPerson[];
  onRemove: (index: number) => void;
};

/** The support people already added to this appointment, each with a Remove button. */
export function SupportPersonList({ people, onRemove }: SupportPersonListProps) {
  if (people.length === 0) return null;

  return (
    <View style={styles.list}>
      <Text accessibilityRole="header" style={styles.heading}>
        Support people added
      </Text>
      {people.map((person, index) => {
        const contact = describeContact(person);
        return (
          <Card key={`${person.name}-${index}`} variant="muted" style={styles.row}>
            <View style={styles.details}>
              <Text style={styles.name}>{person.name}</Text>
              {contact ? <Text style={styles.detail}>{contact}</Text> : null}
              <Text style={styles.detail}>{describeAccess(person)}</Text>
            </View>
            <Button
              label="Remove"
              accessibilityLabel={`Remove ${person.name}`}
              variant="tonal"
              onPress={() => onRemove(index)}
            />
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  heading: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
    color: Colors.light.onSurface,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  details: {
    flexShrink: 1,
    gap: Spacing.half,
  },
  name: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: Colors.light.onSurface,
  },
  detail: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: Colors.light.onSurfaceVariant,
  },
});
