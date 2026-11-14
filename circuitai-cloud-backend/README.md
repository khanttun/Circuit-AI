# CircuitAI Groq Backend

FastAPI proxy that sends chat and image questions to Groq Qwen and voice recordings to Groq Whisper. The Groq API key stays in this backend and is never sent to the mobile app.

## First-time setup (PowerShell)

```powershell
cd D:\Projects_MFU\Circuit-AI\circuitai-cloud-backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env` and set `GROQ_API_KEY` to a key from <https://console.groq.com/keys>. Keep `.env` private. The defaults are:

- `GROQ_MODEL=qwen/qwen3.8-27b` for text chat and image understanding.
- `GROQ_TRANSCRIPTION_MODEL=whisper-large-v3-turbo` for speech-to-text.
- `GROQ_TRANSCRIPTION_LANGUAGE=` for automatic language detection. Optionally set an ISO-639-1 code such as `en`.

If `.env` already exists, edit it in place; do not copy over it and overwrite your key.

## Start the backend

```powershell
cd D:\Projects_MFU\Circuit-AI\circuitai-cloud-backend
.\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Keep the server running while using the app. Check `http://localhost:8000/api/health` on the PC; a configured server returns `"configured": true`.

In the mobile app, use the PC's Wi-Fi IPv4 address as the backend URL, for example `http://192.168.1.25:8000`. The phone and PC must be on the same Wi-Fi, and Windows Firewall must allow inbound TCP port 8000. `localhost` on the phone does not point to the PC.

## App media flow

- **Photo:** The app resizes and converts a camera/gallery image to JPEG, then sends it with the prompt to `POST /api/chat`.
- **Voice:** The app uploads a recording to `POST /voice/transcribe`. Whisper returns text, which the app sends to Qwen as a chat prompt (with any attached image).
- **Read aloud:** The app uses the phone's built-in text-to-speech. No additional backend model or API key is needed.

Run backend upload tests with:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests
```
