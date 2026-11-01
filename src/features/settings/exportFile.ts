// Naming and formatting the "Export my data" file. Pure module: no imports from @/lib/supabase,
// react-native or expo-*.

import { toIsoDate } from '@/services/date';

/** e.g. "mpowered-my-data-2026-10-29.json", using the local calendar date. */
export function exportFileName(now: Date = new Date()): string {
  return `mpowered-my-data-${toIsoDate(now)}.json`;
}

/** Pretty-printed, so the file is readable when opened in a text editor. */
export function exportFileContents(data: unknown): string {
  return `${JSON.stringify(data, null, 2)}\n`;
}
