export interface DraftPayload {
  transcript: string;
  channel: string;
  tone: string;
  targetAudience: string;
  goal: string;
  desiredLength: string;
  keywords?: string;
  brandVoice?: string;
  additionalInstructions?: string;
  metadata?: {
    date?: string;
    title?: string;
    venue?: string;
    authors?: string;
    relatedLinks?: string;
  };
  metadataInclude?: {
    date?: boolean;
    title?: boolean;
    venue?: boolean;
    authors?: boolean;
    relatedLinks?: boolean;
  };
}

export interface AIResponse {
  text?: string;
  drafts?: string[];
  key_points?: string[];
  error?: string | null;
  quality?: any;
}

export interface RAGStatusResponse {
  loaded: boolean;
  chunk_count: number;
  embedding_count: number;
  text_summary?: string | null;
}

export interface RAGValidationResponse {
  loaded: boolean;
  best_score: number;
  matches: Array<{
    id: string;
    text: string;
    score: number;
  }>;
}


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request<T>(path: string, payload: any) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || 'Request failed');
  }

  return (await response.json()) as T;
}

export async function generateDraft(payload: DraftPayload & { llmMode?: string }) {
  return request<AIResponse>('/api/generate', {
    content_type: payload.channel,
    target_audience: payload.targetAudience,
    goal: payload.goal,
    tone: payload.tone,
    platform: payload.metadata?.venue || payload.channel,
    desired_length: payload.desiredLength,
    keywords: payload.keywords,
    brand_voice: payload.brandVoice,
    additional_instructions: payload.additionalInstructions,
    transcript: payload.transcript,
    metadata: payload.metadata,
    metadata_include: payload.metadataInclude,
    llm_mode: payload.llmMode,
  });
}

export async function refineText(
  currentText: string,
  instruction: string,
  payload: DraftPayload,
  adjustmentType?: string,
  llmMode?: string,
) {
  return request<AIResponse>('/api/refine', {
    current_text: currentText,
    instruction,
    adjustment_type: adjustmentType,
    llm_mode: llmMode,
    content_type: payload.channel,
    target_audience: payload.targetAudience,
    goal: payload.goal,
    tone: payload.tone,
    platform: payload.metadata?.venue || payload.channel,
    desired_length: payload.desiredLength,
    keywords: payload.keywords,
    brand_voice: payload.brandVoice,
    additional_instructions: payload.additionalInstructions,
    transcript: payload.transcript,
    metadata: payload.metadata,
    metadata_include: payload.metadataInclude,
  });
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || 'Upload failed');
  }

  return (await response.json()) as { text: string };
}

export async function fetchRagStatus() {
  const response = await fetch(`${API_BASE_URL}/api/rag/status`);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || 'Request failed');
  }
  return (await response.json()) as RAGStatusResponse;
}

export async function feedRagText(text: string, chunkSize = 500, overlap = 100) {
  return request<RAGStatusResponse>('/api/rag/feed', {
    text,
    chunk_size: chunkSize,
    overlap,
  });
}

export async function clearRagState() {
  return request<RAGStatusResponse>('/api/rag/clear', {});
}

export async function validateRagText(text: string, topK = 5) {
  return request<RAGValidationResponse>('/api/rag/validate', {
    text,
    top_k: topK,
  });
}
