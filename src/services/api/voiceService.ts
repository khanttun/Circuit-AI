import { ENDPOINTS } from '@/constants/config';
import type { TranscriptionResult, VoiceRecording } from '@/types';
import type { VoiceService } from '../types';
import type { ApiClient } from './apiClient';

/**
 * Uploads the recording to the backend. The backend forwards it to Google Cloud
 * Speech-to-Text, so no Google credentials ever exist in this app.
 */
export function createVoiceService(client: ApiClient): VoiceService {
  return {
    async transcribe(rec: VoiceRecording): Promise<TranscriptionResult> {
      const form = new FormData();
      form.append('audio', {
        uri: rec.uri,
        name: `recording-${rec.createdAt}.m4a`,
        type: rec.mimeType,
      } as unknown as Blob);
      form.append('duration_ms', String(rec.durationMs));
      const data = await client.postForm<{ text: string }>(ENDPOINTS.transcribe, form);
      return { text: (data.text ?? '').trim() };
    },
  };
}
