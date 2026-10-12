import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

const loadProfile = () => getHealthProfile();

export default function PainProfileScreen() {
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
        <ActivityIndicator size="small" color={ON_SURFACE} accessibilityLabel="Creating PDF" />
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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

const OUTLINE_VARIANT = '#CAC4D0';
const ON_SURFACE = '#1D1B20';
const PRIMARY_PURPLE = '#6750A4';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
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
    borderColor: OUTLINE_VARIANT,
    borderRadius: scaleWidth(8),
  },
  chipText: {
    fontSize: scaleFont(12),
    lineHeight: scaleFont(16),
    fontWeight: '600',
    letterSpacing: 0.5,
    color: ON_SURFACE,
  },
  updatedText: {
    fontSize: scaleFont(12),
    color: '#79747E',
    marginTop: scaleHeight(2),
    marginHorizontal: scaleWidth(38),
  },
  headerDivider: {
    height: 1,
    backgroundColor: OUTLINE_VARIANT,
    marginHorizontal: scaleWidth(16),
    marginTop: scaleHeight(8),
    marginBottom: scaleHeight(26),
  },
  recordsButton: {
    marginHorizontal: scaleWidth(32),
    backgroundColor: PRIMARY_PURPLE,
    borderRadius: scaleWidth(10),
    paddingVertical: scaleHeight(14),
    alignItems: 'center',
  },
  recordsButtonText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: 'white',
  },
});
