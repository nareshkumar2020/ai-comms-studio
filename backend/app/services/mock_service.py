import asyncio

from app.models import AIResponse, GenerateRequest
from app.services.llm_provider import ILLMProvider
from app.services.evaluation_service import evaluate_drafts


def extract_key_points(text: str) -> list[str]:
    points = []
    for line in text.split('\n'):
        clean = line.strip().lstrip('-*•0123456789. ')
        if clean and len(clean) > 10 and (
            line.strip().startswith('-')
            or line.strip().startswith('*')
            or line.strip().startswith('•')
            or (line.strip() and line.strip()[0].isdigit() and '.' in line.strip()[:3])
        ):
            points.append(clean)
    if not points:
        for line in text.split('\n'):
            clean = line.strip()
            if clean and len(clean) > 15 and not clean.startswith('#') and not clean.startswith('Subject:'):
                points.append(clean)
                if len(points) >= 3:
                    break
    return points[:3]


def build_metadata_summary(inputs: GenerateRequest) -> str:
    lines = []
    if inputs.metadata and inputs.metadata_include:
        if inputs.metadata_include.get('date') and inputs.metadata.get('date'):
            lines.append(f"Date: {inputs.metadata['date']}")
        if inputs.metadata_include.get('title') and inputs.metadata.get('title'):
            lines.append(f"Topic: {inputs.metadata['title']}")
        if inputs.metadata_include.get('venue') and inputs.metadata.get('venue'):
            lines.append(f"Location: {inputs.metadata['venue']}")
        if inputs.metadata_include.get('authors') and inputs.metadata.get('authors'):
            lines.append(f"Panelists / speakers: {inputs.metadata['authors']}")
        if inputs.metadata_include.get('relatedLinks') and inputs.metadata.get('relatedLinks'):
            lines.append(f"Related links: {inputs.metadata['relatedLinks']}")
    return '\n'.join(lines)


def build_metadata_block(inputs: GenerateRequest) -> list[str]:
    if not inputs.metadata or not inputs.metadata_include:
        return []

    blocks = []
    if inputs.metadata_include.get('date') and inputs.metadata.get('date'):
        blocks.append(f"Date: {inputs.metadata['date']}")
    if inputs.metadata_include.get('title') and inputs.metadata.get('title'):
        blocks.append(f"Topic: {inputs.metadata['title']}")
    if inputs.metadata_include.get('venue') and inputs.metadata.get('venue'):
        blocks.append(f"Location: {inputs.metadata['venue']}")
    if inputs.metadata_include.get('authors') and inputs.metadata.get('authors'):
        blocks.append(f"Panelists / speakers: {inputs.metadata['authors']}")
    if inputs.metadata_include.get('relatedLinks') and inputs.metadata.get('relatedLinks'):
        blocks.append(f"Related links: {inputs.metadata['relatedLinks']}")

    return blocks


def build_metadata_context(inputs: GenerateRequest) -> str:
    blocks = build_metadata_block(inputs)
    if not blocks:
        return ''
    return 'Metadata context:\n' + '\n'.join(blocks) + '\n\n'


def build_keyword_instruction(inputs: GenerateRequest) -> str:
    if not inputs.keywords:
        return ''
    keywords = [keyword.strip() for keyword in inputs.keywords.split(',') if keyword.strip()]
    if not keywords:
        return ''
    return f"Include keywords: {', '.join(keywords)}. "


def build_channel_label(content_type: str) -> str:
    normalized = content_type.lower()
    if 'email' in normalized:
        return 'internal email'
    if 'blog' in normalized or 'website' in normalized:
        return 'long-form article'
    if 'social' in normalized or 'post' in normalized or 'linkedin' in normalized:
        return 'social media post'
    if 'release' in normalized:
        return 'release note'
    if 'documentation' in normalized:
        return 'documentation update'
    return content_type


def build_metadata_footer(inputs: GenerateRequest) -> str:
    blocks = build_metadata_block(inputs)
    if not blocks:
        return ''
    return f"References: {' | '.join(blocks)}."


def format_cta_line(channel: str) -> str:
    if 'email' in channel:
        return 'Please review and share any feedback by end of day.'
    if 'blog' in channel or 'article' in channel:
        return 'Publish this as the next external update or internal announcement.'
    if 'social' in channel:
        return 'Share this with a concise CTA and drive engagement.'
    if 'release' in channel:
        return 'Include this in the release communication and support documentation.'
    if 'documentation' in channel:
        return 'Link this update into the product documentation and release notes.'
    return 'Use this copy to keep stakeholders aligned.'


def build_professional_body(channel_label: str, summary_line: str, bullets: str, metadata_context: str, metadata_footer: str, keyword_instruction: str, brand_voice: str, extra_instructions: str, inputs: GenerateRequest) -> str:
    if 'email' in channel_label:
        return (
            f"{metadata_context}Subject: {inputs.goal}\n\n"
            f"Hello team,\n\n"
            f"This internal update summarizes the key discussion points for {inputs.target_audience}.\n"
            f"{summary_line}.\n\n"
            f"Key takeaways:\n{bullets}\n\n"
            f"{metadata_footer} {keyword_instruction}{brand_voice}{extra_instructions}\n\n"
            f"{format_cta_line(channel_label)}\n\nRegards,"
        )

    if 'blog' in channel_label or 'article' in channel_label:
        return (
            f"{metadata_context}This long-form article is intended for {inputs.target_audience}.\n"
            f"Tone: {inputs.tone}. Goal: {inputs.goal}. {keyword_instruction}{brand_voice}{extra_instructions}\n\n"
            f"## Overview\n{summary_line}.\n\n"
            f"## What changed\n{bullets}\n\n"
            f"## Why it matters\nExplain why these points matter to the audience.\n\n"
            f"{metadata_footer}\n\n{format_cta_line(channel_label)}"
        )

    if 'social' in channel_label:
        return (
            f"{metadata_context}A punchy social media post for {inputs.target_audience}.\n"
            f"{summary_line}.\n\n"
            f"Highlights:\n{bullets}\n\n"
            f"{metadata_footer} {keyword_instruction}{brand_voice}{extra_instructions}\n\n"
            f"#Update #Team {format_cta_line(channel_label)}"
        )

    if 'release' in channel_label:
        return (
            f"{metadata_context}Release note overview for {inputs.target_audience}.\n"
            f"{summary_line}.\n\n"
            f"Release highlights:\n{bullets}\n\n"
            f"{metadata_footer} {keyword_instruction}{brand_voice}{extra_instructions}\n\n"
            f"Please include this content in the release announcement and product changelog."
        )

    if 'documentation' in channel_label:
        return (
            f"{metadata_context}Documentation update for {inputs.target_audience}.\n"
            f"Summary:\n{summary_line}.\n\n"
            f"Changes:\n{bullets}\n\n"
            f"{metadata_footer} {keyword_instruction}{brand_voice}{extra_instructions}\n\n"
            f"Ensure this update is linked to the relevant product docs and release notes."
        )

    return (
        f"{metadata_context}Professional {channel_label} for {inputs.target_audience}.\n"
        f"Tone: {inputs.tone}. Goal: {inputs.goal}. {keyword_instruction}{brand_voice}{extra_instructions}\n\n"
        f"{summary_line}.\n\n"
        f"Key points:\n{bullets}\n\n"
        f"{metadata_footer}\n\n{format_cta_line(channel_label)}"
    )


def build_creative_body(channel_label: str, summary_line: str, bullets: str, metadata_context: str, metadata_footer: str, keyword_instruction: str, brand_voice: str, extra_instructions: str, inputs: GenerateRequest) -> str:
    emotion = 'energized' if inputs.tone.lower() in ['friendly', 'conversational', 'marketing'] else 'confident'
    if 'email' in channel_label:
        return (
            f"{metadata_context}Bring this email to life with a conversational tone and clear value.\n\n"
            f"Hi all,\n\n"
            f"{summary_line}.\n\n"
            f"Highlights:\n{bullets}\n\n"
            f"{metadata_footer} {keyword_instruction}{brand_voice}{extra_instructions}\n\n"
            f"Let me know your thoughts — looking forward to the next steps."
        )

    return (
        f"{metadata_context}A {emotion} {channel_label} that feels more like storytelling than instruction.\n\n"
        f"Lead: {summary_line}.\n\n"
        f"Highlights:\n{bullets}\n\n"
        f"{metadata_footer} {keyword_instruction}{brand_voice}{extra_instructions}\n\n"
        f"Close with a memorable invitation that keeps the audience curious."
    )


def build_executive_body(channel_label: str, summary_line: str, bullets: str, metadata_context: str, metadata_footer: str, keyword_instruction: str, brand_voice: str, extra_instructions: str, inputs: GenerateRequest) -> str:
    if 'email' in channel_label:
        return (
            f"{metadata_context}Executive email summary for {inputs.target_audience}.\n\n"
            f"Key takeaway: {summary_line}.\n\n"
            f"Top priorities:\n{bullets}\n\n"
            f"{metadata_footer} {keyword_instruction}{brand_voice}{extra_instructions}\n\n"
            f"Next action: align on the follow-up items."
        )

    return (
        f"{metadata_context}Executive summary for {channel_label}.\n"
        f"Audience: {inputs.target_audience}. Goal: {inputs.goal}. {keyword_instruction}{brand_voice}{extra_instructions}\n\n"
        f"Summary:\n{summary_line}.\n\n"
        f"Top takeaways:\n{bullets}\n\n"
        f"{metadata_footer}\n\n"
        f"Recommendation: Share this with stakeholders and move the next item forward."
    )


def build_q3_financial_mock(inputs: GenerateRequest, style: str) -> str:
    base = (
        f"Subject: Q3 Financial Results & Next Steps for {inputs.target_audience}\n\n" if 'email' in inputs.content_type.lower() else ""
    )
    if style == 'professional':
        return base + (
            "Dear Team,\n\n"
            "We are pleased to share our Q3 financial results. Thanks to your hard work, revenue grew by 15% year-over-year to $45 million. "
            "Additionally, our gross margins improved to 68%, largely driven by recent supply chain optimizations.\n\n"
            "While these metrics are highly encouraging, please note that customer acquisition costs saw a slight increase of 5%. "
            "Moving into Q4, our primary strategic focus will be on expanding the enterprise sales team and officially launching the new analytics dashboard. "
            "We anticipate a 20% growth in the upcoming quarter based on our current pipeline.\n\n"
            "Thank you for your continued dedication.\n\n"
            "Best regards,\n"
            "Leadership Team"
        )
    if style == 'creative':
        return base + (
            "Hi everyone,\n\n"
            "What a fantastic quarter! We’ve hit a massive milestone with Q3 revenue soaring by 15% to reach $45 million. "
            "A huge shoutout to our supply chain team who did a stellar job, bringing our gross margins up to an impressive 68%.\n\n"
            "While our customer acquisition costs nudged up slightly by 5%, our momentum in the market is undeniable. "
            "Get ready for Q4—we're expanding our enterprise sales team and unveiling the much-anticipated analytics dashboard to drive a projected 20% growth.\n\n"
            "Let's keep climbing and finish the year strong! 🚀"
        )
    return base + (
        "Executive Summary: Q3 Financial Results\n\n"
        "**Financial Highlights:**\n"
        "- Revenue: $45M (15% YoY growth)\n"
        "- Gross Margin: 68% (Optimized supply chain)\n"
        "- CAC: Increased by 5% (Requires attention in Q4)\n\n"
        "**Q4 Outlook:**\n"
        "Expecting 20% growth driven by enterprise sales expansion and the analytics dashboard launch.\n\n"
        "**Action Required:**\n"
        "Align enterprise sales targets for Q4 and review marketing spend to optimize CAC."
    )


def build_project_nova_mock(inputs: GenerateRequest, style: str) -> str:
    base = (
        f"Subject: Announcing Project Nova Launch for {inputs.target_audience}\n\n" if 'email' in inputs.content_type.lower() else ""
    )
    if style == 'professional':
        return base + (
            "Hello,\n\n"
            "We are excited to announce the official launch of Project Nova, our next-generation AI platform. "
            "Project Nova is designed to reduce processing times by up to 40% and integrates seamlessly with your existing enterprise workflows.\n\n"
            "Key features include:\n"
            "- Robust support for unstructured data formats.\n"
            "- A new intuitive visual pipeline builder.\n"
            "- Enhanced enterprise-grade security protocols.\n\n"
            "During our extended beta phase, testers reported an average 2x increase in daily throughput. "
            "Project Nova will be generally available next Tuesday for all premium users. Please reach out to your account manager for implementation details.\n\n"
            "Best regards,\n"
            "The Product Team"
        )
    if style == 'creative':
        return base + (
            "Meet Project Nova! ✨\n\n"
            "Our next-generation AI platform is finally here, and it's built to absolutely revolutionize your daily workflow. "
            "Imagine cutting your data processing times by a massive 40% while seamlessly integrating with the tools you already love.\n\n"
            "With brand new support for unstructured data and an incredibly intuitive visual pipeline builder, our beta testers are already seeing a 2x boost in throughput. "
            "Get ready to supercharge your productivity when Project Nova drops next Tuesday for all premium users. We can't wait for you to try it!"
        )
    return base + (
        "Executive Summary: Project Nova Launch\n\n"
        "**Product Overview:**\n"
        "- Name: Project Nova (Next-gen AI platform)\n"
        "- Value Prop: 40% processing time reduction, 2x throughput increase\n"
        "- Key Features: Unstructured data support, visual pipeline builder, advanced security\n\n"
        "**Availability:**\n"
        "- Launch Date: Next Tuesday\n"
        "- Target Segment: Premium users\n\n"
        "**Recommendation:**\n"
        "Ensure customer success and support teams are fully briefed and prepared for the rollout. Monitor early adoption metrics closely."
    )


def build_incident_report_mock(inputs: GenerateRequest, style: str) -> str:
    base = (
        f"Subject: Incident Report Update - Oct 12 Database Migration\n\n" if 'email' in inputs.content_type.lower() else ""
    )
    if style == 'professional':
        return base + (
            "Dear Stakeholders,\n\n"
            "This is a formal incident report regarding the system downtime experienced on Oct 12. "
            "At 08:00 UTC, an unexpected issue during a routine database migration caused a primary node failure, leading to exactly 45 minutes of downtime in the European region.\n\n"
            "Our site reliability engineering team immediately escalated the issue, successfully rolling back the migration at 08:30 UTC. All systems were fully stabilized by 08:45 UTC. "
            "We have rigorously verified our backups and can confirm that absolutely no data was lost or corrupted during this event.\n\n"
            "To prevent future occurrences, we are adding comprehensive pre-flight checks to our CI/CD pipeline and significantly increasing replication lag monitoring thresholds.\n\n"
            "We apologize for the disruption to your services."
        )
    if style == 'creative':
        return base + (
            "Hi team,\n\n"
            "Here's a quick, transparent update on the brief downtime we experienced in the European region on Oct 12. "
            "At 08:00 UTC, a database migration didn't go as planned and caused a primary node failure, resulting in 45 minutes of downtime.\n\n"
            "The good news? Our amazing engineering team jumped right on it, safely rolled back the migration by 08:30 UTC, and had everything completely back to normal by 08:45 UTC. Best of all: zero data loss!\n\n"
            "We're already putting stronger safeguards in place—like extra automated pre-flight checks and better real-time replication monitoring—so we're even more resilient moving forward. Thanks for your patience!"
        )
    return base + (
        "Incident Summary: Oct 12 Outage (European Region)\n\n"
        "**Incident Details:**\n"
        "- Issue: Primary node failure during database migration\n"
        "- Impact: 45 minutes downtime (08:00 UTC - 08:45 UTC)\n\n"
        "**Resolution:**\n"
        "- Actions Taken: Migration rolled back at 08:30 UTC; systems fully stabilized by 08:45 UTC\n"
        "- Data Impact: Zero data loss verified\n\n"
        "**Preventative Action Items:**\n"
        "1. Implement additional CI/CD pre-flight checks.\n"
        "2. Enhance replication lag monitoring thresholds immediately."
    )


def build_mock_draft(inputs: GenerateRequest, style: str) -> str:
    transcript_lower = (inputs.transcript or '').lower()
    
    if 'q3 financial results' in transcript_lower:
        return build_q3_financial_mock(inputs, style)
    if 'project nova' in transcript_lower:
        return build_project_nova_mock(inputs, style)
    if 'incident report' in transcript_lower:
        return build_incident_report_mock(inputs, style)

    transcript_snippet = inputs.transcript.strip().replace('\n', ' ')
    summary_line = transcript_snippet[:220].rstrip('.')
    key_points = extract_key_points(inputs.transcript)
    bullets = '\n'.join(f"- {point}" for point in key_points) if key_points else f"- {summary_line}"
    metadata_context = build_metadata_context(inputs)
    metadata_footer = build_metadata_footer(inputs)
    keyword_instruction = build_keyword_instruction(inputs)
    brand_voice = f"Brand voice: {inputs.brand_voice}. " if inputs.brand_voice else ''
    extra_instructions = f"Additional guidance: {inputs.additional_instructions}. " if inputs.additional_instructions else ''
    channel_label = build_channel_label(inputs.content_type)

    if style == 'professional':
        return build_professional_body(
            channel_label,
            summary_line,
            bullets,
            metadata_context,
            metadata_footer,
            keyword_instruction,
            brand_voice,
            extra_instructions,
            inputs,
        )

    if style == 'creative':
        return build_creative_body(
            channel_label,
            summary_line,
            bullets,
            metadata_context,
            metadata_footer,
            keyword_instruction,
            brand_voice,
            extra_instructions,
            inputs,
        )

    return build_executive_body(
        channel_label,
        summary_line,
        bullets,
        metadata_context,
        metadata_footer,
        keyword_instruction,
        brand_voice,
        extra_instructions,
        inputs,
    )


class MockLLMService(ILLMProvider):
    async def generate_draft(self, inputs: GenerateRequest) -> AIResponse:
        await asyncio.sleep(0.2)
        
        from app.services.rag_service import feed_rag_text, validate_rag_text
        if inputs.transcript:
            feed_rag_text(inputs.transcript)
            
        drafts = [
            build_mock_draft(inputs, 'professional'),
            build_mock_draft(inputs, 'creative'),
            build_mock_draft(inputs, 'executive'),
        ]
        quality = evaluate_drafts(drafts, inputs)
        
        key_points = [kp for draft in drafts for kp in extract_key_points(draft)]
        return AIResponse(
            drafts=drafts, 
            key_points=key_points, 
            quality=quality
        )

    async def refine_text(
        self, inputs: 'RefineRequest'
    ) -> AIResponse:
        await asyncio.sleep(0.2)
        refined = inputs.current_text
        lower_instruction = (inputs.instruction or '').lower()
        adjustment = (inputs.adjustment_type or '').lower()

        if adjustment == 'shorten' or 'shorten' in lower_instruction:
            lines = [line for line in inputs.current_text.split('\n') if line.strip()]
            if len(lines) > 4:
                refined = '\n'.join(lines[:4])
            else:
                refined = inputs.current_text

        elif adjustment == 'longer' or 'expand' in lower_instruction or 'longer' in lower_instruction:
            refined = inputs.current_text + '\n\nAdditional detail: the team reflected on the transcript and surfaced extra context to make the message richer.'

        elif adjustment == 'dramatic' or 'dramatic' in lower_instruction or 'impact' in lower_instruction:
            refined = inputs.current_text.replace('update', 'momentous update').replace('summary', 'defining summary').replace('important', 'critical')

        elif adjustment == 'engaging' or 'engaging' in lower_instruction:
            refined = '💡 ' + inputs.current_text + '\n\nWhat do you think? Share your feedback and keep the momentum going.'

        elif adjustment == 'tone' or 'tone' in lower_instruction:
            refined = inputs.current_text.replace('Professional', 'Enthusiastic').replace('Executive', 'Professional')

        # Calculate quality on the refined draft
        quality = evaluate_drafts([refined], inputs)
        
        return AIResponse(text=refined, quality=quality)

