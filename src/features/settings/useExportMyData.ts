import { useCallback, useState } from 'react';

import { exportMyData } from '@/services/account';
import { shareJsonFile } from '@/services/dataFile';

import { exportFileContents, exportFileName } from './exportFile';

/**
 * Settings > Privacy/Data and Legal > Export my data: reads everything with export_my_data, saves
 * it as a JSON file and opens the share sheet. `exportData` resolves with an error message to
 * show, or null when it worked (including when the user closed the share sheet).
 */
export function useExportMyData() {
  const [exporting, setExporting] = useState(false);

  const exportData = useCallback(async (): Promise<string | null> => {
    setExporting(true);
    try {
      const result = await exportMyData();
      if (!result.ok) return 'We could not get your data. Please check your connection and try again.';
      await shareJsonFile(exportFileName(), exportFileContents(result.data));
      return null;
    } catch {
      return 'We could not save your data as a file on this device.';
    } finally {
      setExporting(false);
    }
  }, []);

  return { exporting, exportData };
}
