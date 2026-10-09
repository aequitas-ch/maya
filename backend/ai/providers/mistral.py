import json
from typing import Optional, Union, Dict, Any
from django.conf import settings
from mistralai.client import Mistral

from .base import BaseLLMProvider


class MistralProvider(BaseLLMProvider):
    def __init__(self):
        api_key = settings.MISTRAL_API_KEY
        if not api_key:
            raise ValueError("MISTRAL_API_KEY is not set.")

        # Use European endpoints if specifically required or configure via Mistral client
        # mistralai library defaults to their main endpoint which is hosted in Europe (France)
        self.client = Mistral(api_key=api_key)

    def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        messages = []
        if system_prompt:
            messages.append({
                "role": "system",
                "content": system_prompt
            })

        messages.append({
            "role": "user",
            "content": prompt
        })

        response = self.client.chat.complete(
            model="mistral-large-latest",
            messages=messages
        )
        return response.choices[0].message.content

    def extract_structured_data(self, content: Union[bytes, str], schema: Dict[str, Any], mime_type: str = 'application/pdf') -> Dict[str, Any]:
        """
        Extracts structured data by feeding the content to Mistral and using JSON mode if available,
        or instructing it via prompt to return JSON.
        """
        prompt = (
            f"Extract the requested structured information from the following content.\n"
            f"Return ONLY a JSON object matching this schema:\n"
            f"{json.dumps(schema, indent=2)}\n\n"
            f"Content:\n"
        )

        if isinstance(content, bytes):
            # For simplicity, decode to string if it's text-based. For PDFs, would require a multimodal model
            # or separate text extraction step. Here we just convert to string assuming it might be extractable text
            # or raise a NotImplementedError if PDF extraction is required specifically without multimodal support.
            try:
                content_str = content.decode('utf-8', errors='ignore')
            except Exception:
                content_str = str(content)
        else:
            content_str = content

        prompt += content_str

        messages = [
            {"role": "user", "content": prompt}
        ]

        response = self.client.chat.complete(
            model="mistral-large-latest",
            messages=messages,
            response_format={"type": "json_object"}
        )

        result_text = response.choices[0].message.content

        try:
            return json.loads(result_text)
        except json.JSONDecodeError:
            # Fallback parsing
            text = result_text.strip()
            if text.startswith("```json"):
                text = text[7:]
                if text.endswith("```"):
                    text = text[:-3]
                return json.loads(text.strip())
            return {}
