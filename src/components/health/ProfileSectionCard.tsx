import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Divider } from '@/components/ui/Divider';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { ProfileSection } from '@/features/health-profile/profile';

type ProfileSectionCardProps = {
  section: ProfileSection;
  /** Shows the week the answers come from under the title */
  showPeriod?: boolean;
};

/** One section of the pain profile: a titled grey card of labelled answers, or a note that it is incomplete. */
export function ProfileSectionCard({ section, showPeriod = false }: ProfileSectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <AppText accessibilityRole="header" variant="titleLarge" style={styles.title}>
          {section.title}
        </AppText>
        {!section.complete && (
          <View style={styles.incompleteBadge}>
            <AppText variant="labelSmall" color="onErrorContainer">
              Incomplete
            </AppText>
          </View>
        )}
      </View>
      {section.subtitle && (
        <AppText variant="bodySmall" color="onSurface" style={styles.subtitle}>
          {section.subtitle}
        </AppText>
      )}
      {showPeriod && section.period && (
        <AppText variant="bodySmall" color="onSurface" style={styles.subtitle}>
          Period: {section.period}
        </AppText>
      )}
      <Divider style={styles.rule} />

      {section.complete ? (
        section.items.map((item) => (
          <View key={item.label} style={styles.item}>
            <AppText variant="labelMedium" color="onSurfaceVariant">
              {item.label}
            </AppText>
            <AppText
              variant={
                section.variant === 'compact' ? 'labelMedium' : section.variant === 'detail' ? 'bodyMediumRegular' : 'bodyLarge'
              }
              color="onSurface">
              {item.value}
            </AppText>
          </View>
        ))
      ) : (
        <AppText variant="bodyMediumRegular" color="onSurfaceVariant" style={styles.incompleteText}>
          {section.incompleteMessage}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.mid,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.card,
    backgroundColor: Colors.light.surfaceGrouped,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flexShrink: 1,
  },
  incompleteBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.medium,
    backgroundColor: Colors.light.errorContainer,
  },
  subtitle: {
    marginTop: Spacing.one,
  },
  rule: {
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  item: {
    paddingVertical: Spacing.two,
  },
  incompleteText: {
    fontStyle: 'italic',
    paddingVertical: Spacing.two,
  },
});
