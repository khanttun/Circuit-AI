import type { HealthStatus } from '@/types';
import { sleep } from '@/utils/format';
import type { HealthService, VoiceService } from '../types';

export const MOCK_TRANSCRIPTION = 'Yo Chat, what is this component and what can I use it for?';

export const mockVoiceService: VoiceService = {
  async transcribe() {
    await sleep(1400);
    return { text: MOCK_TRANSCRIPTION, mock: true };
  },
};

export const mockHealthService: HealthService = {
  async check(): Promise<HealthStatus> {
    await sleep(400);
    return { backend: true, model: true, modelName: 'qwen (mock)', mock: true };
  },
};
