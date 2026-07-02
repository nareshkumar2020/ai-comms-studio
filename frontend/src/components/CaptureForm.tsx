import { useRef, useState } from "react";
import { useDraftContext } from "../context/DraftContext";
import { Button, Input, Textarea, Card, CardHeader, CardContent } from "./ui";
import { uploadFile, type DraftPayload } from "../lib/api";
import {
  CAPTURE_LIMITS,
  CAPTURE_STEP_COPY,
  CHANNEL_OPTIONS,
  TONE_OPTIONS,
  METADATA_SELECTION_OPTIONS,
} from "../constants/uiCopy";

interface CaptureFormProps {
  onSubmitCapture: (capturePayload: DraftPayload) => Promise<void>;
}

const ALLOWED_UPLOAD_MIME_TYPES = [
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export function CaptureForm({ onSubmitCapture }: CaptureFormProps) {
  const {
    draftState,
    setSourceTranscript,
    updateCaptureInput,
    setCaptureMetadata,
    updateMetadataInclude,
    setUploadedFileInfo,
  } = useDraftContext();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [uploadStatusMessage, setUploadStatusMessage] = useState("");
  const [isExtractingUpload, setIsExtractingUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function validateCaptureForm() {
    const nextValidationErrors: Record<string, string> = {};
    const hasContent = (draftState.sourceTranscript && draftState.sourceTranscript.trim().length > 0) || !!draftState.uploadedFile;
    if (!hasContent) {
      nextValidationErrors.transcript =
        CAPTURE_STEP_COPY.validation.transcriptRequired;
    }
    if (!draftState.channel) {
      nextValidationErrors.channel =
        CAPTURE_STEP_COPY.validation.channelRequired;
    }
    if (!draftState.tone) {
      nextValidationErrors.tone = CAPTURE_STEP_COPY.validation.toneRequired;
    }
    if (!draftState.targetAudience) {
      nextValidationErrors.targetAudience =
        CAPTURE_STEP_COPY.validation.targetAudienceRequired;
    }
    if (!draftState.goal) {
      nextValidationErrors.goal = CAPTURE_STEP_COPY.validation.goalRequired;
    }
    if (!draftState.desiredLength) {
      nextValidationErrors.desiredLength =
        CAPTURE_STEP_COPY.validation.desiredLengthRequired;
    }
    
    METADATA_SELECTION_OPTIONS.forEach((option) => {
      const fieldId = option.id as keyof typeof draftState.metadataInclude;
      if (draftState.metadataInclude[fieldId]) {
        const val = draftState.metadata[fieldId];
        if (!val || val.trim().length === 0) {
          nextValidationErrors[fieldId] = `Please provide a value for ${option.label.toLowerCase()}`;
        }
      }
    });

    setValidationErrors(nextValidationErrors);
    return Object.keys(nextValidationErrors).length === 0;
  }

  const handleUploadedFile = (selectedFile: File | null) => {
    if (!selectedFile) return;

    const isAllowedFileType =
      ALLOWED_UPLOAD_MIME_TYPES.includes(
        selectedFile.type as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number],
      ) || Boolean(selectedFile.name.match(/\.txt$|\.pdf$|\.docx$/i));

    if (!isAllowedFileType) {
      setValidationErrors((currentErrors) => ({
        ...currentErrors,
        file: CAPTURE_STEP_COPY.validation.unsupportedFileType,
      }));
      return;
    }

    if (selectedFile.size > CAPTURE_LIMITS.maxUploadBytes) {
      setValidationErrors((currentErrors) => ({
        ...currentErrors,
        file: CAPTURE_STEP_COPY.validation.fileTooLarge,
      }));
      return;
    }

    if (
      selectedFile.type === "text/plain" ||
      selectedFile.name.match(/\.txt$/i)
    ) {
      const textFileReader = new FileReader();
      textFileReader.onload = () => {
        setUploadedFileInfo({
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          content: String(textFileReader.result || ""),
        });
      };
      textFileReader.readAsText(selectedFile, "utf-8");
      setUploadStatusMessage("");
      return;
    }

    setUploadStatusMessage(CAPTURE_STEP_COPY.upload.extracting);
    setIsExtractingUpload(true);
    uploadFile(selectedFile)
      .then((extractionResult) => {
        setUploadedFileInfo({
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          content: extractionResult.text,
        });
        setUploadStatusMessage(CAPTURE_STEP_COPY.upload.success);
        setValidationErrors((currentErrors) => {
          const nextErrors = { ...currentErrors };
          delete nextErrors.file;
          return nextErrors;
        });
      })
      .catch((uploadError) => {
        setValidationErrors((currentErrors) => ({
          ...currentErrors,
          file: String(uploadError.message || uploadError),
        }));
        setUploadStatusMessage("");
      })
      .finally(() => setIsExtractingUpload(false));
  };

  const clearUploadedFile = () => {
    setUploadedFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragDrop: React.DragEventHandler = (dragEvent) => {
    dragEvent.preventDefault();
    handleUploadedFile(dragEvent.dataTransfer.files[0] ?? null);
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleSubmitCapture = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();
    if (!validateCaptureForm()) return;
    setValidationErrors({});

    const combinedTranscript = [
      draftState.sourceTranscript,
      draftState.uploadedFile?.content
    ].filter(Boolean).join("\n\n---\n\n");

    await onSubmitCapture({
      transcript: combinedTranscript,
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
    });
  };

  return (
    <form onSubmit={handleSubmitCapture} className="space-y-6">
      <Card>
        <CardHeader
          title={CAPTURE_STEP_COPY.cardTitle}
          subtitle={CAPTURE_STEP_COPY.cardSubtitle}
        />
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                {CAPTURE_STEP_COPY.targetChannelLabel}
              </label>
              <select
                value={draftState.channel}
                onChange={(changeEvent) =>
                  updateCaptureInput("channel", changeEvent.target.value)
                }
                className="w-full rounded-lg border px-4 py-2.5 text-base text-slate-900 border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="">
                  {CAPTURE_STEP_COPY.targetChannelPlaceholder}
                </option>
                {CHANNEL_OPTIONS.map((channelOption) => (
                  <option key={channelOption} value={channelOption}>
                    {channelOption}
                  </option>
                ))}
              </select>
              {validationErrors.channel && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.channel}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                {CAPTURE_STEP_COPY.toneLabel}
              </label>
              <select
                value={draftState.tone}
                onChange={(changeEvent) =>
                  updateCaptureInput("tone", changeEvent.target.value)
                }
                className="w-full rounded-lg border px-4 py-2.5 text-base text-slate-900 border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="">{CAPTURE_STEP_COPY.tonePlaceholder}</option>
                {TONE_OPTIONS.map((toneOption) => (
                  <option key={toneOption} value={toneOption}>
                    {toneOption}
                  </option>
                ))}
              </select>
              {validationErrors.tone && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.tone}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div>
              <Input
                label={CAPTURE_STEP_COPY.targetAudienceLabel}
                placeholder={CAPTURE_STEP_COPY.targetAudiencePlaceholder}
                value={draftState.targetAudience}
                onChange={(changeEvent) =>
                  updateCaptureInput("targetAudience", changeEvent.target.value)
                }
              />
              {validationErrors.targetAudience && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.targetAudience}
                </p>
              )}
            </div>
            <div>
              <Input
                label={CAPTURE_STEP_COPY.goalLabel}
                placeholder={CAPTURE_STEP_COPY.goalPlaceholder}
                value={draftState.goal}
                onChange={(changeEvent) =>
                  updateCaptureInput("goal", changeEvent.target.value)
                }
              />
              {validationErrors.goal && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.goal}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div>
              <Input
                label={CAPTURE_STEP_COPY.desiredLengthLabel}
                placeholder={CAPTURE_STEP_COPY.desiredLengthPlaceholder}
                value={draftState.desiredLength}
                onChange={(changeEvent) =>
                  updateCaptureInput("desiredLength", changeEvent.target.value)
                }
              />
              {validationErrors.desiredLength && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.desiredLength}
                </p>
              )}
            </div>
            <Input
              label={CAPTURE_STEP_COPY.keywordsLabel}
              placeholder={CAPTURE_STEP_COPY.keywordsPlaceholder}
              value={draftState.keywords}
              onChange={(changeEvent) =>
                updateCaptureInput("keywords", changeEvent.target.value)
              }
            />
          </div>

          <div className="mb-6">
            <Input
              label={CAPTURE_STEP_COPY.brandVoiceLabel}
              placeholder={CAPTURE_STEP_COPY.brandVoicePlaceholder}
              value={draftState.brandVoice}
              onChange={(changeEvent) =>
                updateCaptureInput("brandVoice", changeEvent.target.value)
              }
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              {CAPTURE_STEP_COPY.additionalInstructionsLabel}
            </label>
            <Textarea
              value={draftState.additionalInstructions}
              onChange={(changeEvent) =>
                updateCaptureInput(
                  "additionalInstructions",
                  changeEvent.target.value,
                )
              }
              rows={4}
              placeholder={CAPTURE_STEP_COPY.additionalInstructionsPlaceholder}
            />
          </div>

          <div
            onDragOver={(dragEvent) => dragEvent.preventDefault()}
            onDrop={handleDragDrop}
            className="rounded-2xl border-2 border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-200"
          >
            <div className="mb-4">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {CAPTURE_STEP_COPY.uploadSectionTitle}
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {CAPTURE_STEP_COPY.uploadSectionDescription}
              </p>
            </div>

            <div className="min-h-[140px]">
              <Textarea
                rows={8}
                value={isExtractingUpload ? "Extracting text from file..." : draftState.sourceTranscript}
                onChange={(changeEvent) =>
                  setSourceTranscript(changeEvent.target.value)
                }
                maxLength={CAPTURE_LIMITS.maxTranscriptCharacters}
                placeholder={CAPTURE_STEP_COPY.transcriptPlaceholder}
                disabled={isExtractingUpload}
                className={isExtractingUpload ? "opacity-60 cursor-not-allowed" : ""}
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {CAPTURE_STEP_COPY.uploadFileButtonLabel}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".txt,.pdf,.docx"
                  onChange={(changeEvent) =>
                    handleUploadedFile(changeEvent.target.files?.[0] ?? null)
                  }
                />
                <span className="text-slate-500 dark:text-slate-400">
                  {CAPTURE_STEP_COPY.dragDropHint}
                </span>
              </div>
              <div>
                {draftState.sourceTranscript.length.toLocaleString()} /{" "}
                {CAPTURE_LIMITS.maxTranscriptCharacters.toLocaleString()}{" "}
                {CAPTURE_STEP_COPY.characterCountSuffix}
              </div>
            </div>
            
            {draftState.uploadedFile && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
                    {draftState.uploadedFile.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearUploadedFile}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  aria-label="Remove uploaded file"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            {validationErrors.transcript && (
              <p className="mt-2 text-sm text-red-600">
                {validationErrors.transcript}
              </p>
            )}
            {validationErrors.file && (
              <p className="mt-2 text-sm text-amber-600">
                {validationErrors.file}
              </p>
            )}
            {uploadStatusMessage && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {uploadStatusMessage}
              </p>
            )}
          </div>

          <div className="mt-6">
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Input
                    label={CAPTURE_STEP_COPY.metadataDateLabel}
                    type="date"
                    value={draftState.metadata.date || ""}
                    onChange={(changeEvent) =>
                      setCaptureMetadata({
                        ...draftState.metadata,
                        date: changeEvent.target.value,
                      })
                    }
                  />
                  {validationErrors.date && (
                    <p className="mt-2 text-sm text-red-600">
                      {validationErrors.date}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    label={CAPTURE_STEP_COPY.metadataTitleLabel}
                    placeholder={CAPTURE_STEP_COPY.metadataTitlePlaceholder}
                    value={draftState.metadata.title || ""}
                    onChange={(changeEvent) =>
                      setCaptureMetadata({
                        ...draftState.metadata,
                        title: changeEvent.target.value,
                      })
                    }
                  />
                  {validationErrors.title && (
                    <p className="mt-2 text-sm text-red-600">
                      {validationErrors.title}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Input
                    label={CAPTURE_STEP_COPY.metadataVenueLabel}
                    placeholder={CAPTURE_STEP_COPY.metadataVenuePlaceholder}
                    value={draftState.metadata.venue || ""}
                    onChange={(changeEvent) =>
                      setCaptureMetadata({
                        ...draftState.metadata,
                        venue: changeEvent.target.value,
                      })
                    }
                  />
                  {validationErrors.venue && (
                    <p className="mt-2 text-sm text-red-600">
                      {validationErrors.venue}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    label={CAPTURE_STEP_COPY.metadataAuthorsLabel}
                    placeholder={CAPTURE_STEP_COPY.metadataAuthorsPlaceholder}
                    value={draftState.metadata.authors || ""}
                    onChange={(changeEvent) =>
                      setCaptureMetadata({
                        ...draftState.metadata,
                        authors: changeEvent.target.value,
                      })
                    }
                  />
                  {validationErrors.authors && (
                    <p className="mt-2 text-sm text-red-600">
                      {validationErrors.authors}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Input
                  label={CAPTURE_STEP_COPY.metadataRelatedLinksLabel}
                  placeholder={CAPTURE_STEP_COPY.metadataRelatedLinksPlaceholder}
                  value={draftState.metadata.relatedLinks || ""}
                  onChange={(changeEvent) =>
                    setCaptureMetadata({
                      ...draftState.metadata,
                      relatedLinks: changeEvent.target.value,
                    })
                  }
                />
                {validationErrors.relatedLinks && (
                  <p className="mt-2 text-sm text-red-600">
                    {validationErrors.relatedLinks}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {CAPTURE_STEP_COPY.metadataSelectionTitle}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {CAPTURE_STEP_COPY.metadataSelectionDescription}
              </p>
              <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mt-2">
                {METADATA_SELECTION_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <input
                      type="checkbox"
                      checked={draftState.metadataInclude[option.id] ?? false}
                      onChange={() =>
                        updateMetadataInclude({
                          ...draftState.metadataInclude,
                          [option.id]: !draftState.metadataInclude[option.id],
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-20 flex items-center justify-end">
            <Button
              type="submit"
              size="lg"
              isLoading={draftState.isLoading || isExtractingUpload}
            >
              {CAPTURE_STEP_COPY.submitButtonLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
