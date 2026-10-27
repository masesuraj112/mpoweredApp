import { StyleSheet, Text, View } from 'react-native';
import type { ProfileSection } from '@/features/health-profile/profile';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

interface ProfileSectionCardProps {
  section: ProfileSection;
  /** Shows the week the answers come from under the title */
  showPeriod?: boolean;
}

export function ProfileSectionCard({ section, showPeriod = false }: ProfileSectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.cardTitle}>{section.title}</Text>
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

const GROUPED_TERTIARY = '#F2F2F7';
const OUTLINE_VARIANT = '#CAC4D0';
const ON_SURFACE = '#1D1B20';
const ON_SURFACE_VARIANT = '#49454F';
const ERROR_CONTAINER = '#F9DEDC';
const ON_ERROR_CONTAINER = '#410E0B';

const styles = StyleSheet.create({
  card: {
    backgroundColor: GROUPED_TERTIARY,
    borderRadius: scaleWidth(12),
    marginHorizontal: scaleWidth(32),
    marginBottom: scaleHeight(25),
    paddingTop: scaleHeight(20),
    paddingBottom: scaleHeight(12),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: scaleWidth(26),
  },
  cardTitle: {
    flexShrink: 1,
    fontSize: scaleFont(20),
    lineHeight: scaleFont(24),
    color: 'black',
  },
  incompleteBadge: {
    backgroundColor: ERROR_CONTAINER,
    borderRadius: scaleWidth(8),
    paddingHorizontal: scaleWidth(8),
    paddingVertical: scaleHeight(2),
    marginLeft: scaleWidth(8),
  },
  incompleteBadgeText: {
    fontSize: scaleFont(11),
    fontWeight: '600',
    color: ON_ERROR_CONTAINER,
  },
  cardSubtitle: {
    fontSize: scaleFont(12),
    lineHeight: scaleFont(16),
    letterSpacing: 0.4,
    color: ON_SURFACE,
    marginHorizontal: scaleWidth(26),
    marginTop: scaleHeight(4),
  },
  cardDivider: {
    height: 1,
    backgroundColor: OUTLINE_VARIANT,
    marginHorizontal: scaleWidth(26),
    marginTop: scaleHeight(8),
    marginBottom: scaleHeight(6),
  },
  item: {
    paddingHorizontal: scaleWidth(30),
    paddingVertical: scaleHeight(8),
  },
  itemDetail: {
    paddingVertical: scaleHeight(10),
  },
  itemLabel: {
    fontSize: scaleFont(12),
    lineHeight: scaleFont(16),
    fontWeight: '500',
    letterSpacing: 0.5,
    color: ON_SURFACE_VARIANT,
  },
  itemValue: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(24),
    letterSpacing: 0.5,
    color: ON_SURFACE,
  },
  itemValueCompact: {
    fontSize: scaleFont(12),
    lineHeight: scaleFont(16),
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  itemValueDetail: {
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
    letterSpacing: 0.25,
  },
  incompleteText: {
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
    fontStyle: 'italic',
    color: ON_SURFACE_VARIANT,
    paddingHorizontal: scaleWidth(30),
    paddingVertical: scaleHeight(8),
  },
});
