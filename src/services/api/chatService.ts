import { ENDPOINTS } from '@/constants/config';
import type { AIResponse, ChatRequest, Conversation } from '@/types';
import type { ChatService } from '../types';
import type { ApiClient } from './apiClient';
import { appendImage } from './imageService';

/** Talks to FastAPI → Ollama → Qwen. Expected response: { text, identification? }. */
export function createChatService(client: ApiClient): ChatService {
  return {
    async sendMessage(req: ChatRequest): Promise<AIResponse> {
      const form = new FormData();
      form.append('message', req.message);
      form.append('history', JSON.stringify(req.history.slice(-12)));
      if (req.image) appendImage(form, 'image', req.image);
      const data = await client.postForm<AIResponse>(ENDPOINTS.chat, form);
      return { text: data.text ?? '', identification: data.identification };
    },
    async fetchHistory(): Promise<Conversation[]> {
      const data = await client.get<{ conversations?: Conversation[] }>(ENDPOINTS.history);
      return data.conversations ?? [];
    },
  };
}
