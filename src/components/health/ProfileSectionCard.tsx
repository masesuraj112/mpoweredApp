import { Text, View } from 'react-native';
import type { ProfileSection } from '@/features/health-profile/profile';

import { makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
/** One section of the pain profile: a titled card of labelled answers, or a note that it is incomplete. */
interface ProfileSectionCardProps {
  section: ProfileSection;
  /** Shows the week the answers come from under the title */
  showPeriod?: boolean;
}

export function ProfileSectionCard({ section, showPeriod = false }: ProfileSectionCardProps) {
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={styles.cardTitle}>
          {section.title}
        </Text>
        {!section.complete && (
          <View style={styles.incompleteBadge}>
            <Text style={styles.incompleteBadgeText}>Incomplete</Text>
          </View>
        )}
      </View>
      {section.subtitle && <Text style={styles.cardSubtitle}>{section.subtitle}</Text>}
      {showPeriod && section.period && <Text style={styles.cardSubtitle}>Period: {section.period}</Text>}
      <View style={styles.cardDivider} />

      {section.complete ? (
        section.items.map((item) => (
          <View key={item.label} style={[styles.item, section.variant === 'detail' && styles.itemDetail]}>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Text
              style={[
                styles.itemValue,
                section.variant === 'compact' && styles.itemValueCompact,
                section.variant === 'detail' && styles.itemValueDetail,
              ]}
            >
              {item.value}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.incompleteText}>{section.incompleteMessage}</Text>
      )}
    </View>
  );
}


const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: Radius.card,
    marginHorizontal: Spacing.five,
    marginBottom: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.four,
  },
  cardTitle: {
    flexShrink: 1,
    ...Typography.titleSmall,
    color: colors.text,
  },
  incompleteBadge: {
    backgroundColor: colors.errorContainer,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginLeft: Spacing.two,
  },
  incompleteBadgeText: {
    ...Typography.caption,
    fontWeight: '600',
    color: colors.onErrorContainer,
  },
  cardSubtitle: {
    ...Typography.caption,
    letterSpacing: 0.4,
    color: colors.text,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.one,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.outline,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  item: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
  },
  itemDetail: {
    paddingVertical: Spacing.two,
  },
  itemLabel: {
    ...Typography.caption,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: colors.textSecondary,
  },
  itemValue: {
    ...Typography.bodyLarge,
    letterSpacing: 0.5,
    color: colors.text,
  },
  itemValueCompact: {
    color: colors.text,
    ...Typography.caption,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  itemValueDetail: {
    color: colors.text,
    ...Typography.bodySmall,
    letterSpacing: 0.25,
  },
  incompleteText: {
    ...Typography.bodySmall,
    fontStyle: 'italic',
    color: colors.textSecondary,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
  },
}));
