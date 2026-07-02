from __future__ import annotations

from app.models import GenerateRequest


def build_prompt(inputs: GenerateRequest, style: str) -> str:
    instructions = {
        'professional': 'Write polished, professional copy with clear structure, accurate factual tone, and approachable business language.',
        'creative': 'Write creative, engaging copy with vivid language, strong hooks, and a persuasive narrative feel.',
        'executive': 'Write concise, executive-style copy that highlights outcomes, key decisions, and top-level insights.'
    }

    style_instructions = instructions.get(style, instructions['professional'])
    keywords_section = f"Keywords: {inputs.keywords}\n" if inputs.keywords else ''
    brand_voice_section = f"Brand voice: {inputs.brand_voice}\n" if inputs.brand_voice else ''
    additional_instruction_section = f"Additional instructions: {inputs.additional_instructions}\n" if inputs.additional_instructions else ''

    metadata_section = ''
    if inputs.metadata and inputs.metadata_include:
        metadata_lines = []
        if inputs.metadata_include.get('date') and inputs.metadata.get('date'):
            metadata_lines.append(f"Date: {inputs.metadata['date']}")
        if inputs.metadata_include.get('title') and inputs.metadata.get('title'):
            metadata_lines.append(f"Topic: {inputs.metadata['title']}")
        if inputs.metadata_include.get('venue') and inputs.metadata.get('venue'):
            metadata_lines.append(f"Location: {inputs.metadata['venue']}")
        if inputs.metadata_include.get('authors') and inputs.metadata.get('authors'):
            metadata_lines.append(f"Panelists / speakers: {inputs.metadata['authors']}")
        if inputs.metadata_include.get('relatedLinks') and inputs.metadata.get('relatedLinks'):
            metadata_lines.append(f"Related links: {inputs.metadata['relatedLinks']}")
        if metadata_lines:
            metadata_section = 'Metadata:\n' + '\n'.join(metadata_lines) + '\n\n'

    prompt = (
        f"Generate one draft for a {inputs.content_type} on {inputs.platform}.\n"
        f"Target audience: {inputs.target_audience}.\n"
        f"Goal: {inputs.goal}.\n"
        f"Tone: {inputs.tone}.\n"
        f"Desired length: {inputs.desired_length}.\n"
        f"{keywords_section}"
        f"{brand_voice_section}"
        f"{additional_instruction_section}"
        f"{metadata_section}"
        f"Use the following transcript as source material and focus on content accuracy.\n\n"
        f"Transcript:\n{inputs.transcript}\n\n"
        f"{style_instructions}\n"
        "Return a single complete draft without commentary."
    )
    return prompt


def build_all_prompts(inputs: GenerateRequest) -> dict[str, str]:
    return {
        'professional': build_prompt(inputs, 'professional'),
        'creative': build_prompt(inputs, 'creative'),
        'executive': build_prompt(inputs, 'executive'),
    }
