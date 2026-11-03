import type {
  AIResponse,
  ChatRequest,
  Conversation,
  HealthStatus,
  TranscriptionResult,
  VoiceRecording,
} from '@/types';

/** Every backend capability the UI depends on. Real and mock services both implement these. */
export interface ChatService {
  sendMessage(request: ChatRequest): Promise<AIResponse>;
  /** GET /history — optional server-side history. */
  fetchHistory(): Promise<Conversation[]>;
}

export interface VoiceService {
  /** POST /voice/transcribe — the backend talks to Google Cloud Speech-to-Text. */
  transcribe(recording: VoiceRecording): Promise<TranscriptionResult>;
}

export interface HealthService {
  /** GET /health — reports backend and local Qwen availability. */
  check(): Promise<HealthStatus>;
}

export interface Services {
  chat: ChatService;
  voice: VoiceService;
  health: HealthService;
  mock: boolean;
}
