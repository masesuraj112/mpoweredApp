import { renderHook } from '@testing-library/react-native';

import { useDictation } from './voice-recording';

const mockPackageLoaded = jest.fn();
const mockNativeModule = jest.fn();

jest.mock('expo', () => ({
  requireOptionalNativeModule: (name: string) => mockNativeModule(name),
}));

// Stands in for the real package, which throws as soon as it is imported without its native side.
jest.mock('expo-speech-recognition', () => {
  mockPackageLoaded();
  return { ExpoSpeechRecognitionModule: { addListener: () => ({ remove: jest.fn() }), abort: jest.fn() } };
});

describe('useDictation without the native module (Expo Go)', () => {
  beforeEach(() => {
    mockPackageLoaded.mockClear();
    mockNativeModule.mockReset();
  });

  it('is unavailable and never loads the speech package', async () => {
    mockNativeModule.mockReturnValue(null);

    const { result } = await renderHook(() => useDictation({ onResult: jest.fn() }));

    expect(mockNativeModule).toHaveBeenCalledWith('ExpoSpeechRecognition');
    expect(mockPackageLoaded).not.toHaveBeenCalled();
    expect(result.current.status).toBe('unavailable');
  });

  it('loads the speech package when the native module is there', async () => {
    mockNativeModule.mockReturnValue({});

    const { result } = await renderHook(() => useDictation({ onResult: jest.fn() }));

    expect(mockPackageLoaded).toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });
});
