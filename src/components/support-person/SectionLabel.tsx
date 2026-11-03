import { AppText } from '@/components/ui/AppText';

/** Small grey uppercase heading, e.g. "YOUR PERMISSIONS" or "UPCOMING APPOINTMENT". */
export function SectionLabel({ children }: { children: string }) {
  return (
    <AppText accessibilityRole="header" variant="labelSmall" color="textTertiary">
      {children.toUpperCase()}
    </AppText>
  );
}
