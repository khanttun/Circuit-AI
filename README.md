# CircuitAI

Understand electronics. Build something amazing.

Voice-first AI assistant for identifying electronic components. React Native + Expo SDK 58 + TypeScript + Expo Router.
Uses a FastAPI → Groq → Qwen backend. Mock services remain available for local UI development.

## Run on a phone with Expo Go

You need Node.js, Python, a Groq API key, and a phone and PC connected to the same Wi-Fi network. Run the backend and Expo in two separate PowerShell terminals.

### 1. Configure the backend (first time only)

```powershell
cd D:\Projects_MFU\Circuit-AI\circuitai-cloud-backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `circuitai-cloud-backend\.env` and set `GROQ_API_KEY` to a key from <https://console.groq.com/keys>. Keep the key in this backend file only; never put it in the mobile app or commit it. The defaults use `qwen/qwen3.8-27b` for chat and image understanding, and `whisper-large-v3-turbo` for speech transcription.

If `.venv` and `.env` already exist, do not recreate or overwrite them. Update the existing `.env` in place if needed.

### 2. Start the backend

In the first PowerShell terminal:

```powershell
cd D:\Projects_MFU\Circuit-AI\circuitai-cloud-backend
.\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Keep this terminal open. Verify the backend on the PC at `http://localhost:8000/api/health`; it should return `"configured": true`.

### 3. Start Expo Go

In a second PowerShell terminal:

```powershell
cd D:\Projects_MFU\Circuit-AI\mobile-app
npm install --legacy-peer-deps
npx expo start --lan
```

Scan the QR code with Expo Go. LAN mode does not require an Expo account or tunnel login. If Metro has stale cache, use `npx expo start --clear --lan`.

### 4. Connect the phone to the backend

Find the PC's Wi-Fi IPv4 address with `ipconfig`. In the app, open **Settings → Cloud connection**, turn **Use mock services** off, enter `http://<your-PC-LAN-IP>:8000` as the backend URL, tap **Save**, then **Test connection**. Keep the phone and PC on the same Wi-Fi and allow inbound TCP port 8000 through Windows Firewall. Do not enter `localhost` as the phone's backend address; on the phone, that refers to the phone itself.

Expo Go's LAN connection is for loading the app from Metro. The backend connection is separate and uses the PC's LAN IP and port 8000.

## User flow

1. In Chat, attach a component photo with **Take a photo** or **Choose from gallery**. The app resizes it and converts it to JPEG.
2. Type a question and tap **Send**, or keep the photo attached and use the mic to ask aloud.
3. For voice, tap the mic to start recording and tap the stop/send control when finished. The app uploads the recording to the backend, Groq Whisper transcribes it, and the transcript (plus any attached photo) is sent to Qwen.
4. Read Qwen's answer in the chat, or tap **Read aloud** to hear it using the phone's built-in speech service. Read-aloud does not require another key or model.

When **Auto-send voice** is disabled in Settings, the transcript is placed in the message composer for review instead of being sent automatically. The mic supports recordings up to two minutes.

This flow sends component photos to the vision model; the app does not currently have a dedicated barcode-scanning/decoding feature.

## Troubleshooting

- **Expo Go cannot load the project:** use `npx expo start --lan`, scan the new QR code, and make sure the phone and PC share Wi-Fi. Expo tunnel mode is optional and requires Expo login or a separately configured tunnel.
- **The app says it cannot reach the backend:** confirm Uvicorn is still running, the app URL uses the PC's current Wi-Fi IPv4 address, and Windows Firewall allows inbound TCP port 8000. Open `http://<your-PC-LAN-IP>:8000/api/health` in the phone browser to check network reachability.
- **Chat reports the model is not configured:** check `GROQ_API_KEY` in the backend `.env` and restart Uvicorn after editing it.
- **Voice or image upload fails:** check the Uvicorn terminal for the request path and error details. Voice uses `POST /voice/transcribe`; chat with an image uses `POST /api/chat`.

Typecheck the app from `mobile-app` with `npm run typecheck`. Run backend upload tests from `circuitai-cloud-backend` with `.\.venv\Scripts\python.exe -m unittest discover -s tests`.

## Structure

```
mobile-app/src/
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

## Backend contract (FastAPI)

| Endpoint | Request | Response |
|---|---|---|
| `GET /api/health` | – | `{ "status": "ok", "provider": "cloud", "model": "qwen/qwen3.8-27b", "configured": true }` |
| `POST /api/chat` | multipart: `message` (text), `history` (JSON `[{role,text}]`), optional `image` (file) | `{ "response": "<markdown>", "model": "qwen/qwen3.8-27b", "provider": "cloud" }` |
| `POST /voice/transcribe` | multipart: `audio` (m4a / `audio/mp4`), `duration_ms` | `{ "text": "..." }` |
| `GET /history` | – | `{ "conversations": Conversation[] }` |

`identification` is optional. If the model returns only markdown in `text`, the app renders it with section icons.
Shapes are in `mobile-app/src/types/index.ts`.

Android allows plain `http://` LAN addresses via `usesCleartextTraffic` (set in `mobile-app/app.json` through `expo-build-properties`; takes effect in development/production builds).
