// Dictation (speech to text) for the answer box.
//
// The UI depends only on `useDictation`. The engine behind it is expo-speech-recognition, which
// uses the phone's own recogniser. Recognition is required to run on the device, no audio is
// stored (`recordingOptions.persist` is false) and nothing is sent anywhere else.
//
// The package is a native module, so it is loaded lazily and guarded: where it is missing (for
// example in Expo Go) the status is `unavailable` and nothing crashes.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';

import {
  DICTATION_NOT_IN_BUILD_MESSAGE,
  getDictationMessage,
  issueFromErrorCode,
  pickRecognitionLocale,
  type DictationIssue,
} from './dictation';

export type DictationStatus =
  | 'idle'
  | 'requestingPermission'
  | 'listening'
  | 'processing'
  | 'error'
  | 'unavailable';

/** Recognised words. `isFinal` false means a live partial result that may still change. */
export type DictationResult = { text: string; isFinal: boolean };

type Subscription = { remove: () => void };

/** The parts of the engine's events that this hook reads. */
type SpeechResultEvent = { results?: { transcript?: string }[]; isFinal?: boolean };
type SpeechErrorEvent = { error?: string };

type Engine = {
  start(options: Record<string, unknown>): void;
  stop(): void;
  abort(): void;
  addListener(event: 'start' | 'end', listener: () => void): Subscription;
  addListener(event: 'result', listener: (event: SpeechResultEvent) => void): Subscription;
  addListener(event: 'error', listener: (event: SpeechErrorEvent) => void): Subscription;
  requestPermissionsAsync(): Promise<{ granted: boolean; canAskAgain: boolean }>;
  supportsOnDeviceRecognition(): boolean;
  getSupportedLocales(options: Record<string, unknown>): Promise<{
    locales: string[];
    installedLocales: string[];
  }>;
};

function loadEngine(): Engine | null {
  if (Platform.OS === 'web') return null;
  try {
    // The package is a native module: it is required lazily so a build without it (Expo Go)
    // does not crash when this file is imported.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const speech = require('expo-speech-recognition');
    return (speech?.ExpoSpeechRecognitionModule as Engine | undefined) ?? null;
  } catch {
    return null;
  }
}

function deviceLocale(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale ?? null;
  } catch {
    return null;
  }
}

export type UseDictationOptions = {
  /** Called with live partial text and with final text. */
  onResult: (result: DictationResult) => void;
};

export type Dictation = {
  status: DictationStatus;
  issue: DictationIssue | null;
  /** Short non-blocking message, or null. */
  message: string | null;
  /** True when the message is about settings and `openSettings` can help. */
  canOpenSettings: boolean;
  start: () => Promise<void>;
  /** Stops listening and delivers what was heard. */
  stop: () => void;
  /** Stops straight away without waiting for a final result. */
  abort: () => void;
  openSettings: () => void;
};

export function useDictation({ onResult }: UseDictationOptions): Dictation {
  const [engine] = useState<Engine | null>(loadEngine);
  const [status, setStatus] = useState<DictationStatus>(engine ? 'idle' : 'unavailable');
  const [issue, setIssue] = useState<DictationIssue | null>(null);

  const onResultRef = useRef(onResult);
  const statusRef = useRef(status);
  useEffect(() => {
    onResultRef.current = onResult;
    statusRef.current = status;
  });
  /** Latest partial that has not been followed by a final result. */
  const pendingPartial = useRef<string | null>(null);

  useEffect(() => {
    if (!engine) return;

    const subscriptions = [
      engine.addListener('start', () => setStatus('listening')),
      engine.addListener('result', (event) => {
        const transcript: string = event?.results?.[0]?.transcript ?? '';
        const isFinal = Boolean(event?.isFinal);
        pendingPartial.current = isFinal ? null : transcript;
        onResultRef.current({ text: transcript, isFinal });
      }),
      engine.addListener('error', (event) => {
        const next = issueFromErrorCode(String(event?.error ?? 'unknown'));
        if (next === null) return;
        setIssue(next);
        setStatus(next === 'language-unavailable' ? 'unavailable' : 'error');
      }),
      engine.addListener('end', () => {
        if (pendingPartial.current) {
          onResultRef.current({ text: pendingPartial.current, isFinal: true });
          pendingPartial.current = null;
        }
        setStatus((current) => (current === 'error' || current === 'unavailable' ? current : 'idle'));
      }),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.remove());
      try {
        engine.abort();
      } catch {
        // nothing to release
      }
    };
  }, [engine]);

  const start = useCallback(async () => {
    if (!engine) {
      setStatus('unavailable');
      return;
    }
    const current = statusRef.current;
    if (current === 'listening' || current === 'requestingPermission' || current === 'processing') {
      return;
    }
    setIssue(null);

    try {
      if (!engine.supportsOnDeviceRecognition()) {
        setIssue('on-device-unavailable');
        setStatus('unavailable');
        return;
      }

      setStatus('requestingPermission');
      const permission = await engine.requestPermissionsAsync();
      if (!permission.granted) {
        setIssue(permission.canAskAgain ? 'permission-denied' : 'permission-blocked');
        setStatus('error');
        return;
      }

      let supported: string[] = [];
      try {
        const locales = await engine.getSupportedLocales({});
        supported = locales.installedLocales.length > 0 ? locales.installedLocales : locales.locales;
      } catch {
        supported = [];
      }

      pendingPartial.current = null;
      engine.start({
        lang: pickRecognitionLocale(deviceLocale(), supported),
        interimResults: true,
        continuous: true,
        addsPunctuation: true,
        requiresOnDeviceRecognition: true,
        recordingOptions: { persist: false },
      });
    } catch {
      setIssue('unknown');
      setStatus('error');
    }
  }, [engine]);

  const stop = useCallback(() => {
    if (!engine || statusRef.current !== 'listening') return;
    setStatus('processing');
    try {
      engine.stop();
    } catch {
      setStatus('idle');
    }
  }, [engine]);

  const abort = useCallback(() => {
    if (!engine) return;
    pendingPartial.current = null;
    try {
      engine.abort();
    } catch {
      // nothing to abort
    }
    setStatus((current) => (current === 'unavailable' ? current : 'idle'));
  }, [engine]);

  const openSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  const message = !engine
    ? DICTATION_NOT_IN_BUILD_MESSAGE
    : issue
      ? getDictationMessage(issue)
      : null;

  return {
    status,
    issue,
    message,
    canOpenSettings: issue === 'permission-blocked' || issue === 'permission-denied',
    start,
    stop,
    abort,
    openSettings,
  };
}
