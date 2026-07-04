from app.models import RefineRequest
import os
from pathlib import Path

from dotenv import load_dotenv

from app.models import AIResponse, GenerateRequest, DraftResult
from app.services.llm_provider import ILLMProvider
from app.services.prompt_builder import build_all_prompts
from app.services.evaluation_service import evaluate_drafts


for env_path in [
    Path(__file__).resolve().parents[2] / '.env',
    Path(__file__).resolve().parents[2] / '.env.local',
    Path(__file__).resolve().parents[3] / '.env',
    Path(__file__).resolve().parents[3] / '.env.local',
]:
    load_dotenv(dotenv_path=env_path, override=False)





class OpenAIService(ILLMProvider):
    def __init__(self) -> None:
        self.api_key = os.getenv('OPENAI_API_KEY')
        self.model = os.getenv('OPENAI_MODEL', 'gpt-4.1-mini')
        self._client = None

        if self.api_key:
            try:
                from openai import OpenAI

                self._client = OpenAI(api_key=self.api_key)
            except Exception:
                self._client = None

    async def generate_draft(self, inputs: GenerateRequest) -> AIResponse:
        if not self._client:
            raise RuntimeError('OpenAI client is unavailable. Set OPENAI_API_KEY or use the mock provider.')

        prompts = build_all_prompts(inputs)
        drafts: list[str] = []

        for prompt in prompts.values():
            response = self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {'role': 'system', 'content': 'You are a polished communications assistant.'},
                    {'role': 'user', 'content': prompt},
                ],
                temperature=0.7,
            )
            content = response.choices[0].message.content or 'Draft generation failed.'
            drafts.append(content.strip())

        qualities = await evaluate_drafts(drafts, inputs)
        
        results = []
        for draft, quality in zip(drafts, qualities):
            results.append(DraftResult(text=draft, quality=quality))

        return AIResponse(results=results)


    async def refine_text(
        self, inputs: RefineRequest
    ) -> AIResponse:
        if not self._client:
            raise RuntimeError('OpenAI client is unavailable. Set OPENAI_API_KEY or use the mock provider.')

        adj_hint = f' Adjustment type: {inputs.adjustment_type}.' if inputs.adjustment_type else ''
        response = self._client.chat.completions.create(
            model=self.model,
            messages=[
                {'role': 'system', 'content': 'You are a precise writing assistant.'},
                {
                    'role': 'user',
                    'content': f'Refine the following text using this instruction: {inputs.instruction}.{adj_hint}\n\n{inputs.current_text}',
                },
            ],
            temperature=0.7,
        )
        content = response.choices[0].message.content or 'Refinement failed.'
        
        qualities = await evaluate_drafts([content], inputs)
        
        results = [DraftResult(text=content, quality=qualities[0] if qualities else None)]

        return AIResponse(results=results)
