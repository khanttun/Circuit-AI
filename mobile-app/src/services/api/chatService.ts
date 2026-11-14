import { ENDPOINTS } from '@/constants/config';
import type { AIResponse, ChatRequest, Conversation } from '@/types';
import type { ChatService } from '../types';
import type { ApiClient } from './apiClient';
import { appendImage } from './imageService';

/** Talks to FastAPI → Groq Cloud Qwen. The Groq key never reaches this app. */
export function createChatService(client: ApiClient): ChatService {
  return {
    async sendMessage(req: ChatRequest): Promise<AIResponse> {
      const form = new FormData();
      form.append('message', req.message);
      form.append('history', JSON.stringify(req.history.slice(-12)));
      if (req.image) appendImage(form, 'image', req.image);
      const data = await client.postForm<AIResponse & { response?: string }>(ENDPOINTS.chat, form);
      return {
        text: data.response ?? data.text ?? '',
        identification: data.identification,
        model: data.model,
        provider: data.provider,
      };
    },
    async fetchHistory(): Promise<Conversation[]> {
      const data = await client.get<{ conversations?: Conversation[] }>(ENDPOINTS.history);
      return data.conversations ?? [];
    },
  };
}
