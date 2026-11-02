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


import { ContentColumn, makeStyles, Radius, Spacing, Typography, useThemeColors } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

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
          <Button
            label="Check my health tracking records"
            variant="primary"
            onPress={() => router.push('/health/tracking/chart')}
          />
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
    ...ContentColumn,
    paddingBottom: Spacing.five,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.half,
  },
  chip: {
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.two,
    backgroundColor: colors.surfaceContainer,
  },
  chipText: {
    ...Typography.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: colors.text,
  },
  updatedText: {
    ...Typography.caption,
    color: colors.textSubtle,
    marginTop: Spacing.half,
    marginHorizontal: Spacing.five,
  },
  headerDivider: {
    height: 1,
    backgroundColor: colors.outline,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
}));
