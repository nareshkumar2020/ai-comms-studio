import { useEffect, useState, useMemo } from "react";
import { useDraftContext } from "../context/DraftContext";
import { Button, Card, CardHeader, CardContent, QualityChecks } from "./ui";
// import { validateRagText, type RAGValidationResponse } from "../lib/api";
import { REFINE_STEP_COPY } from "../constants/uiCopy";
import { type DraftQualityCheck } from "../types/qualityChecks";
import { FINALISE_STEP_COPY } from "../constants/uiCopy";
import { useWorkflowNavigation } from "../hooks/useWorkflowNavigation";

interface FinalizeViewProps {
  onRestartWorkflow: () => void;
}

interface CaptureMetadata {
  date?: string;
  title?: string;
  venue?: string;
  authors?: string;
  relatedLinks?: string;
}

interface PersistedDraftRecord {
  storageKey: string;
  content: string;
  metadata: CaptureMetadata | null;
  channel: string;
  tone: string;
  timestamp: number;
}

export function FinalizeView({ onRestartWorkflow }: FinalizeViewProps) {
  const { draftState } = useDraftContext();
  const { navigateToRefine } = useWorkflowNavigation();
  const selectedDraftContent =
    draftState.draftVersions[draftState.selectedDraftIndex] ??
    draftState.sourceTranscript;
  const [persistedDraftRecords, setPersistedDraftRecords] = useState<
    PersistedDraftRecord[]
  >([]);
  // const [ragValidation, setRagValidation] = useState<RAGValidationResponse | null>(null);
  const [isRagValidating, setIsRagValidating] = useState(false);

  useEffect(() => {
    if (!selectedDraftContent) {
      // setRagValidation(null);
    }
  }, [selectedDraftContent]);

  // const handleFactCheck = () => {
  //   if (!selectedDraftContent) return;
  //   setIsRagValidating(true);
  //   validateRagText(selectedDraftContent, 5)
  //     .then(setRagValidation)
  //     .catch(() => setRagValidation(null))
  //     .finally(() => setIsRagValidating(false));
  // };

  // const ragMatchThreshold = 0.45;
  // const ragCheck: DraftQualityCheck = ragValidation
  //   ? ragValidation.loaded
  //     ? ragValidation.best_score >= ragMatchThreshold
  //       ? {
  //           id: 'rag',
  //           status: 'pass',
  //           label: REFINE_STEP_COPY.qualityChecks.ragMatchLabel,
  //           description: REFINE_STEP_COPY.qualityChecks.ragMatchPass,
  //         }
  //       : {
  //           id: 'rag',
  //           status: 'fail',
  //           label: REFINE_STEP_COPY.qualityChecks.ragMatchLabel,
  //           description: REFINE_STEP_COPY.qualityChecks.ragMatchFail,
  //           helperText: REFINE_STEP_COPY.helperText.ragWarning,
  //         }
  //     : {
  //         id: 'rag',
  //         status: 'warning',
  //         label: REFINE_STEP_COPY.qualityChecks.ragMatchLabel,
  //         description: REFINE_STEP_COPY.qualityChecks.ragMatchWarning,
  //         helperText: REFINE_STEP_COPY.helperText.ragWarning,
  //       }
  //   : {
  //       id: 'rag',
  //       status: 'warning',
  //       label: REFINE_STEP_COPY.qualityChecks.ragMatchLabel,
  //       description: REFINE_STEP_COPY.qualityChecks.ragMatchWarning,
  //       helperText: REFINE_STEP_COPY.helperText.ragWarning,
  //     };

  // const currentQuality = draftState.draftQualities[draftState.selectedDraftIndex];
  // const qualityChecks: DraftQualityCheck[] = useMemo(() => {
  //   const checks = currentQuality?.criteria?.map((c: any) => ({
  //     id: c.id,
  //     label: c.label,
  //     status: c.status,
  //     description: c.description,
  //   })) || [];
  //   return [...checks, ragCheck];
  // }, [currentQuality, ragCheck]);

  useEffect(() => {
    const persistedStorageKeys = Object.keys(localStorage).filter(
      (storageKey) =>
        storageKey.startsWith(FINALISE_STEP_COPY.localStorageKeyPrefix),
    );
    const loadedDraftRecords = persistedStorageKeys
      .map((storageKey) => {
        try {
          const storedDraft = JSON.parse(
            localStorage.getItem(storageKey) ?? "{}",
          );
          return {
            storageKey,
            content: storedDraft.content ?? "",
            metadata: storedDraft.metadata ?? null,
            channel: storedDraft.channel ?? "",
            tone: storedDraft.tone ?? "",
            timestamp: storedDraft.timestamp ?? 0,
          } as PersistedDraftRecord;
        } catch {
          return null;
        }
      })
      .filter((record): record is PersistedDraftRecord => record !== null)
      .sort((recordA, recordB) => recordB.timestamp - recordA.timestamp);
    setPersistedDraftRecords(loadedDraftRecords);
  }, []);

  const handleCopyFinalContent = async () => {
    await navigator.clipboard.writeText(selectedDraftContent);
  };

  const handleDownloadFinalContent = () => {
    const markdownBlob = new Blob([selectedDraftContent], {
      type: "text/markdown;charset=utf-8",
    });
    const downloadUrl = URL.createObjectURL(markdownBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = FINALISE_STEP_COPY.downloadFilename;
    downloadLink.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const handlePushDraftToLocalStorage = () => {
    try {
      const persistedDraftPayload = {
        content: selectedDraftContent,
        metadata: draftState.metadata,
        channel: draftState.channel,
        tone: draftState.tone,
        timestamp: Date.now(),
      };
      const storageKey = `${FINALISE_STEP_COPY.localStorageKeyPrefix}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(storageKey, JSON.stringify(persistedDraftPayload));
      setPersistedDraftRecords((currentRecords) => [
        {
          storageKey,
          content: selectedDraftContent,
          metadata: draftState.metadata,
          channel: draftState.channel,
          tone: draftState.tone,
          timestamp: persistedDraftPayload.timestamp,
        },
        ...currentRecords,
      ]);
      alert(FINALISE_STEP_COPY.saveSuccessAlert(storageKey));
    } catch {
      alert(FINALISE_STEP_COPY.saveFailureAlert);
    }
  };

  return (
    <Card>
      <CardHeader
        title={FINALISE_STEP_COPY.cardTitle}
        subtitle={FINALISE_STEP_COPY.cardSubtitle}
      />
      <CardContent>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {FINALISE_STEP_COPY.finalContentSectionTitle}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {FINALISE_STEP_COPY.finalContentSectionDescription}
          </p>
          <div className="mt-4 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 dark:text-slate-300">
              {selectedDraftContent}
            </pre>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyFinalContent}
            >
              {FINALISE_STEP_COPY.copyButtonLabel}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadFinalContent}
            >
              {FINALISE_STEP_COPY.downloadButtonLabel}
            </Button>
          </div>
        </div>

        {/* <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Quality Checks & Fact Checking
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review the latest quality checks and RAG fact-checking results before finalizing.
          </p>
          <div className="mt-4">
            <QualityChecks
              checks={qualityChecks.filter((c: any) => c.id !== 'rag')}
            />
          </div>
          <div className="mt-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleFactCheck}
              isLoading={isRagValidating}
            >
              Run Fact Check
            </Button>
          </div>
          {ragValidation && (
            <div className="mt-4">
              <QualityChecks
                loading={isRagValidating}
                loadingDescription="Validating against loaded RAG content..."
                scoreLabel={REFINE_STEP_COPY.bestScore}
                scoreValue={!isRagValidating && ragValidation?.loaded ? ragValidation.best_score.toFixed(3) : undefined}
                checks={qualityChecks.filter(c => c.id === 'rag')}
              />
            </div>
          )}
        </div> */}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={onRestartWorkflow}>
            {FINALISE_STEP_COPY.startOverButtonLabel}
          </Button>
          <Button variant="secondary" onClick={navigateToRefine}>
            {FINALISE_STEP_COPY.backToRefineButtonLabel}
          </Button>
          <Button className="ml-auto" onClick={handlePushDraftToLocalStorage}>
            {FINALISE_STEP_COPY.pushToCmsButtonLabel}
          </Button>
        </div>
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {FINALISE_STEP_COPY.recentlyPushedSectionTitle}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {FINALISE_STEP_COPY.recentlyPushedSectionDescription}
          </p>
          <div className="mt-4 space-y-3">
            {persistedDraftRecords.map((persistedDraft) => (
              <div
                key={persistedDraft.storageKey}
                className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {new Date(persistedDraft.timestamp).toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {persistedDraft.channel} · {persistedDraft.tone}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
