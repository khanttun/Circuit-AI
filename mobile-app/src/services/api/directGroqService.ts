import { File } from 'expo-file-system';
import type { AIResponse, ChatRequest, Conversation, HealthStatus, TranscriptionResult, VoiceRecording } from '@/types';
import type { ChatService, HealthService, VoiceService } from '../types';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const CHAT_MODEL = 'qwen/qwen3.8-27b';
const TRANSCRIPTION_MODEL = 'whisper-large-v3-turbo';

function requireKey(getKey: () => string | null) {
  const key = getKey();
  if (!key) throw new Error('Add your Groq API key in Settings to use Personal Groq mode.');
  return key;
}

async function request<T>(getKey: () => string | null, path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${GROQ_BASE_URL}${path}`, {
    ...init,
    headers: { Accept: 'application/json', Authorization: `Bearer ${requireKey(getKey)}`, ...init.headers },
  });
  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = typeof body?.error?.message === 'string' ? body.error.message : '';
    } catch {
      /* use the status below */
    }
    throw new Error(detail || `Groq request failed (${response.status}).`);
  }
  return (await response.json()) as T;
}

async function imageDataUrl(request: ChatRequest): Promise<string | null> {
  if (!request.image) return null;
  const base64 = await new File(request.image.uri).base64();
  return `data:${request.image.mimeType};base64,${base64}`;
}

export function createDirectGroqServices(getKey: () => string | null): { chat: ChatService; voice: VoiceService; health: HealthService } {
  const chat: ChatService = {
    async sendMessage(req: ChatRequest): Promise<AIResponse> {
      const image = await imageDataUrl(req);
      const content = image
        ? [
            { type: 'image_url', image_url: { url: image } },
            ...(req.message.trim() ? [{ type: 'text', text: req.message.trim() }] : []),
          ]
        : req.message.trim();
      const data = await request<{ choices?: { message?: { content?: string } }[] }>(getKey, '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: CHAT_MODEL,
          messages: [...req.history.slice(-12).map((item) => ({ role: item.role, content: item.text })), { role: 'user', content }],
        }),
      });
      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error('Groq returned an empty response.');
      return { text, model: CHAT_MODEL, provider: 'cloud' };
    },
    async fetchHistory(): Promise<Conversation[]> {
      return [];
    },
  };

  const voice: VoiceService = {
    async transcribe(recording: VoiceRecording): Promise<TranscriptionResult> {
      const form = new FormData();
      form.append('file', new File(recording.uri));
      form.append('model', TRANSCRIPTION_MODEL);
      form.append('response_format', 'json');
      form.append('language', 'en');
      const data = await request<{ text?: string }>(getKey, '/audio/transcriptions', { method: 'POST', body: form });
      return { text: (data.text ?? '').trim() };
    },
  };

  const health: HealthService = {
    async check(): Promise<HealthStatus> {
      const data = await request<{ data?: { id?: string }[] }>(getKey, '/models', { method: 'GET' });
      const available = data.data?.some((model) => model.id === CHAT_MODEL) ?? false;
      return { backend: true, model: available, modelName: CHAT_MODEL, provider: 'cloud', configured: true };
    },
  };

  return { chat, voice, health };
}
