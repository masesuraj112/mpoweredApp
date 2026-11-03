import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Divider } from '@/components/ui/Divider';
import { makeStyles, Radius, Spacing } from '@/constants/theme';

type UserTypeCardProps = {
  title: string;
  description: string;
  benefits: readonly string[];
  selected: boolean;
  onPress: () => void;
};

/** One of the "Which describes you best?" choices: a title, a short description and what you get. */
export function UserTypeCard({ title, description, benefits, selected, onPress }: UserTypeCardProps) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={title}
      accessibilityHint={description}
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="titleMedium" color="onSurface">
            {title}
          </AppText>
          <AppText variant="bodySmall" color="onSurfaceVariant">
            {description}
          </AppText>
        </View>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected ? <View style={styles.radioDot} /> : null}
        </View>
      </View>

      <Divider />

      <View style={styles.benefits}>
        {benefits.map((benefit) => (
          <View key={benefit} style={styles.benefit}>
            <View style={[styles.bullet, selected && styles.bulletSelected]} />
            <AppText variant="labelLarge" color="onSurfaceVariant" style={styles.benefitText}>
              {benefit}
            </AppText>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const RADIO_SIZE = 22;
const DOT_SIZE = 12;
const BULLET_SIZE = 6;

const useStyles = makeStyles((colors) => ({
  card: {
    gap: Spacing.mid,
    padding: Spacing.three,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: Radius.large,
    backgroundColor: colors.surfaceContainer,
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  headerText: {
    flex: 1,
    gap: Spacing.one,
  },
  radio: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.outline,
    borderRadius: RADIO_SIZE / 2,
  },
  radioSelected: {
    borderColor: colors.primaryContainer,
    backgroundColor: colors.primaryContainer,
  },
  radioDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.primary,
  },
  benefits: {
    gap: Spacing.two,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.mid,
  },
  bullet: {
    width: BULLET_SIZE,
    height: BULLET_SIZE,
    borderRadius: BULLET_SIZE / 2,
    backgroundColor: colors.outline,
  },
  bulletSelected: {
    backgroundColor: colors.primary,
  },
  benefitText: {
    flex: 1,
  },
}));
