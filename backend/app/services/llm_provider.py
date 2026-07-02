from abc import ABC, abstractmethod

from app.models import AIResponse, GenerateRequest, RefineRequest


class ILLMProvider(ABC):
    @abstractmethod
    async def generate_draft(self, inputs: GenerateRequest) -> AIResponse:
        raise NotImplementedError

    @abstractmethod
    async def refine_text(
        self, inputs: 'RefineRequest'
    ) -> AIResponse:
        raise NotImplementedError
