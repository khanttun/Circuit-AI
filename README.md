# CircuitAI

Understand electronics. Build something amazing.

Voice-first AI assistant for identifying electronic components. React Native + Expo SDK 58 + TypeScript + Expo Router.
Runs entirely on **mock services** until your FastAPI → Ollama → Qwen backend is ready.

## Run

```bash
npm install --legacy-peer-deps   # peer ranges around react-dom resolve cleanly with this flag
npx expo start                   # Expo Go works for a quick look
npx expo run:android             # development build (recommended; needed for full audio/camera behaviour)
```

Typecheck: `npm run typecheck`.

## Structure

```
src/
  app/                 Expo Router routes (thin re-exports)  (tabs)/{index,explore,history,settings}, category/[id]
  screens/             Chat, Explore, Category, History, Settings
  components/{chat,voice,image,common}
  context/             SettingsContext (theme, settings, service selection), ChatContext (conversations)
  hooks/               useVoiceInput (state machine), useImageAttachment, useStyles
  services/
    types.ts           ChatService / VoiceService / HealthService interfaces
    index.ts           createServices({ mockMode, getBaseUrl })  ← the single mock/real switch
    api/               apiClient, chatService, voiceService, healthService, imageService
    mock/              mockChatService, mockVoiceService
  data/  types/  constants/  utils/
```

## Mock → real

Settings → AI server → turn off **Use mock services**, set the backend URL, **Save**, **Test connection**.
The default URL lives only in `src/constants/config.ts`; every request reads the saved setting.
No API keys or Google credentials exist in the app.

## Backend contract (FastAPI)

| Endpoint | Request | Response |
|---|---|---|
| `GET /health` | – | `{ "status": "ok", "model_available": true, "model": "qwen2.5vl" }` |
| `POST /chat` | multipart: `message` (text), `history` (JSON `[{role,text}]`), optional `image` (file) | `{ "text": "<markdown>", "identification": ComponentIdentification? }` |
| `POST /voice/transcribe` | multipart: `audio` (m4a / `audio/mp4`), `duration_ms` | `{ "text": "..." }` |
| `GET /history` | – | `{ "conversations": Conversation[] }` |

`identification` is optional. If the model returns only markdown in `text`, the app renders it with section icons.
Shapes are in `src/types/index.ts`.

Android allows plain `http://` LAN addresses via `usesCleartextTraffic` (set in `app.json` through `expo-build-properties`; takes effect in development/production builds).

## Voice flow

idle → recording (waveform, timer, cancel / stop) → processing → transcribing → sending → completed, with an error state
(permission denied, too short, no speech, network). The recording is uploaded to `/voice/transcribe`; the backend calls Google Cloud Speech-to-Text.
