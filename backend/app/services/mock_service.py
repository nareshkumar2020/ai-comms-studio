from app.models import AIResponse, DraftResult, QualityDetails, QualityCriteria, GenerateRequest, RefineRequest
import random

class MockLLMService:
    async def generate_draft(self, request: GenerateRequest) -> AIResponse:
        # Construct a template based on inputs
        mock_text = (
            f"Here is your {request.content_type} drafted for {request.target_audience}. "
            f"Goal: {request.goal}. Tone: {request.tone}. "
            f"\n\n[Mock Content for {request.platform}]: Based on your transcript, "
            f"we have generated a high-quality draft that adheres to your brand voice: {request.brand_voice or 'Standard'}."
        )
        
        return self._wrap_response(mock_text)

    async def refine_text(self, request: RefineRequest) -> AIResponse:
        mock_text = f"Refined draft: {request.current_text} \n\nApplied adjustment: {request.instruction}"
        return self._wrap_response(mock_text)

    def _wrap_response(self, text: str) -> AIResponse:
        """Helper to create a standard dummy response structure."""
        return AIResponse(
            results=[
                DraftResult(
                    text=text,
                    quality=QualityDetails(
                        qualityScore=round(random.uniform(0.7, 0.99), 2),
                        criteria=[
                            QualityCriteria(id="1", label="Tone Check", status="Pass", description="Matches requested tone."),
                            QualityCriteria(id="2", label="Goal Alignment", status="Pass", description="Meets objectives.")
                        ]
                    )
                )
            ]
        )