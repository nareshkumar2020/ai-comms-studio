import { useState, useMemo } from 'react';
import { useDraftContext } from '../context/DraftContext';
import { Button, Textarea, Card, CardHeader, CardContent, QualityChecks } from './ui';
import {
  ADJUSTMENT_INSTRUCTION_BY_TYPE,
  ADJUSTMENT_TYPE_OPTIONS,
  DRAFT_VARIANT_COUNT,
  REFINE_STEP_COPY,
} from '../constants/uiCopy';
import { useWorkflowNavigation } from '../hooks/useWorkflowNavigation';
import { type DraftQualityCheck } from '../types/qualityChecks';

interface RefinementEditorProps {
  onRegenerateDraft: (refinementInstruction: string, adjustmentType: string) => Promise<void>;
}

function normalizeDraftVersions(draftVersions: string[], fallbackTranscript: string): string[] {
  const normalizedVersions = draftVersions.length ? [...draftVersions] : [fallbackTranscript];
  while (normalizedVersions.length < DRAFT_VARIANT_COUNT) {
    normalizedVersions.push(normalizedVersions[normalizedVersions.length - 1] ?? fallbackTranscript);
  }
  return normalizedVersions.slice(0, DRAFT_VARIANT_COUNT);
}

export function RefinementEditor({ onRegenerateDraft }: RefinementEditorProps) {
  const {
    draftState,
    setDraftVersionsPreserveSelection,
    setSelectedDraftIndex,
  } = useDraftContext();
  const { navigateToCapture, navigateToFinalise } = useWorkflowNavigation();
  const [selectedAdjustmentType, setSelectedAdjustmentType] = useState('tone');
  const selectedDraftIndex = draftState.selectedDraftIndex;
  const normalizedDraftVersions = normalizeDraftVersions(
    draftState.draftVersions,
    draftState.sourceTranscript,
  );

  const handleDraftTextChange = (updatedDraftText: string) => {
    const updatedDraftVersions = [...normalizedDraftVersions];
    updatedDraftVersions[selectedDraftIndex] = updatedDraftText;
    setDraftVersionsPreserveSelection(updatedDraftVersions, selectedDraftIndex);
  };

  const handleRegenerateDraft = () => {
    const refinementInstruction = ADJUSTMENT_INSTRUCTION_BY_TYPE[selectedAdjustmentType];
    onRegenerateDraft(refinementInstruction, selectedAdjustmentType);
  };

  const currentQuality = draftState.draftQualities[selectedDraftIndex];
  const qualityChecks: DraftQualityCheck[] = useMemo(() => {
    if (!currentQuality || !currentQuality.criteria) {
      return [];
    }
    return currentQuality.criteria.map((c: any) => ({
      id: c.id,
      label: c.label,
      status: c.status,
      description: c.description,
    }));
  }, [currentQuality]);


  return (
    <Card>
      <CardHeader
        title={REFINE_STEP_COPY.cardTitle}
        subtitle={REFINE_STEP_COPY.cardSubtitle}
      />
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {REFINE_STEP_COPY.draftVersionsSectionTitle}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {REFINE_STEP_COPY.draftVersionsSectionDescription}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {normalizedDraftVersions.map((_, draftIndex) => (
                    <button
                      key={draftIndex}
                      type="button"
                      onClick={() => setSelectedDraftIndex(draftIndex)}
                      className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        draftIndex === selectedDraftIndex
                          ? 'border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      Draft {draftIndex + 1}
                      {draftIndex === 0 && (
                        <span className="ml-1.5 text-xs font-normal opacity-70">
                          {REFINE_STEP_COPY.draftTabDefaultSuffix}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {/* {normalizedDraftVersions[selectedDraftIndex] && (
                  <p className="mt-3 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {normalizedDraftVersions[selectedDraftIndex].slice(0, DRAFT_PREVIEW_TRUNCATE_LENGTH)}
                    {normalizedDraftVersions[selectedDraftIndex].length > DRAFT_PREVIEW_TRUNCATE_LENGTH ? '…' : ''}
                  </p>
                )} */}
              </section>

              <section>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {REFINE_STEP_COPY.editDraftSectionTitle}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {REFINE_STEP_COPY.editDraftSectionDescription(selectedDraftIndex + 1)}
                </p>
                <div className="mt-4">
                  <Textarea
                    value={normalizedDraftVersions[selectedDraftIndex] || ''}
                    onChange={(changeEvent) => handleDraftTextChange(changeEvent.target.value)}
                    rows={8}
                    placeholder={REFINE_STEP_COPY.draftTextareaPlaceholder}
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {ADJUSTMENT_TYPE_OPTIONS.map((adjustmentTypeOption) => (
                    <button
                      key={adjustmentTypeOption.id}
                      type="button"
                      onClick={() => setSelectedAdjustmentType(adjustmentTypeOption.id)}
                      className={`group rounded-lg border-2 p-3 text-center transition-all duration-200 ${
                        selectedAdjustmentType === adjustmentTypeOption.id
                          ? 'border-primary-600 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/30'
                          : 'border-slate-200 hover:border-primary-600 hover:bg-primary-50 dark:border-slate-700 dark:hover:border-primary-500 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div
                        className={`text-sm font-semibold ${
                          selectedAdjustmentType === adjustmentTypeOption.id
                            ? 'text-primary-700 dark:text-primary-300'
                            : 'text-slate-900 group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400'
                        }`}
                      >
                        {adjustmentTypeOption.label}
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 dark:group-hover:text-slate-300">
                        {adjustmentTypeOption.description}
                      </p>
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <Button
                    onClick={handleRegenerateDraft}
                    isLoading={draftState.isLoading}
                    disabled={!selectedAdjustmentType}
                  >
                    {REFINE_STEP_COPY.regenerateDraftButtonLabel(selectedDraftIndex + 1)}
                  </Button>
                </div>
              </section>
            </div>

            <section>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {REFINE_STEP_COPY.qualityChecksSectionTitle}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {REFINE_STEP_COPY.qualityChecksSectionDescription}
              </p>
              
              <div className="mt-4 mb-4 grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Quality Score</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                    {currentQuality?.qualityScore != null ? ((currentQuality.qualityScore / 100) * 100).toFixed(0) + '%' : 'N/A'}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Context Match Score</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                    {currentQuality?.ragScore != null ? `${(currentQuality.ragScore * 100).toFixed(0)}%` : 'N/A'}
                  </p>
                </div>
              </div>

              <QualityChecks
                loading={draftState.isLoading}
                loadingDescription="Evaluating quality criteria..."
                checks={qualityChecks}
              />
            </section>
          </div>

          <section className="mt-20 flex flex-wrap gap-3">
            <br>
            </br>
            <br>
            </br>
            <Button variant="secondary" onClick={navigateToCapture}>
              {REFINE_STEP_COPY.backToCaptureButtonLabel}
            </Button>
            <Button onClick={navigateToFinalise}>
              {REFINE_STEP_COPY.reviewFinalButtonLabel}
            </Button>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
