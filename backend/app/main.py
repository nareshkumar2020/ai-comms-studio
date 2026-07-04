import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.models import (
    AIResponse,
    GenerateRequest,
    RefineRequest,
)
from app.services.mock_service import MockLLMService
from app.services.openai_service import OpenAIService

for env_path in [
    Path(__file__).resolve().parents[1] / '.env',
    Path(__file__).resolve().parents[1] / '.env.local',
    Path(__file__).resolve().parents[2] / '.env',
    Path(__file__).resolve().parents[2] / '.env.local',
]:
    load_dotenv(dotenv_path=env_path, override=False)

app = FastAPI(title='Draft Studio API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


def get_llm_provider(llm_mode: str | None = None):
    if llm_mode and llm_mode.lower() == 'live':
        return OpenAIService()
    return MockLLMService()


@app.get('/health')
async def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.post('/api/generate', response_model=AIResponse)
async def generate(inputs: GenerateRequest) -> AIResponse:
    try:
        provider = get_llm_provider(inputs.llm_mode)
        return await provider.generate_draft(inputs)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

@app.post('/api/upload')
async def upload_file(file: UploadFile = File(...)) -> dict:
    """Accept a file upload and return extracted text.

    This endpoint will attempt to extract text from .txt, .pdf, and .docx files.
    When extraction libraries are not available, a local stub will be used.
    """
    filename = file.filename or 'upload'
    content = b''
    try:
        content = await file.read()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f'Failed to read upload: {exc}')

    # Try simple .txt
    if filename.lower().endswith('.txt'):
        try:
            text = content.decode('utf-8')
            return {'text': text}
        except Exception:
            pass

    # Try PDF extraction if PyPDF2 is available
    if filename.lower().endswith('.pdf'):
        try:
            import io
            from PyPDF2 import PdfReader

            reader = PdfReader(io.BytesIO(content))
            pages = [p.extract_text() or '' for p in reader.pages]
            return {'text': '\n\n'.join(pages)}
        except Exception:
            # fallback to stub
            return {'text': f'(stub) Extracted text from {filename} not available — please enable PyPDF2.'}

    # Try docx extraction if python-docx is available
    if filename.lower().endswith('.docx'):
        try:
            import io
            from docx import Document

            doc = Document(io.BytesIO(content))
            paragraphs = [p.text for p in doc.paragraphs]
            return {'text': '\n\n'.join(paragraphs)}
        except Exception:
            return {'text': f'(stub) Extracted text from {filename} not available — please enable python-docx.'}

    # Generic stub for unknown types
    return {'text': f'(stub) Could not extract text from {filename}. Please provide a .txt, .pdf or .docx file.'}


@app.post('/api/refine', response_model=AIResponse)
async def refine(payload: RefineRequest) -> AIResponse:
    try:
        provider = get_llm_provider(payload.llm_mode)
        return await provider.refine_text(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

# Serve static files from the frontend build if it exists
# We use a path resolution that works when running from Docker (where it might be at /app/frontend/dist)
# or locally (where it might be at ../frontend/dist)
frontend_dist_path = os.getenv("FRONTEND_DIST_PATH", str(Path(__file__).resolve().parents[2] / 'frontend' / 'dist'))

if os.path.exists(frontend_dist_path):
    app.mount("/ai-comms-studio/assets", StaticFiles(directory=os.path.join(frontend_dist_path, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Allow serving explicitly named static files (e.g. /mock_data.md, /favicon.ico)
        file_path = os.path.join(frontend_dist_path, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # Fallback to index.html for React router
        index_path = os.path.join(frontend_dist_path, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        
        raise HTTPException(status_code=404, detail="Frontend build not found")
