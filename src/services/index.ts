import { createApiClient } from './api/apiClient';
import { createChatService } from './api/chatService';
import { createHealthService } from './api/healthService';
import { createVoiceService } from './api/voiceService';
import { mockChatService } from './mock/mockChatService';
import { mockHealthService, mockVoiceService } from './mock/mockVoiceService';
import type { Services } from './types';

/** The single switch between mock and real backends. */
export function createServices(opts: { mockMode: boolean; getBaseUrl: () => string }): Services {
  if (opts.mockMode) {
    return { chat: mockChatService, voice: mockVoiceService, health: mockHealthService, mock: true };
  }
  const client = createApiClient(opts.getBaseUrl);
  return {
    chat: createChatService(client),
    voice: createVoiceService(client),
    health: createHealthService(client),
    mock: false,
  };
}

export * from './types';
