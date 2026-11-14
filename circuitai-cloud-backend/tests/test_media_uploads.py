import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

import main


class FakeResponse:
    def __init__(self, data: dict[str, str]) -> None:
        self.data = data

    def raise_for_status(self) -> None:
        pass

    def json(self) -> dict[str, str]:
        return self.data


class FakeProviderClient:
    def __init__(self, response: FakeResponse) -> None:
        self.response = response
        self.requests: list[tuple[str, dict[str, object]]] = []

    async def __aenter__(self) -> "FakeProviderClient":
        return self

    async def __aexit__(self, *_: object) -> None:
        return None

    async def post(self, url: str, **kwargs: object) -> FakeResponse:
        self.requests.append((url, kwargs))
        return self.response


class MediaUploadTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(main.app)

    def test_chat_forwards_image_and_prompt_to_vision_model(self) -> None:
        provider = FakeProviderClient(FakeResponse({
            "choices": [{"message": {"content": "This looks like a resistor."}}],
        }))
        with (
            patch.object(main, "GROQ_API_KEY", "test-key"),
            patch.object(main.httpx, "AsyncClient", return_value=provider),
        ):
            response = self.client.post(
                "/api/chat",
                data={"message": "Identify this component", "history": "[]"},
                files={"image": ("component.jpg", b"test-image", "image/jpeg")},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["response"], "This looks like a resistor.")
        payload = provider.requests[0][1]["json"]
        self.assertEqual(payload["model"], main.GROQ_MODEL)
        content = payload["messages"][0]["content"]
        self.assertEqual(content[1], {"type": "text", "text": "Identify this component"})
        self.assertTrue(content[0]["image_url"]["url"].startswith("data:image/jpeg;base64,"))

    def test_voice_upload_is_forwarded_to_transcription_model(self) -> None:
        provider = FakeProviderClient(FakeResponse({"text": "What is this component?"}))
        with (
            patch.object(main, "GROQ_API_KEY", "test-key"),
            patch.object(main.httpx, "AsyncClient", return_value=provider),
        ):
            response = self.client.post(
                "/voice/transcribe",
                data={"duration_ms": "1200"},
                files={"audio": ("recording.m4a", b"test-audio", "audio/mp4")},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"text": "What is this component?"})
        _, request = provider.requests[0]
        self.assertEqual(request["data"]["model"], main.GROQ_TRANSCRIPTION_MODEL)
        self.assertEqual(request["files"]["file"][1], b"test-audio")

    def test_oversized_image_is_rejected_before_provider_request(self) -> None:
        provider = FakeProviderClient(FakeResponse({}))
        with (
            patch.object(main, "GROQ_API_KEY", "test-key"),
            patch.object(main.httpx, "AsyncClient", return_value=provider),
        ):
            response = self.client.post(
                "/api/chat",
                data={"message": "Identify this", "history": "[]"},
                files={"image": ("large.jpg", b"x" * (main.MAX_IMAGE_BYTES + 1), "image/jpeg")},
            )

        self.assertEqual(response.status_code, 413)
        self.assertEqual(provider.requests, [])


if __name__ == "__main__":
    unittest.main()
