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


class Chunk(BaseModel):
    id: str
    text: str
    start: int
    end: int


class ChunkRequest(BaseModel):
    text: str = Field(..., min_length=1)
    chunk_size: int = Field(500, gt=0)
    overlap: int = Field(100, ge=0)


class ChunkResponse(BaseModel):
    chunks: list[Chunk]


class EmbeddingItem(BaseModel):
    id: str
    text: str


class EmbedRequest(BaseModel):
    chunks: list[EmbeddingItem]


class EmbeddingOutput(BaseModel):
    id: str
    embedding: list[float]


class EmbedResponse(BaseModel):
    embeddings: list[EmbeddingOutput]


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    embeddings: list[EmbeddingOutput]
    chunks: list[Chunk]
    top_k: int = Field(5, ge=1)


class SearchMatch(BaseModel):
    id: str
    text: str
    score: float


class SearchResponse(BaseModel):
    matches: list[SearchMatch]


class RAGFeedRequest(BaseModel):
    text: str = Field(..., min_length=1)
    chunk_size: int = Field(500, gt=0)
    overlap: int = Field(100, ge=0)


class RAGStatusResponse(BaseModel):
    loaded: bool
    chunk_count: int
    embedding_count: int
    text_summary: str | None = None


class RAGValidationRequest(BaseModel):
    text: str = Field(..., min_length=1)
    top_k: int = Field(5, ge=1)


class RAGValidationResponse(BaseModel):
    loaded: bool
    best_score: float
    matches: list[SearchMatch]


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


class AIResponse(BaseModel):
    text: str | None = None
    drafts: list[str] | None = None
    key_points: list[str] | None = None
    error: str | None = None
    quality: dict | None = None
    rag_matches: list[SearchMatch] | None = None

