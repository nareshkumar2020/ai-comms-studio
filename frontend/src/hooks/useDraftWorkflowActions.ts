import { useDraftContext } from '../context/DraftContext';
import { generateDraft, refineText, type DraftPayload } from '../lib/api';
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
      const rawDraftVersions = response.results ? response.results.map(r => r.text) : [];
      setDraftVersions(normalizeToDraftVariantCount(rawDraftVersions, capturePayload.transcript));
      setSourceTranscript(capturePayload.transcript);
      setSelectedDraftIndex(0);
      

      
      const qualities: Record<number, any> = {};
      if (response.results) {
        response.results.forEach((draftResult, index) => {
          if (draftResult.quality) {
            qualities[index] = draftResult.quality;
          }
        });
      }

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
      const regeneratedDraftText = response.results?.[0]?.text;
      if (regeneratedDraftText) {
        const updatedDraftVersions = [...draftState.draftVersions];
        updatedDraftVersions[selectedDraftIndex] = regeneratedDraftText;
        setDraftVersionsPreserveSelection(updatedDraftVersions, selectedDraftIndex);
        
        const newQualities = { ...draftState.draftQualities };
        if (response.results?.[0]?.quality) {
          newQualities[selectedDraftIndex] = response.results[0].quality;
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
