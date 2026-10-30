jest.mock('@/services/account', () => ({ exportMyData: jest.fn() }));
jest.mock('@/services/dataFile', () => ({ shareJsonFile: jest.fn() }));

import { act, renderHook } from '@testing-library/react-native';

import { exportMyData } from '@/services/account';
import { shareJsonFile } from '@/services/dataFile';

import { useExportMyData } from './useExportMyData';

const mockExport = exportMyData as jest.Mock;
const mockShare = shareJsonFile as jest.Mock;

beforeEach(() => {
  mockExport.mockReset().mockResolvedValue({ ok: true, data: { profile: { name: 'Sam' } } });
  mockShare.mockReset().mockResolvedValue(undefined);
});

async function run() {
  const hook = await renderHook(() => useExportMyData());
  let message: string | null | undefined;
  await act(async () => {
    message = await hook.result.current.exportData();
  });
  return { hook, message };
}

describe('useExportMyData', () => {
  it('shares the exported data as a dated JSON file', async () => {
    const { hook, message } = await run();
    expect(message).toBeNull();
    expect(mockShare).toHaveBeenCalledWith(
      expect.stringMatching(/^mpowered-my-data-\d{4}-\d{2}-\d{2}\.json$/),
      '{\n  "profile": {\n    "name": "Sam"\n  }\n}\n',
    );
    expect(hook.result.current.exporting).toBe(false);
  });

  it('does not make a file when the data cannot be read', async () => {
    mockExport.mockResolvedValue({ ok: false, error: { code: 'NETWORK', message: 'x' } });
    const { hook, message } = await run();
    expect(message).toMatch(/could not get your data/);
    expect(mockShare).not.toHaveBeenCalled();
    expect(hook.result.current.exporting).toBe(false);
  });

  it('reports a file or sharing failure', async () => {
    mockShare.mockRejectedValue(new Error('Sharing is not available on this device.'));
    const { hook, message } = await run();
    expect(message).toMatch(/could not save your data as a file/);
    expect(hook.result.current.exporting).toBe(false);
  });
});
