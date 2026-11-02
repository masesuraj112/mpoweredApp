import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrescriptionsHeader } from '@/components/mpowered/PrescriptionsHeader';
import { ProfileSectionCard } from '@/components/mpowered/ProfileSectionCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { getLocalToday } from '@/features/assessments/week';
import { healthLoadMessage } from '@/features/health-profile/messages';
import { buildProfileHtml } from '@/features/health-profile/pdf-export';
import { formatLongDate, lastUpdated, toProfileSections } from '@/features/health-profile/profile';
import { useFocusedQuery } from '@/hooks/useFocusedQuery';
import { usePdfExport } from '@/hooks/usePdfExport';
import type { PdfAction } from '@/services/pdf';
import { getHealthProfile } from '@/services/health';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

import { makeStyles, useThemeColors } from '@/constants/theme';
const loadProfile = () => getHealthProfile();

export default function PainProfileScreen() {
  const colors = useThemeColors();
  const styles = useStyles();
  const { state, reload } = useFocusedQuery(loadProfile);
  const pdf = usePdfExport();

  const profile = state.status === 'ready' ? state.data : null;
  const sections = profile
    ? toProfileSections(profile.user, profile.latest, new Date().getFullYear())
    : [];
  const updated = profile ? lastUpdated(profile.latest) : null;
  const updatedText = updated ? `Updated by ${formatLongDate(updated)}` : 'Not updated yet';

  const exportProfile = (action: PdfAction) =>
    pdf.run(action, () =>
      buildProfileHtml(sections, {
        updated: updated ? formatLongDate(updated) : null,
        generated: formatLongDate(getLocalToday()),
      }),
    );

  const chip = (action: PdfAction, label: string) => (
    <Pressable
      style={styles.chip}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !profile || pdf.busy !== null, busy: pdf.busy === action }}
      disabled={!profile || pdf.busy !== null}
      onPress={() => exportProfile(action)}
    >
      {pdf.busy === action ? (
        <ActivityIndicator size="small" color={colors.text} accessibilityLabel="Creating PDF" />
      ) : (
        <Text style={styles.chipText}>{label}</Text>
      )}
    </Pressable>
  );

  const actionChips = (
    <View style={styles.chipRow}>
      {chip('print', 'Print PDF')}
      {chip('share', 'Share')}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <PrescriptionsHeader
          title="My Pain Profiles"
          topBarLabel="Homescreen"
          titleAccessory={actionChips}
        />
        {profile && <Text style={styles.updatedText}>{updatedText}</Text>}
        <View style={styles.headerDivider} />

        {state.status === 'loading' && <LoadingState label="Loading your pain profile" />}
        {state.status === 'error' && (
          <ErrorState message={healthLoadMessage(state.error)} onRetry={reload} />
        )}

        {sections.map((section) => (
          <ProfileSectionCard key={section.id} section={section} showPeriod />
        ))}

        {profile && (
          <Pressable
            style={styles.recordsButton}
            onPress={() => router.push('/health/tracking/chart')}
            accessibilityRole="button"
          >
            <Text style={styles.recordsButtonText}>Check my health tracking records</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


const useStyles = makeStyles((colors) => ({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingBottom: scaleHeight(40),
  },
  chipRow: {
    flexDirection: 'row',
    gap: scaleWidth(3),
  },
  chip: {
    height: scaleHeight(32),
    minWidth: scaleWidth(44),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleWidth(8),
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: scaleWidth(8),
  },
  chipText: {
    fontSize: scaleFont(12),
    lineHeight: scaleFont(16),
    fontWeight: '600',
    letterSpacing: 0.5,
    color: colors.text,
  },
  updatedText: {
    fontSize: scaleFont(12),
    color: colors.textSubtle,
    marginTop: scaleHeight(2),
    marginHorizontal: scaleWidth(38),
  },
  headerDivider: {
    height: 1,
    backgroundColor: colors.outline,
    marginHorizontal: scaleWidth(16),
    marginTop: scaleHeight(8),
    marginBottom: scaleHeight(26),
  },
  recordsButton: {
    marginHorizontal: scaleWidth(32),
    backgroundColor: colors.primary,
    borderRadius: scaleWidth(10),
    paddingVertical: scaleHeight(14),
    alignItems: 'center',
  },
  recordsButtonText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: colors.onPrimary,
  },
}));
