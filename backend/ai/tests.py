import json
from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings

from ai.gateway import get_ai_provider, AIConfigurationError
from ai.providers.gemini import GeminiProvider
from ai.providers.mistral import MistralProvider


class AIGatewayTests(TestCase):
    @override_settings(AI_PROVIDER='gemini', GEMINI_API_KEY='test-key')
    @patch('ai.providers.gemini.genai')
    def test_get_gemini_provider(self, mock_genai):
        provider = get_ai_provider()
        self.assertIsInstance(provider, GeminiProvider)
        mock_genai.configure.assert_called_once_with(api_key='test-key')

    @override_settings(AI_PROVIDER='mistral', MISTRAL_API_KEY='test-key')
    @patch('ai.providers.mistral.Mistral')
    def test_get_mistral_provider(self, mock_mistral):
        provider = get_ai_provider()
        self.assertIsInstance(provider, MistralProvider)
        mock_mistral.assert_called_once_with(api_key='test-key')

    @override_settings(AI_PROVIDER='unknown')
    def test_get_unknown_provider(self):
        with self.assertRaises(AIConfigurationError):
            get_ai_provider()

    @override_settings(AI_PROVIDER='gemini', GEMINI_API_KEY='')
    def test_gemini_missing_key(self):
        with self.assertRaises(AIConfigurationError):
            get_ai_provider()

    @override_settings(AI_PROVIDER='mistral', MISTRAL_API_KEY='')
    def test_mistral_missing_key(self):
        with self.assertRaises(AIConfigurationError):
            get_ai_provider()


class AIProviderTests(TestCase):
    def setUp(self):
        self.schema = {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "age": {"type": "number"}
            }
        }
        self.mock_json_response = '{"name": "John Doe", "age": 30}'

    @override_settings(GEMINI_API_KEY='test-key')
    @patch('ai.providers.gemini.genai.GenerativeModel')
    @patch('ai.providers.gemini.genai.configure')
    def test_gemini_generate_text(self, mock_configure, mock_model):
        mock_instance = mock_model.return_value
        mock_response = MagicMock()
        mock_response.text = "Generated text"
        mock_instance.generate_content.return_value = mock_response

        provider = GeminiProvider()
        result = provider.generate_text("test prompt", "system prompt")

        self.assertEqual(result, "Generated text")
        mock_instance.generate_content.assert_called_once_with("test prompt")

    @override_settings(GEMINI_API_KEY='test-key')
    @patch('ai.providers.gemini.genai.GenerativeModel')
    @patch('ai.providers.gemini.genai.configure')
    def test_gemini_extract_structured_data_text(self, mock_configure, mock_model):
        mock_instance = mock_model.return_value
        mock_response = MagicMock()
        mock_response.text = self.mock_json_response
        mock_instance.generate_content.return_value = mock_response

        provider = GeminiProvider()
        result = provider.extract_structured_data("content string", self.schema)

        self.assertEqual(result, {"name": "John Doe", "age": 30})
        self.assertTrue(mock_instance.generate_content.called)

    @override_settings(MISTRAL_API_KEY='test-key')
    @patch('ai.providers.mistral.Mistral')
    def test_mistral_generate_text(self, mock_mistral):
        mock_client = mock_mistral.return_value
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content="Generated text"))]
        mock_client.chat.complete.return_value = mock_response

        provider = MistralProvider()
        result = provider.generate_text("test prompt", "system prompt")

        self.assertEqual(result, "Generated text")
        self.assertTrue(mock_client.chat.complete.called)

    @override_settings(MISTRAL_API_KEY='test-key')
    @patch('ai.providers.mistral.Mistral')
    def test_mistral_extract_structured_data_text(self, mock_mistral):
        mock_client = mock_mistral.return_value
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content=self.mock_json_response))]
        mock_client.chat.complete.return_value = mock_response

        provider = MistralProvider()
        result = provider.extract_structured_data("content string", self.schema)

        self.assertEqual(result, {"name": "John Doe", "age": 30})
        self.assertTrue(mock_client.chat.complete.called)
