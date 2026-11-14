import { File } from 'expo-file-system';
import { ENDPOINTS } from '@/constants/config';
import type { TranscriptionResult, VoiceRecording } from '@/types';
import type { VoiceService } from '../types';
import type { ApiClient } from './apiClient';

/** Uploads the recording to the backend for Groq Whisper transcription. */
export function createVoiceService(client: ApiClient): VoiceService {
  return {
    async transcribe(rec: VoiceRecording): Promise<TranscriptionResult> {
      const form = new FormData();
      form.append('audio', new File(rec.uri), `recording-${rec.createdAt}.m4a`);
      form.append('duration_ms', String(rec.durationMs));
      const data = await client.postForm<{ text: string }>(ENDPOINTS.transcribe, form);
      return { text: (data.text ?? '').trim() };
    },
  };
}
