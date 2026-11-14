import json
import logging
import os
from typing import Any

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
app = FastAPI(title="CircuitAI Cloud Backend")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
GROQ_API_URL = os.getenv(
    "GROQ_API_URL",
    "https://api.groq.com/openai/v1/chat/completions",
)
GROQ_TRANSCRIPTION_MODEL = os.getenv("GROQ_TRANSCRIPTION_MODEL", "whisper-large-v3-turbo")
GROQ_TRANSCRIPTION_LANGUAGE = os.getenv("GROQ_TRANSCRIPTION_LANGUAGE", "").strip()
GROQ_TRANSCRIPTION_URL = os.getenv(
    "GROQ_TRANSCRIPTION_URL",
    "https://api.groq.com/openai/v1/audio/transcriptions",
)
MAX_IMAGE_BYTES = 14 * 1024 * 1024
MAX_AUDIO_BYTES = 24 * 1024 * 1024


@app.get("/api/health")
async def health() -> dict[str, Any]:
    return {
        "status": "ok" if GROQ_API_KEY else "not_configured",
        "provider": "cloud",
        "model": GROQ_MODEL,
        "configured": bool(GROQ_API_KEY),
    }


def _history_messages(history: list[dict[str, str]]) -> list[dict[str, Any]]:
    return [
        {"role": item["role"], "content": item.get("text", "")}
        for item in history
        if item.get("role") in {"user", "assistant"}
    ]


async def _image_data(image: UploadFile) -> str:
    media_type = image.content_type or "image/jpeg"
    if media_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Use a JPEG, PNG, or WebP image.")

    contents = await image.read(MAX_IMAGE_BYTES + 1)
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="The image is too large. Choose a smaller photo.")
    if not contents:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")

    import base64

    return f"data:{media_type};base64,{base64.b64encode(contents).decode('ascii')}"


@app.post("/voice/transcribe")
async def transcribe(audio: UploadFile = File(...), duration_ms: int = Form(0)) -> dict[str, str]:
    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="Groq speech transcription is not configured on the server.")
    if duration_ms <= 0:
        raise HTTPException(status_code=400, detail="Audio duration is required.")

    contents = await audio.read(MAX_AUDIO_BYTES + 1)
    if not contents:
        raise HTTPException(status_code=400, detail="The uploaded audio file is empty.")
    if len(contents) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="The recording is too large. Record a shorter clip.")

    files = {
        "file": (
            audio.filename or "recording.m4a",
            contents,
            audio.content_type or "audio/mp4",
        ),
    }
    data: dict[str, str] = {
        "model": GROQ_TRANSCRIPTION_MODEL,
        "response_format": "json",
    }
    if GROQ_TRANSCRIPTION_LANGUAGE:
        data["language"] = GROQ_TRANSCRIPTION_LANGUAGE
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                GROQ_TRANSCRIPTION_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                data=data,
                files=files,
            )
            response.raise_for_status()
            result = response.json()
    except httpx.TimeoutException as exc:
        logger.warning("Groq transcription request timed out.")
        raise HTTPException(status_code=504, detail="Groq speech transcription timed out.") from exc
    except httpx.HTTPStatusError as exc:
        logger.warning("Groq transcription request was rejected (HTTP %s).", exc.response.status_code)
        raise HTTPException(
            status_code=502,
            detail=f"Groq could not transcribe the audio (upstream HTTP {exc.response.status_code}).",
        ) from exc
    except httpx.HTTPError as exc:
        logger.warning("Groq transcription request failed: %s", exc)
        raise HTTPException(status_code=503, detail="Groq speech transcription is unavailable.") from exc
    except ValueError as exc:
        logger.warning("Groq transcription returned invalid JSON.")
        raise HTTPException(status_code=502, detail="Groq returned an unreadable transcription response.") from exc

    text = result.get("text", "") if isinstance(result, dict) else ""
    if not isinstance(text, str):
        raise HTTPException(status_code=502, detail="Groq returned an unreadable transcription.")
    return {"text": text}


@app.post("/api/chat")
async def chat(
    message: str = Form(""),
    history: str = Form("[]"),
    image: UploadFile | None = File(None),
) -> dict[str, Any]:
    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="Cloud Qwen through Groq is not configured on the server.")

    try:
        parsed_history = json.loads(history)
        if not isinstance(parsed_history, list):
            raise ValueError
    except (TypeError, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=400, detail="Invalid conversation history.") from exc

    content: list[dict[str, Any]] = []
    if message.strip():
        content.append({"type": "text", "text": message.strip()})
    if image:
        content.insert(0, {"type": "image_url", "image_url": {"url": await _image_data(image)}})
    if not content:
        raise HTTPException(status_code=400, detail="A message or image is required.")

    payload = {
        "model": GROQ_MODEL,
        "messages": _history_messages(parsed_history) + [{"role": "user", "content": content}],
    }
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                GROQ_API_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
    except httpx.TimeoutException as exc:
        logger.warning("Groq chat request timed out.")
        raise HTTPException(status_code=504, detail="Cloud Qwen through Groq timed out.") from exc
    except httpx.HTTPStatusError as exc:
        logger.warning("Groq chat request was rejected (HTTP %s).", exc.response.status_code)
        raise HTTPException(
            status_code=502,
            detail=f"Groq rejected the chat request (upstream HTTP {exc.response.status_code}); check the model and image format.",
        ) from exc
    except httpx.HTTPError as exc:
        logger.warning("Groq chat request failed: %s", exc)
        raise HTTPException(status_code=503, detail="Groq is unavailable.") from exc
    except ValueError as exc:
        logger.warning("Groq chat returned invalid JSON.")
        raise HTTPException(status_code=502, detail="Groq returned an unreadable chat response.") from exc

    try:
        answer = data["choices"][0]["message"].get("content") or ""
        if not isinstance(answer, str) or not answer.strip():
            raise ValueError
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="Groq returned an unreadable Cloud Qwen response.") from exc

    return {"response": answer, "model": GROQ_MODEL, "provider": "cloud"}
