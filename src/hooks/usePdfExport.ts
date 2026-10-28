import { useState } from 'react';
import { Alert, Platform } from 'react-native';

import { exportPdf, type PdfAction } from '@/services/pdf';

/**
 * Generates a PDF from HTML and prints or shares it. `busy` is the action in progress, so the
 * button that was tapped can show a loading indicator until the file is ready.
 */
export function usePdfExport() {
  const [busy, setBusy] = useState<PdfAction | null>(null);

  const run = async (action: PdfAction, buildHtml: () => string) => {
    if (busy) return;
    setBusy(action);
    try {
      await exportPdf(buildHtml(), action);
    } catch {
      const message = 'We could not create the PDF. Please try again.';
      // Alert.alert is a no-op on react-native-web, so fall back to the browser dialog there
      if (Platform.OS === 'web') window.alert(message);
      else Alert.alert('PDF not created', message);
    } finally {
      setBusy(null);
    }
  };

  return { busy, run };
}
