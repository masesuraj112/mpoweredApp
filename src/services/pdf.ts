// Turns HTML into a PDF file, then prints or shares it with the device's standard options.

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export type PdfAction = 'print' | 'share';

/**
 * Generates the PDF and opens the print dialog or the share sheet. On web, expo-print can only
 * open the browser's print dialog (which can also save as PDF), so both actions do that.
 * Resolves once the dialog has been opened; rejects if the PDF could not be made.
 */
export async function exportPdf(html: string, action: PdfAction): Promise<void> {
  if (Platform.OS === 'web') {
    await Print.printToFileAsync({ html });
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });

  if (action === 'share' && (await Sharing.isAvailableAsync())) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: 'Share PDF',
    });
    return;
  }
  // The print preview on iOS and Android also offers save and share.
  await Print.printAsync({ uri });
}
