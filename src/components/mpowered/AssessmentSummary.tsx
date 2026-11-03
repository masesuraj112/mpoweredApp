import type { ReactNode } from 'react';
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native';

import { AssessmentScreen } from './AssessmentScreen';
import { makeStyles, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';
import { ArrowGlyph } from '@/components/ui/icons';

type AssessmentSummaryProps = {
  /** One line under the page title, for example why the answers matter. */
  subheading: string;
  /** The assessment, for example "My Movement". */
  reportTitle: string;
  /** The week, for example "3 Nov - 9 Nov 2026". */
  period: string;
  /** What the answers say, in a sentence or two, with a link to tips. Omit both for a report of answers only. */
  summary?: ReactNode;
  tipsLabel?: string;
  tipsUrl?: string;
  /** Where the report is kept, for example "Saved to My Health". */
  savedLabel: string;
  onClose: () => void;
  /** The answers: `SummaryResult`s, `SummaryHeading`s and `SummaryText`. */
  children: ReactNode;
};

/**
 * The report shown after an assessment is recorded. Every assessment's summary has this layout; only
 * the words differ. The report is as tall as its answers, with Close at its foot; the page scrolls as one.
 */
export function AssessmentSummary({
  subheading,
  reportTitle,
  period,
  summary,
  tipsLabel,
  tipsUrl,
  savedLabel,
  onClose,
  children,
}: AssessmentSummaryProps) {
  const styles = useStyles();
  return (
    <AssessmentScreen title="My Pain Summary">
      <Text style={styles.subheading}>{subheading}</Text>

      <View style={styles.report}>
        <View style={styles.reportHeader}>
          <Text accessibilityRole="header" style={styles.reportTitle}>
            {reportTitle}
          </Text>
          <Text style={styles.period}>Period: {period}</Text>
        </View>
        <View style={styles.divider} />

        {summary !== undefined && (
          <>
            <SummaryHeading>Summary</SummaryHeading>
            <View style={styles.guidance}>
              <Text style={styles.text}>{summary}</Text>
              {tipsUrl && tipsLabel ? (
                <Pressable
                  onPress={() => Linking.openURL(tipsUrl)}
                  accessibilityRole="link"
                  accessibilityLabel={tipsLabel}
                  style={({ pressed }) => [styles.tips, pressed && styles.pressed]}>
                  <Text style={styles.tipsText}>{tipsLabel}</Text>
                  <ArrowGlyph style={styles.tipsText} />
                </Pressable>
              ) : null}
            </View>
          </>
        )}

        <View style={styles.results}>{children}</View>

        <View style={styles.footer}>
          <Text style={styles.saved}>{savedLabel}</Text>
          <SummaryCloseButton onPress={onClose} />
        </View>
      </View>
    </AssessmentScreen>
  );
}

/** A heading inside the report, for example "My results:". */
export function SummaryHeading({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return (
    <Text accessibilityRole="header" style={styles.heading}>
      {children}
    </Text>
  );
}

/** One answer: what was asked, then what the person said. */
export function SummaryResult({ heading, value }: { heading: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.result}>
      <Text style={styles.resultLabel}>{heading}</Text>
      <Text style={styles.text}>{value}</Text>
    </View>
  );
}

/** A paragraph inside the report, for example the person's reflection. */
export function SummaryText({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.text}>{children}</Text>;
}

/** Bold words inside a summary sentence. */
export function SummaryEmphasis({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.emphasis}>{children}</Text>;
}

/** While the report loads, or when it could not be loaded. */
export function SummaryStatus({ message, onClose }: { message?: string; onClose: () => void }) {
  const styles = useStyles();
  return (
    <AssessmentScreen title="My Pain Summary">
      <View style={styles.status}>
        {message === undefined ? (
          <ActivityIndicator accessibilityLabel="Loading your summary" />
        ) : (
          <>
            <Text style={styles.text}>{message}</Text>
            <SummaryCloseButton onPress={onClose} />
          </>
        )}
      </View>
    </AssessmentScreen>
  );
}

function SummaryCloseButton({ onPress }: { onPress: () => void }) {
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
  subheading: {
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
  heading: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  guidance: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.card,
    backgroundColor: colors.surface,
  },
  tips: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  tipsText: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  results: {
    gap: Spacing.three,
  },
  result: {
    gap: Spacing.half,
  },
  resultLabel: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  text: {
    ...Typography.bodyLarge,
    color: colors.text,
  },
  emphasis: {
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
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
  status: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.8,
  },
}));
