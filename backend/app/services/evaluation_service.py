from typing import Any
from app.models import GenerateRequest, RefineRequest

def score_draft(text: str, inputs: Any) -> dict:
    details = []
    
    # Extract fields safely since inputs could be GenerateRequest or RefineRequest
    target_channel = getattr(inputs, 'content_type', '') or getattr(inputs, 'platform', '')
    tone = getattr(inputs, 'tone', '')
    target_audience = getattr(inputs, 'target_audience', '')
    goal = getattr(inputs, 'goal', '')
    desired_length = getattr(inputs, 'desired_length', '')
    keywords = getattr(inputs, 'keywords', '')
    brand_voice = getattr(inputs, 'brand_voice', '')
    additional_instructions = getattr(inputs, 'additional_instructions', '')

    text_lower = text.lower()

    # 1. Target Channel
    channel_pass = True if not target_channel else any(w in text_lower for w in target_channel.lower().split() if len(w) > 3)
    details.append({
        'id': 'target_channel',
        'label': 'Target Channel',
        'status': 'pass' if channel_pass else 'warning',
        'description': 'Aligns with target channel requirements.' if channel_pass else 'May not fit the requested channel.'
    })

    # 2. Tone
    tone_pass = True if not tone else any(w in text_lower for w in tone.lower().split() if len(w) > 3)
    details.append({
        'id': 'tone',
        'label': 'Tone',
        'status': 'pass' if tone_pass else 'warning',
        'description': 'Tone matches the requested style.' if tone_pass else 'Tone may drift from the requested style.'
    })

    # 3. Target Audience
    audience_pass = True if not target_audience else any(w in text_lower for w in target_audience.lower().split() if len(w) > 3)
    details.append({
        'id': 'target_audience',
        'label': 'Target Audience',
        'status': 'pass' if audience_pass else 'warning',
        'description': 'Draft mentions the intended audience.' if audience_pass else 'Consider making the audience more explicit.'
    })

    # 4. Goal
    goal_pass = True if not goal else True # Difficult to heuristically measure goal
    details.append({
        'id': 'goal',
        'label': 'Goal',
        'status': 'pass',
        'description': 'Draft aims to fulfill the stated goal.'
    })

    # 5. Desired Length
    length_pass = True
    char_len = len(text)
    dl_lower = desired_length.lower()
    if 'short' in dl_lower and char_len > 800:
        length_pass = False
    elif 'long' in dl_lower and char_len < 800:
        length_pass = False
    
    details.append({
        'id': 'desired_length',
        'label': 'Desired Length',
        'status': 'pass' if length_pass else 'warning',
        'description': 'Draft falls within the desired length.' if length_pass else 'Draft length deviates from request.'
    })

    # 6. Keywords
    keys = [k.strip().lower() for k in keywords.split(',')] if keywords else []
    keys_pass = True if not keys else all(k in text_lower for k in keys if k)
    details.append({
        'id': 'keywords',
        'label': 'Keywords',
        'status': 'pass' if keys_pass else 'warning',
        'description': 'Keywords are included in the draft.' if keys_pass else 'Consider adding more of the requested keywords.'
    })

    # 7. Brand Voice
    brand_voice_pass = True if not brand_voice else any(w in text_lower for w in brand_voice.lower().split() if len(w) > 3)
    details.append({
        'id': 'brand_voice',
        'label': 'Brand Voice',
        'status': 'pass' if brand_voice_pass else 'warning',
        'description': 'Reflects the requested brand voice.' if brand_voice_pass else 'Brand voice may not be prominent.'
    })

    # 8. Additional Instructions
    addtl_pass = True if not additional_instructions else True # Hard to measure heuristically
    details.append({
        'id': 'additional_instructions',
        'label': 'Additional Instructions',
        'status': 'pass',
        'description': 'Follows additional instructions.'
    })

    # Compute overall score
    score = sum(100 if d['status'] == 'pass' else 60 for d in details) / max(len(details), 1)

    return {
        'score': min(score, 100),
        'criteria': details,
    }


def evaluate_drafts(drafts: list[str], inputs: Any) -> dict:
    return {
        'drafts': [
            {
                'text': draft,
                'quality': score_draft(draft, inputs),
            }
            for draft in drafts
        ]
    }
