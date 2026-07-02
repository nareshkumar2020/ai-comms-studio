import { useEffect, useState } from 'react';
import { Button, Card, CardHeader, CardContent, Input, Textarea } from '../components/ui';
import { clearRagState, feedRagText, fetchRagStatus, uploadFile } from '../lib/api';
import { useDraftContext } from '../context/DraftContext';

interface RAGStatus {
  loaded: boolean;
  chunk_count: number;
  embedding_count: number;
  text_summary?: string | null;
}

export function FeedAIPage() {
  const { setError } = useDraftContext();
  const [ragStatus, setRagStatus] = useState<RAGStatus | null>(null);
  const [sourceText, setSourceText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatusMessage, setUploadStatusMessage] = useState('');

  const loadRagStatus = async () => {
    try {
      const response = await fetchRagStatus();
      setRagStatus(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  useEffect(() => {
    loadRagStatus();
  }, []);

  const handleSubmitFeed = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await feedRagText(sourceText, 500, 100);
      setRagStatus(response);
      setUploadStatusMessage('RAG content loaded successfully.');
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearRag = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await clearRagState();
      setRagStatus(response);
      setUploadStatusMessage('RAG state cleared.');
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadedFile = async (selectedFile: File | null) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('text') && !selectedFile.name.match(/\.txt$|\.pdf$|\.docx$/i)) {
      setError('Upload only .txt, .pdf or .docx files for RAG feed.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    setUploadStatusMessage('Extracting file for RAG ingestion...');
    setIsLoading(true);

    try {
      const extractionResult = await uploadFile(selectedFile);
      setSourceText(extractionResult.text);
      setUploadStatusMessage('File extracted successfully. Ready to feed RAG.');
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm dark:shadow-slate-900/30">
      <div className="space-y-6">
        <Card>
          <CardHeader title="Feed data" subtitle="Upload documents or paste text to build the RAG data set." />
          <CardContent>
            <div className="space-y-4">
              <Textarea
                rows={10}
                value={sourceText}
                onChange={(event) => setSourceText(event.target.value)}
                placeholder="Paste transcript content or document text here..."
              />

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Upload document
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Upload a file to extract text and feed the RAG service.
                </p>
                <div className="mt-4 space-y-4">
                  <input
                    type="file"
                    accept=".txt,.pdf,.docx"
                    onChange={(event) => handleUploadedFile(event.target.files?.[0] ?? null)}
                  />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Drop a supported file or paste text above to include it in the RAG index.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Button onClick={handleSubmitFeed} isLoading={isLoading}>
                  Feed RAG
                </Button>
                {/* <Button variant="secondary" onClick={handleClearRag} isLoading={isLoading}>
                  Clear RAG
                </Button> */}
              </div>

              {uploadStatusMessage && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{uploadStatusMessage}</p>
              )}

              <div className="grid gap-4 md:grid-cols-2 pt-4">
                <Input
                  label="Loaded"
                  value={ragStatus?.loaded ? 'Yes' : 'No'}
                  readOnly
                />
                <Input
                  label="Chunks"
                  value={ragStatus?.chunk_count.toString() ?? '0'}
                  readOnly
                />
                <Input
                  label="Embeddings"
                  value={ragStatus?.embedding_count.toString() ?? '0'}
                  readOnly
                />
              </div>

              {ragStatus?.text_summary && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">RAG source preview</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                    {ragStatus.text_summary}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
