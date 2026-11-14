import { createApiClient } from './api/apiClient';
import { createChatService } from './api/chatService';
import { createHealthService } from './api/healthService';
import { createVoiceService } from './api/voiceService';
import { createDirectGroqServices } from './api/directGroqService';
import { mockChatService } from './mock/mockChatService';
import { mockHealthService, mockVoiceService } from './mock/mockVoiceService';
import type { Services } from './types';
import type { AIProvider, AIResponse, ChatRequest, ConnectionMode, HealthStatus, TranscriptionResult, VoiceRecording } from '@/types';
import type { ChatService, HealthService, VoiceService } from './types';

/** The single switch between mock and real backends. */
function unavailable(provider: Exclude<AIProvider, 'cloud'>): Services {
  const message = provider === 'local' ? 'Local Qwen is coming soon.' : 'Automatic provider selection is coming soon.';
  const chat: ChatService = { sendMessage: async (_request: ChatRequest): Promise<AIResponse> => { throw new Error(message); }, fetchHistory: async () => [] };
  const voice: VoiceService = { transcribe: async (_recording: VoiceRecording): Promise<TranscriptionResult> => { throw new Error(message); } };
  const health: HealthService = { check: async (): Promise<HealthStatus> => { throw new Error(message); } };
  return { chat, voice, health, mock: false };
}

export function createServices(opts: {
  provider: AIProvider;
  mockMode: boolean;
  connectionMode: ConnectionMode;
  getBaseUrl: () => string;
  getGroqApiKey: () => string | null;
}): Services {
  if (opts.mockMode) {
    return { chat: mockChatService, voice: mockVoiceService, health: mockHealthService, mock: true };
  }
  if (opts.connectionMode === 'personal') {
    const direct = createDirectGroqServices(opts.getGroqApiKey);
    return { ...direct, mock: false };
  }
  if (opts.provider !== 'cloud') return unavailable(opts.provider);
  const client = createApiClient(opts.getBaseUrl);
  return {
    chat: createChatService(client),
    voice: createVoiceService(client),
    health: createHealthService(client),
    mock: false,
  };
}

export * from './types';
