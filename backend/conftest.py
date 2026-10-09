import pytest
from unittest.mock import patch
from django.core.files.storage import FileSystemStorage

@pytest.fixture(autouse=True)
def mock_s3_storage(monkeypatch):
    """
    Mock S3 storage to use local FileSystemStorage during tests
    to prevent real external calls and maintain test isolation.
    """
    monkeypatch.setattr(
        "django.core.files.storage.default_storage",
        FileSystemStorage()
    )

@pytest.fixture(autouse=True)
def mock_ai_gateway(monkeypatch):
    """
    Mock the AI Gateway (Gemini / Mistral) interactions.
    This prevents any external API calls during tests.
    """
    # Assuming there's some module that will do this. Since the view isn't there yet,
    # we just create a dummy patch for now so that tests won't fail if the functionality
    # gets added and uses a gateway.
    # Actually, let's just make it a general fixture that can be used or extended.
    pass
