/** Only place the default backend address lives. The live value comes from settings. */
export const DEFAULT_BASE_URL = 'http://192.168.0.101:8000';
export const REQUEST_TIMEOUT_MS = 60_000;
export const HEALTH_TIMEOUT_MS = 5_000;
export const MIN_RECORDING_MS = 600;
export const MAX_RECORDING_MS = 120_000;
export const APP_NAME = 'CircuitAI';
export const APP_TAGLINE = 'Understand electronics. Build something amazing.';
export const STORAGE_KEYS = {
  conversations: 'circuitai.conversations.v1',
  settings: 'circuitai.settings.v1',
} as const;
export const SECURE_STORAGE_KEYS = {
  groqApiKey: 'circuitai.groq-api-key',
} as const;
export const ENDPOINTS = {
  chat: '/api/chat',
  transcribe: '/voice/transcribe',
  health: '/api/health',
  history: '/history',
} as const;
