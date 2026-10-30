// Saves text as a file and hands it to the user: the share sheet on iOS and Android (Files, Mail,
// AirDrop, ...), a download on web.

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/**
 * Writes `contents` to `fileName` in the app's cache and opens the share sheet. Resolves once the
 * sheet has closed; rejects if the file could not be written or sharing isn't available.
 */
export async function shareJsonFile(fileName: string, contents: string): Promise<void> {
  if (Platform.OS === 'web') {
    // Local file URIs can't be shared on web, so download it instead.
    const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    // Freed later: some browsers cancel the download if the URL goes away straight after the click.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }

  // The cache, not documents: the file is only needed until it has been shared.
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  await file.write(contents);
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Export my data',
  });
}
