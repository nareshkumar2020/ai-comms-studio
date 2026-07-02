import { useDraftContext } from '../context/DraftContext';
import { generateDraft, refineText, validateRagText, type DraftPayload } from '../lib/api';
import { APP_ERROR_COPY, DRAFT_VARIANT_COUNT } from '../constants/uiCopy';
import { useWorkflowNavigation } from './useWorkflowNavigation';

function normalizeToDraftVariantCount(draftVersions: string[], fallbackTranscript: string): string[] {
  const normalizedVersions = draftVersions.length ? [...draftVersions] : fallbackTranscript ? [fallbackTranscript] : [];
  while (normalizedVersions.length < DRAFT_VARIANT_COUNT) {
    normalizedVersions.push(normalizedVersions[normalizedVersions.length - 1] ?? fallbackTranscript);
  }
  return normalizedVersions.slice(0, DRAFT_VARIANT_COUNT);
}

export function useDraftWorkflowActions() {
  const {
    draftState,
    setDraftVersions,
    setDraftVersionsPreserveSelection,
    setSourceTranscript,
    setError,
    setLoading,
    setSelectedDraftIndex,
    resetDraftWorkflow,
    updateCaptureInput,
    setDraftQualities,
    setLastGeneratedPayload,
  } = useDraftContext();
  const { navigateToRefine } = useWorkflowNavigation();

  const handleGenerateDraftsFromCapture = async (capturePayload: DraftPayload) => {
    const isDirty = JSON.stringify(capturePayload) !== JSON.stringify(draftState.lastGeneratedPayload);

    if (!isDirty && draftState.draftVersions.length > 0) {
      navigateToRefine();
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await generateDraft({
        ...capturePayload,
        metadataInclude: draftState.metadataInclude,
        llmMode: draftState.llmMode,
      });
      const rawDraftVersions =
        response.drafts && response.drafts.length ? response.drafts : response.text ? [response.text] : [];
      setDraftVersions(normalizeToDraftVariantCount(rawDraftVersions, capturePayload.transcript));
      setSourceTranscript(capturePayload.transcript);
      setSelectedDraftIndex(0);
      
      if (response.key_points && response.key_points.length) {
        updateCaptureInput('keyPoints', response.key_points.join(', '));
      }
      
      const qualities: Record<number, any> = {};
      if (response.quality && response.quality.drafts) {
        response.quality.drafts.forEach((draftObj: any, index: number) => {
          qualities[index] = draftObj.quality;
        });
      }

      const normalizedVersions = normalizeToDraftVariantCount(rawDraftVersions, capturePayload.transcript);
      const ragResults = await Promise.all(
        normalizedVersions.map((draftText) => validateRagText(draftText).catch(() => null))
      );

      ragResults.forEach((ragRes, index) => {
        if (ragRes && ragRes.loaded) {
          if (!qualities[index]) qualities[index] = {};
          qualities[index].ragScore = ragRes.best_score;
        }
      });

      setDraftQualities(qualities);
      setLastGeneratedPayload(capturePayload);
      
      navigateToRefine();
    } catch (error) {
      setError(error instanceof Error ? error.message : APP_ERROR_COPY.draftGenerationFailed);
    } finally {
      setLoading(false);
    }
  };


  const handleRegenerateSelectedDraft = async (refinementInstruction: string, adjustmentType: string) => {
    setError(null);
    setLoading(true);

    try {
      const selectedDraftIndex = draftState.selectedDraftIndex;
      const selectedDraftText = draftState.draftVersions[selectedDraftIndex] || draftState.sourceTranscript;
      const capturePayload: DraftPayload = {
        transcript: draftState.sourceTranscript,
        channel: draftState.channel,
        tone: draftState.tone,
        targetAudience: draftState.targetAudience,
        goal: draftState.goal,
        desiredLength: draftState.desiredLength,
        keywords: draftState.keywords,
        brandVoice: draftState.brandVoice,
        additionalInstructions: draftState.additionalInstructions,
        metadata: draftState.metadata,
        metadataInclude: draftState.metadataInclude,
      };

      const response = await refineText(selectedDraftText, refinementInstruction, capturePayload, adjustmentType, draftState.llmMode);
      const regeneratedDraftText = response.text ?? response.drafts?.[0];
      if (regeneratedDraftText) {
        const updatedDraftVersions = [...draftState.draftVersions];
        updatedDraftVersions[selectedDraftIndex] = regeneratedDraftText;
        setDraftVersionsPreserveSelection(updatedDraftVersions, selectedDraftIndex);
        
        const newQualities = { ...draftState.draftQualities };
        if (response.quality && response.quality.drafts && response.quality.drafts.length > 0) {
          newQualities[selectedDraftIndex] = response.quality.drafts[0].quality;
        }

        const ragRes = await validateRagText(regeneratedDraftText).catch(() => null);
        if (ragRes && ragRes.loaded) {
          if (!newQualities[selectedDraftIndex]) newQualities[selectedDraftIndex] = {};
          newQualities[selectedDraftIndex].ragScore = ragRes.best_score;
        }

        setDraftQualities(newQualities);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : APP_ERROR_COPY.draftRegenerationFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDraftWorkflow = () => {
    resetDraftWorkflow();
  };

  return {
    handleGenerateDraftsFromCapture,
    handleRegenerateSelectedDraft,
    handleResetDraftWorkflow,
  };
}
