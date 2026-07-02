from __future__ import annotations

import math
from typing import Iterable

from app.models import (
    Chunk,
    ChunkRequest,
    ChunkResponse,
    EmbedRequest,
    EmbedResponse,
    EmbeddingOutput,
    RAGStatusResponse,
    RAGValidationResponse,
    SearchMatch,
    SearchRequest,
    SearchResponse,
)

_current_rag_chunks: list[Chunk] = []
_current_rag_embeddings: dict[str, list[float]] = {}
_current_rag_source: str = ''


def _embed_text(text: str) -> list[float]:
    vector = [float((ord(c) % 100) / 100.0) for c in text[:64]]
    return _normalize_vector(vector)


def _rag_loaded() -> bool:
    return bool(_current_rag_chunks and _current_rag_embeddings)


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> list[Chunk]:
    if chunk_size <= 0 or overlap < 0 or overlap >= chunk_size:
        raise ValueError('chunk_size must be > 0 and overlap must be between 0 and chunk_size')

    normalized = text.replace('\r\n', '\n').replace('\r', '\n')
    tokens = normalized.split('\n')
    chunks: list[Chunk] = []
    current_text = ''
    start = 0

    for line in tokens:
        next_text = f"{current_text}\n{line}" if current_text else line
        if len(next_text) > chunk_size and current_text:
            end = start + len(current_text)
            chunks.append(Chunk(id=str(len(chunks) + 1), text=current_text.strip(), start=start, end=end))
            start = max(end - overlap, 0)
            current_text = line
        else:
            current_text = next_text

    if current_text:
        end = start + len(current_text)
        chunks.append(Chunk(id=str(len(chunks) + 1), text=current_text.strip(), start=start, end=end))

    return chunks


def _dot(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


def _magnitude(vector: list[float]) -> float:
    return math.sqrt(sum(x * x for x in vector))


def cosine_similarity(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    denom = _magnitude(a) * _magnitude(b)
    if denom == 0:
        return 0.0
    return _dot(a, b) / denom


def _embed_query(query: str) -> list[float]:
    vector = [float((ord(c) % 100) / 100.0) for c in query[:64]]
    return _normalize_vector(vector)


def search_similar_chunks(request: SearchRequest) -> SearchResponse:
    if not request.embeddings or not request.chunks:
        return SearchResponse(matches=[])

    query_vector = _embed_query(request.query)
    matches: list[SearchMatch] = []
    chunk_map = {chunk.id: chunk for chunk in request.chunks}

    for embedding in request.embeddings:
        chunk = chunk_map.get(embedding.id)
        if not chunk:
            continue
        score = cosine_similarity(embedding.embedding, query_vector)
        matches.append(SearchMatch(id=chunk.id, text=chunk.text, score=score))

    matches.sort(key=lambda match: match.score, reverse=True)
    return SearchResponse(matches=matches[: request.top_k])


def embed_chunks(request: EmbedRequest) -> EmbedResponse:
    embeddings: list[EmbeddingOutput] = []
    for chunk in request.chunks:
        vector = [float((ord(c) % 100) / 100.0) for c in chunk.text[:64]]
        normalized = _normalize_vector(vector)
        embeddings.append(EmbeddingOutput(id=chunk.id, embedding=normalized))
    return EmbedResponse(embeddings=embeddings)


def feed_rag_text(text: str, chunk_size: int = 500, overlap: int = 100) -> RAGStatusResponse:
    global _current_rag_chunks, _current_rag_embeddings, _current_rag_source

    _current_rag_chunks = chunk_text(text, chunk_size=chunk_size, overlap=overlap)
    _current_rag_source = text[:1000].strip()
    _current_rag_embeddings = {
        chunk.id: _embed_text(chunk.text)
        for chunk in _current_rag_chunks
    }

    return RAGStatusResponse(
        loaded=True,
        chunk_count=len(_current_rag_chunks),
        embedding_count=len(_current_rag_embeddings),
        text_summary=_current_rag_source,
    )


def get_rag_status() -> RAGStatusResponse:
    return RAGStatusResponse(
        loaded=_rag_loaded(),
        chunk_count=len(_current_rag_chunks),
        embedding_count=len(_current_rag_embeddings),
        text_summary=_current_rag_source or None,
    )


def clear_rag_state() -> RAGStatusResponse:
    global _current_rag_chunks, _current_rag_embeddings, _current_rag_source
    _current_rag_chunks = []
    _current_rag_embeddings = {}
    _current_rag_source = ''
    return get_rag_status()


def validate_rag_text(text: str, top_k: int = 5) -> RAGValidationResponse:
    if not _rag_loaded():
        return RAGValidationResponse(loaded=False, best_score=0.0, matches=[])

    query_vector = _embed_query(text)
    matches: list[SearchMatch] = []
    for chunk in _current_rag_chunks:
        embedding = _current_rag_embeddings.get(chunk.id)
        if embedding is None:
            continue
        score = cosine_similarity(embedding, query_vector)
        matches.append(SearchMatch(id=chunk.id, text=chunk.text, score=score))

    matches.sort(key=lambda match: match.score, reverse=True)
    best_score = matches[0].score if matches else 0.0
    return RAGValidationResponse(loaded=True, best_score=best_score, matches=matches[:top_k])


def _normalize_vector(vector: list[float]) -> list[float]:
    mag = _magnitude(vector)
    if mag == 0:
        return [0.0] * len(vector)
    return [value / mag for value in vector]
