import json
from typing import Optional, Union, Dict, Any
from django.conf import settings
import google.generativeai as genai

from .base import BaseLLMProvider


class GeminiProvider(BaseLLMProvider):
    def __init__(self):
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set.")
        genai.configure(api_key=api_key)

    def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            system_instruction=system_prompt
        )
        response = model.generate_content(prompt)
        return response.text

    def extract_structured_data(self, content: Union[bytes, str], schema: Dict[str, Any], mime_type: str = 'application/pdf') -> Dict[str, Any]:
        """
        Extracts structured data by feeding the content to Gemini and using JSON schema response format.
        """
        model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            generation_config={"response_mime_type": "application/json"}
        )

        prompt = (
            f"Extract the requested structured information from the provided content.\n"
            f"Provide the response strictly as a JSON object matching this schema:\n"
            f"{json.dumps(schema, indent=2)}\n\n"
        )

        # If content is bytes, we can try to upload or pass as inline data if supported
        # For simplicity in this interface, assuming text extraction or handling base64 might be needed,
        # but let's use the provided structure:
        if isinstance(content, bytes):
             parts = [{"mime_type": mime_type, "data": content}]
             response = model.generate_content([prompt, parts[0]])
        else:
             response = model.generate_content([prompt, content])

        try:
            return json.loads(response.text)
        except json.JSONDecodeError:
            # Fallback parsing if the model included markdown blocks
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
                if text.endswith("```"):
                    text = text[:-3]
                return json.loads(text.strip())
            return {}
