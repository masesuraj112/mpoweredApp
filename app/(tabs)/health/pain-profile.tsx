import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { HealthSubpage } from '@/components/health/HealthSubpage';
import { PrescriptionsHeader } from '@/components/health/PrescriptionsHeader';
import { ProfileSectionCard } from '@/components/health/ProfileSectionCard';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ChipButton } from '@/components/ui/ChipButton';
import { Divider } from '@/components/ui/Divider';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Spacing } from '@/constants/theme';
import { getLocalToday } from '@/features/assessments/week';
import { healthLoadMessage } from '@/features/health-profile/messages';
import { buildProfileHtml } from '@/features/health-profile/pdf-export';
import { formatLongDate, lastUpdated, toProfileSections } from '@/features/health-profile/profile';
import { useFocusedQuery } from '@/hooks/useFocusedQuery';
import { usePdfExport } from '@/hooks/usePdfExport';
import type { PdfAction } from '@/services/pdf';
import { getHealthProfile } from '@/services/health';

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
    <ChipButton
      label={label}
      busy={pdf.busy === action}
      busyLabel="Creating PDF"
      disabled={!profile || pdf.busy !== null}
      onPress={() => exportProfile(action)}
    />
  );

  const actionChips = (
    <View style={styles.chipRow}>
      {chip('print', 'Print PDF')}
      {chip('share', 'Share')}
    </View>
  );

  return (
    <HealthSubpage
      header={
        <PrescriptionsHeader
          title="My Pain Profiles"
          topBarLabel="Homescreen"
          titleAccessory={actionChips}
        />
      }
    >
      {profile && (
        <AppText variant="bodySmall" color="textSecondary">
          {updatedText}
        </AppText>
      )}
      <Divider style={styles.divider} />

      {state.status === 'loading' && <LoadingState label="Loading your pain profile" />}
      {state.status === 'error' && (
        <ErrorState message={healthLoadMessage(state.error)} onRetry={reload} />
      )}

      {sections.map((section) => (
        <ProfileSectionCard key={section.id} section={section} showPeriod />
      ))}

      {profile && (
        <Button
          label="Check my health tracking records"
          variant="primary"
          onPress={() => router.push('/health/tracking/chart')}
        />
      )}
    </HealthSubpage>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  divider: {
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
});
