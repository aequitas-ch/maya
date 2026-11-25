from abc import ABC, abstractmethod
from typing import Optional, Union, Dict, Any

class BaseLLMProvider(ABC):
    @abstractmethod
    def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Generates text from the LLM based on a prompt and an optional system prompt."""
        pass

    @abstractmethod
    def extract_structured_data(self, content: Union[bytes, str], schema: Dict[str, Any], mime_type: str = 'application/pdf') -> Dict[str, Any]:
        """Extracts structured data from the provided content matching the given schema."""
        pass
