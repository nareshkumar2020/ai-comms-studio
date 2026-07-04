from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

from app.models import GenerateRequest, QualityCriteria, QualityDetails, RefineRequest

for env_path in [
    Path(__file__).resolve().parents[2] / '.env',
    Path(__file__).resolve().parents[2] / '.env.local',
    Path(__file__).resolve().parents[3] / '.env',
    Path(__file__).resolve().parents[3] / '.env.local',
]:
    load_dotenv(dotenv_path=env_path, override=False)


# A separate (optionally cheaper/faster) model can be used for judging vs. generation.
_EVAL_MODEL = os.getenv('OPENAI_EVAL_MODEL', os.getenv('OPENAI_MODEL', 'gpt-4.1-mini'))

_STATUS_SCORES = {'pass': 100.0, 'partial': 50.0, 'fail': 0.0}


def _build_rubric(inputs: GenerateRequest | RefineRequest) -> list[dict[str, str]]:
    """Build the list of rubric criteria that apply, based on which attributes the user
    actually supplied (GenerateRequest has them all populated; RefineRequest fields are
    optional, so only score what's available)."""
    rubric: list[dict[str, str]] = []

    if getattr(inputs, 'target_audience', None):
        rubric.append({
            'id': 'audience_fit',
            'label': 'Audience Fit',
            'guidance': f'Does the draft speak appropriately to the target audience: "{inputs.target_audience}"?',
        })
    if getattr(inputs, 'goal', None):
        rubric.append({
            'id': 'goal_alignment',
            'label': 'Goal Alignment',
            'guidance': f'Does the draft accomplish the stated goal: "{inputs.goal}"?',
        })
    if getattr(inputs, 'tone', None):
        rubric.append({
            'id': 'tone_match',
            'label': 'Tone Match',
            'guidance': f'Does the draft consistently match the requested tone: "{inputs.tone}"?',
        })
    if getattr(inputs, 'content_type', None) or getattr(inputs, 'platform', None):
        content_type = getattr(inputs, 'content_type', None) or 'the requested format'
        platform = getattr(inputs, 'platform', None) or 'the requested platform'
        rubric.append({
            'id': 'format_fit',
            'label': 'Format & Platform Fit',
            'guidance': f'Is the draft correctly structured as a {content_type} suited for {platform}?',
        })
    if getattr(inputs, 'desired_length', None):
        rubric.append({
            'id': 'length_adherence',
            'label': 'Length Adherence',
            'guidance': f'Does the draft\'s length reasonably match the desired length: "{inputs.desired_length}"?',
        })
    if getattr(inputs, 'keywords', None):
        rubric.append({
            'id': 'keyword_usage',
            'label': 'Keyword Usage',
            'guidance': f'Does the draft naturally incorporate these keywords/phrases: "{inputs.keywords}"?',
        })
    if getattr(inputs, 'brand_voice', None):
        rubric.append({
            'id': 'brand_voice',
            'label': 'Brand Voice Consistency',
            'guidance': f'Does the draft stay consistent with this brand voice description: "{inputs.brand_voice}"?',
        })
    if getattr(inputs, 'additional_instructions', None):
        rubric.append({
            'id': 'special_instructions',
            'label': 'Special Instructions',
            'guidance': f'Does the draft follow these additional instructions: "{inputs.additional_instructions}"?',
        })

    # Always assess factual grounding against source material when a transcript exists.
    if getattr(inputs, 'transcript', None):
        rubric.append({
            'id': 'content_accuracy',
            'label': 'Content Accuracy',
            'guidance': 'Does the draft accurately reflect facts, claims, and details from the source transcript without fabrication?',
        })

    return rubric


def _build_evaluation_prompt(
    draft: str, inputs: GenerateRequest | RefineRequest, rubric: list[dict[str, str]]
) -> str:
    rubric_lines = '\n'.join(
        f'- id="{item["id"]}" ({item["label"]}): {item["guidance"]}' for item in rubric
    )

    transcript = getattr(inputs, 'transcript', None)
    transcript_section = (
        f'Source transcript / reference material:\n"""\n{transcript}\n"""\n\n'
        if transcript
        else 'No source transcript was supplied for this draft.\n\n'
    )

    return (
        'You are a meticulous editorial QA evaluator. Score the draft below against each rubric '
        'criterion, and separately score how well the draft is grounded in / faithful to the source '
        'transcript (its "RAG score" -- i.e. how well it stays true to the retrieved source content, '
        'independent of style or tone).\n\n'
        f'{transcript_section}'
        f'Draft to evaluate:\n"""\n{draft}\n"""\n\n'
        'Rubric criteria to assess:\n'
        f'{rubric_lines}\n\n'
        'For each criterion, assign a status of exactly "pass", "partial", or "fail", and a '
        'one-sentence description explaining the assessment.\n\n'
        'Then provide:\n'
        '- "quality_score": an overall 0-100 score representing how well the draft satisfies the '
        'rubric criteria as a whole.\n'
        '- "rag_score": a 0-100 score (or null if there is no transcript) representing how '
        'factually grounded/faithful the draft is to the source transcript specifically '
        '(penalize fabricated, unsupported, or contradicted claims).\n\n'
        'Respond with ONLY a JSON object in this exact shape, no commentary, no markdown fences:\n'
        '{\n'
        '  "criteria": [{"id": "...", "status": "pass|partial|fail", "description": "..."}],\n'
        '  "quality_score": 0-100,\n'
        '  "rag_score": 0-100 or null\n'
        '}'
    )


def _fallback_quality(rubric: list[dict[str, str]], reason: str) -> QualityDetails:
    """Used when the LLM judge can't be reached, so draft generation itself never fails
    because of an evaluation problem."""
    criteria = [
        QualityCriteria(
            id=item['id'],
            label=item['label'],
            status='unknown',
            description=f'Automated evaluation unavailable: {reason}',
        )
        for item in rubric
    ]
    return QualityDetails(qualityScore=0.0, ragScore=None, criteria=criteria)


def _score_from_status(criteria_payload: list[dict[str, Any]]) -> float:
    """Fallback numeric score derived from per-criterion status, used only if the model
    fails to return a usable quality_score value."""
    if not criteria_payload:
        return 0.0
    scores = [_STATUS_SCORES.get(str(c.get('status', '')).lower(), 0.0) for c in criteria_payload]
    return round(sum(scores) / len(scores), 1)


async def evaluate_drafts(
    drafts: list[str], inputs: GenerateRequest | RefineRequest
) -> list[QualityDetails]:
    """Score each draft against a rubric derived from the user's input attributes
    (audience, goal, tone, platform, length, keywords, brand voice, etc.), plus a
    groundedness ("RAG") score measuring how faithful the draft is to the supplied
    transcript/content.

    Uses the OpenAI API as an LLM-judge, run concurrently across drafts. Falls back to a
    neutral, clearly-labeled result if the API key is missing or a call fails, so that
    evaluation issues never break draft generation itself.
    """
    rubric = _build_rubric(inputs)

    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        return [_fallback_quality(rubric, 'no API key configured') for _ in drafts]
    if not rubric:
        return [_fallback_quality(rubric, 'no rubric criteria available for these inputs') for _ in drafts]

    try:
        from openai import AsyncOpenAI
    except Exception:
        return [_fallback_quality(rubric, 'openai package unavailable') for _ in drafts]

    client = AsyncOpenAI(api_key=api_key)

    async def _evaluate_one(draft: str) -> QualityDetails:
        prompt = _build_evaluation_prompt(draft, inputs, rubric)
        try:
            response = await client.chat.completions.create(
                model=_EVAL_MODEL,
                messages=[
                    {
                        'role': 'system',
                        'content': 'You are a strict, consistent evaluator. You only ever respond with valid JSON.',
                    },
                    {'role': 'user', 'content': prompt},
                ],
                temperature=0.0,
                response_format={'type': 'json_object'},
            )
            raw = response.choices[0].message.content or '{}'
            payload = json.loads(raw)
        except Exception as exc:
            return _fallback_quality(rubric, f'evaluation call failed ({exc})')

        criteria_payload = payload.get('criteria') or []

        criteria: list[QualityCriteria] = []
        for item in rubric:
            match = next((c for c in criteria_payload if c.get('id') == item['id']), None)
            if match:
                status = str(match.get('status', 'unknown')).lower()
                description = str(match.get('description', ''))
            else:
                status = 'unknown'
                description = 'Evaluator did not return a result for this criterion.'
            criteria.append(
                QualityCriteria(
                    id=item['id'],
                    label=item['label'],
                    status=status,
                    description=description,
                )
            )

        quality_score = payload.get('quality_score')
        if not isinstance(quality_score, (int, float)):
            quality_score = _score_from_status(criteria_payload)

        rag_score = payload.get('rag_score')
        if rag_score is not None and not isinstance(rag_score, (int, float)):
            rag_score = None

        return QualityDetails(
            qualityScore=float(quality_score),
            ragScore=float(rag_score) if rag_score is not None else None,
            criteria=criteria,
        )

    return list(await asyncio.gather(*(_evaluate_one(draft) for draft in drafts)))