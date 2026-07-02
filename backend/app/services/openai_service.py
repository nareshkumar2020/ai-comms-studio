import os
from pathlib import Path

from dotenv import load_dotenv

from app.models import AIResponse, GenerateRequest
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


def extract_key_points(text: str) -> list[str]:
    # Extract lines starting with bullet points or numbered lists
    points = []
    for line in text.split('\n'):
        clean = line.strip().lstrip('-*•123456789. ')
        if clean and len(clean) > 10 and (
            line.strip().startswith('-')
            or line.strip().startswith('*')
            or line.strip().startswith('•')
            or (line.strip() and line.strip()[0].isdigit() and '.' in line.strip()[:3])
        ):
            points.append(clean)
    if not points:
        # Fallback: extract first few non-empty lines that don't look like headers
        for line in text.split('\n'):
            clean = line.strip()
            if clean and len(clean) > 15 and not clean.startswith('#') and not clean.startswith('Subject:'):
                points.append(clean)
                if len(points) >= 3:
                    break
    return points[:3]


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

        quality = evaluate_drafts(drafts, inputs)
        key_points = [kp for draft in drafts for kp in extract_key_points(draft)]

        return AIResponse(drafts=drafts, key_points=key_points, quality=quality)


    async def refine_text(
        self, inputs: 'RefineRequest'
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
        
        quality = evaluate_drafts([content], inputs)
        return AIResponse(text=content, quality=quality)
