export type Role = 'user' | 'assistant';
export type MessageStatus = 'sent' | 'error';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ImageAttachment {
  uri: string;
  width?: number;
  height?: number;
  mimeType: string;
  fileName: string;
  fileSize?: number;
}

export interface VoiceRecording {
  uri: string;
  durationMs: number;
  mimeType: string;
  createdAt: number;
}

export interface SuggestedProject {
  title: string;
  difficulty: Difficulty;
  description?: string;
}

export interface ComponentIdentification {
  name: string;
  type: string;
  confidence?: number;
  summary: string;
  mainFunction: string;
  howItWorks: string;
  commonApplications: string[];
  compatiblePlatforms: string[];
  suggestedProjects: SuggestedProject[];
  safetyNotes: string[];
}

export interface AIResponse {
  /** Markdown text. Always present so it can be copied or rendered as a fallback. */
  text: string;
  /** Present when the model identified a component from an image. */
  identification?: ComponentIdentification;
  /** True when produced by a mock service. */
  mock?: boolean;
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  createdAt: number;
  status: MessageStatus;
  image?: ImageAttachment;
  voiceDurationMs?: number;
  identification?: ComponentIdentification;
  isMock?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatRequest {
  message: string;
  image?: ImageAttachment;
  history: { role: Role; text: string }[];
}

export interface TranscriptionResult {
  text: string;
  mock?: boolean;
}

export interface HealthStatus {
  backend: boolean;
  model: boolean;
  modelName?: string;
  mock?: boolean;
}

export type VoiceState =
  | 'idle'
  | 'recording'
  | 'processing'
  | 'transcribing'
  | 'sending'
  | 'completed'
  | 'error';

export type ThemePreference = 'dark' | 'light' | 'system';

export interface AppSettings {
  displayName: string;
  theme: ThemePreference;
  baseUrl: string;
  mockMode: boolean;
  autoSendVoice: boolean;
  haptics: boolean;
}
