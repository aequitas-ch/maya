from django.conf import settings

from .providers.base import BaseLLMProvider
from .providers.gemini import GeminiProvider
from .providers.mistral import MistralProvider


class AIConfigurationError(Exception):
    """Exception raised for errors in the AI configuration."""
    pass


def get_ai_provider() -> BaseLLMProvider:
    """
    Factory function to get the configured AI provider instance.
    Raises AIConfigurationError if the configuration is invalid or missing required keys.
    """
    provider_name = getattr(settings, 'AI_PROVIDER', 'gemini').lower()

    if provider_name == 'gemini':
        try:
            return GeminiProvider()
        except ValueError as e:
            raise AIConfigurationError(f"Configuration error for Gemini provider: {e}")
    elif provider_name == 'mistral':
        try:
            return MistralProvider()
        except ValueError as e:
            raise AIConfigurationError(f"Configuration error for Mistral provider: {e}")
    else:
        raise AIConfigurationError(f"Unknown AI provider configured: {provider_name}")
