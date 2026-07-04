from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    content_type: str = Field(..., min_length=3)
    target_audience: str = Field(..., min_length=3)
    goal: str = Field(..., min_length=5)
    tone: str = Field(default="Professional", min_length=3)
    platform: str = Field(..., min_length=3)
    desired_length: str = Field(..., min_length=3)
    keywords: str | None = None
    brand_voice: str | None = None
    additional_instructions: str | None = None
    metadata: dict[str, str] | None = None
    metadata_include: dict[str, bool] | None = None
    transcript: str = Field(..., min_length=10)
    llm_mode: str | None = None


class RefineRequest(BaseModel):
    current_text: str = Field(..., min_length=10)
    instruction: str = Field(..., min_length=3)
    adjustment_type: str | None = None
    llm_mode: str | None = None
    content_type: str | None = None
    target_audience: str | None = None
    goal: str | None = None
    tone: str | None = None
    platform: str | None = None
    desired_length: str | None = None
    keywords: str | None = None
    brand_voice: str | None = None
    additional_instructions: str | None = None
    metadata: dict[str, str] | None = None
    metadata_include: dict[str, bool] | None = None
    transcript: str | None = None


class QualityCriteria(BaseModel):
    id: str
    label: str
    status: str
    description: str


class QualityDetails(BaseModel):
    qualityScore: float
    ragScore: float | None = None
    criteria: list[QualityCriteria]


class DraftResult(BaseModel):
    text: str
    quality: QualityDetails | None = None


class AIResponse(BaseModel):
    results: list[DraftResult]
    error: str | None = None
