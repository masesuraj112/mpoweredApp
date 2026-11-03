import type { ReactNode } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';

import { ReportSection } from '@/components/tracker/ReportSection';
import { ResultSection } from '@/components/tracker/ResultSection';
import { Button } from '@/components/ui/Button';
import { ArrowGlyph } from '@/components/ui/icons';
import { makeStyles, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';

import { TrackerQuestionScreen } from './TrackerQuestionScreen';

type SummaryReportProps = {
  /** The report's name, for example "My Movement". */
  title: string;
  period: string;
  /** One line under the page heading. */
  intro: string;
  /** The short written summary, shown in its own panel. Can hold nested text for emphasis. */
  guidance?: ReactNode;
  /** A link to advice, shown at the bottom of the panel. */
  tips?: { label: string; url: string };
  /** The answers, shown under "My results:". */
  results?: readonly { heading: string; value: string }[];
  /** Further sections under the results, such as reflections. */
  children?: ReactNode;
  /** The note beside the Close button, for example "Saved to My Health". */
  savedText: string;
  onClose: () => void;
  /** Shows an "Edit answers" button that reopens the questions. Leave out when the entry cannot be edited. */
  onEdit?: () => void;
};

/**
 * The report every tracker summary screen shows after a save: the report's name and period, a summary
 * panel, the answers and any extra sections, and Close at its foot. Every summary has this layout; only the
 * words differ. The report is as tall as its answers and the page scrolls as one.
 */
export function SummaryReport({
  title,
  period,
  intro,
  guidance,
  tips,
  results,
  children,
  savedText,
  onClose,
  onEdit,
}: SummaryReportProps) {
  const styles = useStyles();
  return (
    <TrackerQuestionScreen title="My Pain Summary">
      <Text style={styles.intro}>{intro}</Text>

      <View style={styles.report}>
        <View style={styles.reportHeader}>
          <Text accessibilityRole="header" style={styles.reportTitle}>
            {title}
          </Text>
          <Text style={styles.period}>Period: {period}</Text>
        </View>
        <View style={styles.divider} />

        {guidance ? (
          <ReportSection heading="Summary">
            <View style={styles.guidance}>
              <Text style={styles.text}>{guidance}</Text>
              {tips ? <TipsLink label={tips.label} url={tips.url} /> : null}
            </View>
          </ReportSection>
        ) : null}

        {results ? (
          <ReportSection heading="My results:">
            {results.map((result) => (
              <ResultSection key={result.heading} heading={result.heading} value={result.value} />
            ))}
          </ReportSection>
        ) : null}

        {children}

        <View style={styles.footer}>
          <Text style={styles.saved}>{savedText}</Text>
          <View style={styles.actions}>
            {onEdit ? (
              <Button
                label="Edit answers"
                variant="tonal"
                accessibilityHint="Opens the questions again with your answers filled in"
                onPress={onEdit}
              />
            ) : null}
            <SummaryCloseButton onPress={onClose} />
          </View>
        </View>
      </View>
    </TrackerQuestionScreen>
  );
}

function TipsLink({ label, url }: { label: string; url: string }) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={() => Linking.openURL(url)}
      style={({ pressed }) => [styles.tips, pressed && styles.pressed]}>
      <Text style={styles.tipsText}>{label}</Text>
      <ArrowGlyph style={styles.tipsText} />
    </Pressable>
  );
}

/** The summary's Close button, also used while the summary loads or when it could not be shown. */
export function SummaryCloseButton({ onPress }: { onPress: () => void }) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Close summary"
      style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
      <Text style={styles.closeText}>Close</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  intro: {
    ...Typography.bodyLarge,
    color: colors.textSecondary,
    marginBottom: Spacing.three,
  },
  report: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.card,
    backgroundColor: colors.surfaceContainer,
  },
  reportHeader: {
    gap: Spacing.half,
  },
  reportTitle: {
    ...Typography.titleSmall,
    color: colors.text,
  },
  period: {
    ...Typography.bodySmall,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  guidance: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.card,
    backgroundColor: colors.surface,
  },
  text: {
    ...Typography.bodyLarge,
    color: colors.text,
  },
  tips: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    alignSelf: 'flex-start',
  },
  tipsText: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  saved: {
    flex: 1,
    ...Typography.bodySmall,
    color: colors.textSecondary,
  },
  close: {
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    backgroundColor: colors.primary,
  },
  closeText: {
    ...Typography.labelLargeBold,
    color: colors.onPrimary,
  },
  pressed: {
    opacity: 0.8,
  },
}));
