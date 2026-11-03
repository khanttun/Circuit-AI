import {
  RecordingPresets,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { MAX_RECORDING_MS, MIN_RECORDING_MS } from '@/constants/config';
import { useSettings } from '@/context/SettingsContext';
import type { VoiceRecording, VoiceState } from '@/types';
import { sleep } from '@/utils/format';

interface Options {
  /** Called with the transcript. Resolve once the message has been handed to the AI. */
  onTranscript: (text: string, recording: VoiceRecording) => Promise<void>;
}

const RECORDING_OPTIONS = { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true };

export function useVoiceInput({ onTranscript }: Options) {
  const { services, settings } = useSettings();
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const recState = useAudioRecorderState(recorder, 80);
  const [state, setState] = useState<VoiceState>('idle');
  const [error, setError] = useState<{ message: string; canOpenSettings: boolean } | null>(null);
  const stateRef = useRef<VoiceState>('idle');
  const lastRecording = useRef<VoiceRecording | null>(null);
  const mounted = useRef(true);

  const go = useCallback((s: VoiceState) => {
    stateRef.current = s;
    if (mounted.current) setState(s);
  }, []);

  const fail = useCallback(
    (message: string, canOpenSettings = false) => {
      if (mounted.current) setError({ message, canOpenSettings });
      go('error');
    },
    [go],
  );

  const tap = useCallback(() => {
    if (settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [settings.haptics]);

  const start = useCallback(async () => {
    if (stateRef.current !== 'idle' && stateRef.current !== 'error' && stateRef.current !== 'completed') return;
    setError(null);
    try {
      let perm = await getRecordingPermissionsAsync();
      if (!perm.granted) perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        fail(
          perm.canAskAgain
            ? 'Microphone access is needed to use voice. Please allow it and try again.'
            : 'Microphone access is turned off. Enable it in system settings to use voice.',
          !perm.canAskAgain,
        );
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      tap();
      go('recording');
    } catch {
      fail('Could not start recording. Check that no other app is using the microphone.');
    }
  }, [recorder, fail, go, tap]);

  const finishRecording = useCallback(async (): Promise<VoiceRecording | null> => {
    const durationMs = recorder.getStatus().durationMillis;
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    const uri = recorder.uri;
    if (!uri) return null;
    return { uri, durationMs, mimeType: 'audio/mp4', createdAt: Date.now() };
  }, [recorder]);

  const process = useCallback(
    async (rec: VoiceRecording) => {
      lastRecording.current = rec;
      try {
        go('transcribing');
        const { text } = await services.voice.transcribe(rec);
        if (!text.trim()) {
          fail("I couldn't make out any speech. Try again a little closer to the microphone.");
          return;
        }
        go('sending');
        await onTranscript(text, rec);
        go('completed');
        await sleep(700);
        if (stateRef.current === 'completed') go('idle');
      } catch (e) {
        fail(e instanceof Error ? e.message : 'Transcription failed.');
      }
    },
    [services.voice, onTranscript, fail, go],
  );

  const stop = useCallback(async () => {
    if (stateRef.current !== 'recording') return;
    tap();
    go('processing');
    try {
      const rec = await finishRecording();
      if (!rec || rec.durationMs < MIN_RECORDING_MS) {
        fail('That recording was too short. Hold on a little longer while you speak.');
        return;
      }
      await sleep(350); // brief "processing speech" beat while the file is finalised
      await process(rec);
    } catch {
      fail('Something went wrong while saving the recording.');
    }
  }, [finishRecording, process, fail, go, tap]);

  const cancel = useCallback(async () => {
    if (stateRef.current === 'recording') {
      try {
        await recorder.stop();
        await setAudioModeAsync({ allowsRecording: false });
      } catch {
        /* recorder may already be stopped */
      }
    }
    setError(null);
    go('idle');
  }, [recorder, go]);

  const retry = useCallback(async () => {
    const rec = lastRecording.current;
    if (rec) {
      setError(null);
      await process(rec);
    } else {
      go('idle');
    }
  }, [process, go]);

  const dismissError = useCallback(() => {
    setError(null);
    go('idle');
  }, [go]);

  const openSettings = useCallback(() => {
    Linking.openSettings().catch(() => {});
  }, []);

  // Auto-stop at the maximum length.
  useEffect(() => {
    if (state === 'recording' && recState.durationMillis >= MAX_RECORDING_MS) stop();
  }, [state, recState.durationMillis, stop]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (stateRef.current === 'recording') recorder.stop().catch(() => {});
    };
  }, [recorder]);

  const level =
    state === 'recording' && typeof recState.metering === 'number'
      ? Math.min(1, Math.max(0, (recState.metering + 55) / 55))
      : null;

  return {
    state,
    error,
    durationMs: state === 'recording' ? recState.durationMillis : 0,
    level,
    isBusy: state !== 'idle',
    canRetry: state === 'error' && lastRecording.current !== null,
    start,
    stop,
    cancel,
    retry,
    dismissError,
    openSettings,
  };
}
