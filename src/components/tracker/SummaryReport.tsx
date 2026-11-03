import type { ReactNode } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ReportSection } from '@/components/tracker/ReportSection';
import { ResultSection } from '@/components/tracker/ResultSection';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Screen } from '@/components/ui/Screen';
import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';

type SummaryReportProps = {
  /** The report's name, for example "My Movement". */
  title: string;
  period: string;
  /** One line under the page heading. */
  intro: string;
  /** The short written summary, shown in the grey panel. Can hold nested text for emphasis. */
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
 * The report every tracker summary screen shows after a save: a titled card with the period, a
 * summary panel, the answers and any extra sections, and a footer with the Close button. The card
 * scrolls; the heading and footer stay put.
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
  return (
    <Screen scroll={false}>
      <AppText accessibilityRole="header" variant="headlineSmall">
        My Pain Summary
      </AppText>
      <AppText variant="bodySmall" color="onSurface" style={styles.intro}>
        {intro}
      </AppText>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <AppText variant="titleLarge" style={styles.cardTitle}>
            {title}
          </AppText>
          <AppText variant="labelSmall" color="onSurface" style={styles.period}>
            Period: {period}
          </AppText>
        </View>
        <Divider style={styles.rule} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {guidance ? (
            <>
              <AppText variant="labelLargeBold" color="onSurface" style={styles.panelHeading}>
                Summary
              </AppText>
              <View style={styles.panel}>
                <AppText variant="bodyMediumRegular" style={styles.panelText}>
                  {guidance}
                </AppText>
                {tips ? <TipsLink label={tips.label} url={tips.url} /> : null}
              </View>
            </>
          ) : null}

          {results ? (
            <ReportSection heading="My results:">
              {results.map((result) => (
                <ResultSection key={result.heading} heading={result.heading} value={result.value} />
              ))}
            </ReportSection>
          ) : null}

          {children}
        </ScrollView>

        <Divider style={styles.rule} />
        <View style={styles.footer}>
          <AppText variant="bodySmall" color="textTertiary" style={styles.savedText}>
            {savedText}
          </AppText>
          <View style={styles.actions}>
            {onEdit ? (
              <Button
                label="Edit answers"
                variant="tonal"
                accessibilityHint="Opens the questions again with your answers filled in"
                onPress={onEdit}
              />
            ) : null}
            <Button
              label="Close"
              variant="outlined"
              accessibilityLabel="Close summary"
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}

function TipsLink({ label, url }: { label: string; url: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={() => Linking.openURL(url)}
      style={({ pressed }) => [styles.tips, pressed && styles.pressed]}>
      <AppText
        accessibilityElementsHidden
        importantForAccessibility="no"
        variant="titleLarge"
        color="onSurface">
        ⌕
      </AppText>
      <AppText variant="bodyMedium" color="onSurface">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  card: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.mid,
    paddingBottom: Spacing.two,
    borderWidth: 1,
    borderColor: Colors.light.outlineStrong,
    borderRadius: Radius.card,
    backgroundColor: Colors.light.background,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  cardTitle: {
    flexShrink: 1,
  },
  period: {
    textAlign: 'right',
  },
  rule: {
    marginVertical: Spacing.mid,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingBottom: Spacing.mid,
  },
  panelHeading: {
    marginBottom: Spacing.mid,
  },
  panel: {
    overflow: 'hidden',
    borderRadius: Radius.card,
    backgroundColor: Colors.light.surfaceGrouped,
  },
  panelText: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.mid,
    textAlign: 'center',
  },
  tips: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.mid,
    backgroundColor: Colors.light.outlineStrong,
  },
  pressed: {
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.mid,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  savedText: {
    flexShrink: 1,
  },
});
