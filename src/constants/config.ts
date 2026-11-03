/** Only place the default backend address lives. The live value comes from settings. */
export const DEFAULT_BASE_URL = 'http://192.168.1.100:8000';
export const REQUEST_TIMEOUT_MS = 60_000;
export const HEALTH_TIMEOUT_MS = 5_000;
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
export const MIN_RECORDING_MS = 600;
export const MAX_RECORDING_MS = 120_000;
export const APP_NAME = 'CircuitAI';
export const APP_TAGLINE = 'Understand electronics. Build something amazing.';
export const STORAGE_KEYS = {
  conversations: 'circuitai.conversations.v1',
  settings: 'circuitai.settings.v1',
} as const;
export const ENDPOINTS = {
  chat: '/chat',
  transcribe: '/voice/transcribe',
  health: '/health',
  history: '/history',
} as const;
