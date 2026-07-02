export const APP_BRANDING_COPY = {
  logoText: 'AI COMMS STUDIO',
  title: 'Create compelling AI-powered communications',
  subtitle:
    'Capture, refine, and finalize content in three simple steps. Use AI-powered assistance to polish your message.',
} as const;

export const APP_ERROR_COPY = {
  alertTitle: 'Something went wrong',
  draftGenerationFailed: 'Generation failed.',
  draftRegenerationFailed: 'Refinement failed.',
} as const;

export const THEME_TOGGLE_COPY = {
  darkModeLabel: 'Dark',
  lightModeLabel: 'Light',
} as const;

export const HOME_PAGE_COPY = {
  getStartedButtonLabel: 'Get started',
  feedDataButtonLabel: 'Feed data',
} as const;

export const CAPTURE_STEP_COPY = {
  cardTitle: 'Step 1 of 3: Capture',
  cardSubtitle: 'Paste a transcript, upload a meeting file, or drag and drop content to begin.',
  targetChannelLabel: 'Target channel',
  targetChannelPlaceholder: 'Select a channel',
  toneLabel: 'Tone',
  tonePlaceholder: 'Select a tone',
  uploadSectionTitle: 'Upload a file or paste text',
  uploadSectionDescription:
    'Drag and drop a transcript, or click the button below to upload a .txt, .pdf, or .docx file.',
  transcriptPlaceholder: 'Paste your event notes or transcript here...',
  uploadFileButtonLabel: 'Upload file',
  dragDropHint: 'or drag it here',
  characterCountSuffix: 'characters',
  targetAudienceLabel: 'Target audience',
  targetAudiencePlaceholder: 'Who is this for? e.g. product managers',
  goalLabel: 'Goal',
  goalPlaceholder: 'What should this communication achieve?',
  desiredLengthLabel: 'Desired length',
  desiredLengthPlaceholder: 'Short, medium, long, 150-250 words, etc.',
  keywordsLabel: 'Keywords',
  keywordsPlaceholder: 'Comma-separated keywords to surface in the draft',
  brandVoiceLabel: 'Brand voice',
  brandVoicePlaceholder: 'e.g. concise, upbeat, inclusive',
  additionalInstructionsLabel: 'Additional instructions',
  additionalInstructionsPlaceholder: 'Optional guidance for the draft',
  metadataDateLabel: 'Date',
  metadataTitleLabel: 'Topic',
  metadataTitlePlaceholder: 'e.g. Q2 Product Launch, Town Hall, All-Hands',
  metadataVenueLabel: 'Location',
  metadataVenuePlaceholder: 'e.g. Address, video conference link, or online platform',
  metadataAuthorsLabel: 'Panelists / speakers',
  metadataAuthorsPlaceholder: 'Jane D., John S.',
  metadataRelatedLinksLabel: 'Related links',
  metadataRelatedLinksPlaceholder: 'Paste URLs for related content, e.g. slides, recordings, or articles',
  metadataSelectionTitle: 'Select metadata',
  metadataSelectionDescription: 'Choose which metadata fields should be used to enrich the draft.',
  submitButtonLabel: 'Generate Draft →',
  validation: {
    transcriptRequired: 'Add your transcript to continue.',
    channelRequired: 'Choose a target channel to continue.',
    toneRequired: 'Choose a tone to continue.',
    targetAudienceRequired: 'Add the target audience to continue.',
    goalRequired: 'Add the goal to continue.',
    desiredLengthRequired: 'Add a desired length to continue.',
    unsupportedFileType: "That file type isn't supported. Upload a .txt, .pdf, or .docx file.",
    fileTooLarge: 'File is too large. Keep it under 5MB.',
  },
  upload: {
    extracting: 'Uploading file for server-side extraction...',
    success: 'File extracted successfully. You can now generate your draft.',
  },
} as const;

export const CHANNEL_OPTIONS = ['Social Media Post','Blog post', 'Website', 'Email', 'Release notes', 'Documentation'] as const;

export const TONE_OPTIONS = ['Professional', 'Technical', 'Executive', 'Friendly', 'Conversational', 'Marketing'] as const;

export const CAPTURE_LIMITS = {
  maxTranscriptCharacters: 10_000,
  maxUploadBytes: 5 * 1024 * 1024,
} as const;

export const REFINE_STEP_COPY = {
  cardTitle: 'Step 2 of 3: Refine',
  cardSubtitle: 'Choose a draft version, apply an adjustment, and regenerate before finalizing.',
  draftVersionsSectionTitle: 'Draft versions',
  draftVersionsSectionDescription: 'Three AI-generated drafts — select one to edit or refine.',
  draftTabDefaultSuffix: '(default)',
  editDraftSectionTitle: 'Edit draft',
  editDraftSectionDescription: (draftNumber: number) =>
    `Make direct edits to Draft ${draftNumber} before or after regenerating.`,
  draftTextareaPlaceholder: 'Your draft content appears here...',
  adjustmentTypeSectionTitle: 'Adjustment type',
  adjustmentTypeSectionDescription: 'Select an editing style, then regenerate the selected draft.',
  regenerateDraftButtonLabel: (draftNumber: number) => `Regenerate Draft ${draftNumber}`,
  qualityChecksSectionTitle: 'Quality Metrics Overview',
  qualityChecksSectionDescription:
    'Please review the metrics for generated draft quality.',
  originalSourceSectionTitle: 'Original source transcript',
  originalSourceSectionDescription: 'Review the full text you added or uploaded in step 1 for context while refining.',
  helperText: {
    toneMismatch: 'Try a more polished sign-off or finish with a professional closing like "Thanks," or "Sincerely,".',
    lengthWarning: 'Adjust the draft length so it better matches the target range.',
    keywordFail: 'Add the requested keywords or key points directly into the draft text.',
    metadataWarning: 'Include metadata context such as date, venue, or title if relevant.',
    ragWarning: 'Feed AI source data or mention the loaded content so the draft aligns with your knowledge base.',
  },
  bestScore: 'RAG best similarity score',
  qualityChecks: {
    toneMatchLabel: 'Tone Match',
    toneMatchPass: 'Content matches the requested tone.',
    toneMatchWarning: 'Tone may not match the requested style.',
    lengthTargetLabel: 'Length Target',
    lengthTargetPass: 'Content is within the expected length range.',
    lengthTargetWarning: (charCount: number, min: number, max: number) =>
      `Length is ${charCount} chars; target ${min}-${max}.`,
    keywordDensityLabel: 'Keyword Density',
    keywordDensityPass: 'Requested keywords or key points are covered.',
    keywordDensityFail: 'Draft may be missing requested keywords or key points.',
    metadataPresentLabel: 'Metadata Present',
    metadataPresentPass: 'Metadata fields are present.',
    metadataPresentWarning: 'Add title, date, or venue if relevant.',
    ragMatchLabel: 'Fact Check',
    ragMatchPass: 'Draft content aligns with referenced RAG content.',
    ragMatchFail: 'Draft content does not align with the loaded RAG content.',
    ragMatchWarning: 'No RAG data is loaded yet; feed AI data to enable this check.',
  },
  backToCaptureButtonLabel: '← Back to Capture',
  reviewFinalButtonLabel: 'Review Final →',
} as const;

export const DRAFT_VARIANT_COUNT = 3;

export const DRAFT_PREVIEW_TRUNCATE_LENGTH = 120;

export const ADJUSTMENT_TYPE_OPTIONS = [
  { id: 'tone', label: 'Tone', description: 'Adjust the overall tone' },
  { id: 'shorten', label: 'Shorten', description: 'Make it more concise' },
  { id: 'longer', label: 'Longer', description: 'Expand with details' },
  { id: 'dramatic', label: 'Dramatic', description: 'Add more impact' },
  { id: 'engaging', label: 'Engaging', description: 'Make it more engaging' },
] as const;

export const ADJUSTMENT_INSTRUCTION_BY_TYPE: Record<string, string> = {
  tone: 'Adjust the overall tone while keeping the core message.',
  shorten: 'Shorten this draft while keeping the core message intact.',
  longer: 'Expand this draft with more detail and warmth.',
  dramatic: 'Make this draft more dramatic and impactful.',
  engaging: 'Make this draft more energetic and engaging.',
};

export const FINALISE_STEP_COPY = {
  cardTitle: 'Step 3 of 3: Finalize',
  cardSubtitle: "Review the final copy, check quality, and save when you're ready.",
  qualityCheckFailedTitle: 'Quality Check Failed',
  qualityCheckFailedDescription: '"Push to CMS" is disabled until all checks pass.',
  finalContentSectionTitle: 'Final Content',
  finalContentSectionDescription: 'Review the draft one last time before saving or exporting.',
  copyButtonLabel: '📋 Copy',
  downloadButtonLabel: '⬇ Download',
  downloadFilename: 'draft.md',
  qualityChecksSectionTitle: 'Quality Checks',
  qualityChecksSectionDescription: 'A quick validation of tone, length, keywords, and metadata.',
  startOverButtonLabel: '← Start Over',
  backToRefineButtonLabel: '← Back to Refine',
  pushToCmsButtonLabel: 'Push to CMS →',
  recentlyPushedSectionTitle: 'Recently pushed drafts',
  recentlyPushedSectionDescription: 'Saved drafts from local storage.',
  localStorageKeyPrefix: 'pushed_draft_',
  saveSuccessAlert: (storageKey: string) => `Saved draft to local storage: ${storageKey}`,
  saveFailureAlert: 'Failed to save draft locally',
  qualityChecks: {
    toneMatchLabel: 'Tone Match',
    toneMatchPass: 'Content matches requested tone',
    toneMatchWarning: 'Tone may not match the requested style',
    lengthTargetLabel: 'Length Target',
    lengthTargetPass: 'Content is within target length',
    lengthTargetWarning: (charCount: number, min: number, max: number) =>
      `Length is ${charCount} chars; target ${min}-${max}`,
    keywordDensityLabel: 'Keyword Density',
    keywordDensityPass: 'Key points adequately covered',
    keywordDensityFail: 'Key points may be missing from the draft',
    metadataPresentLabel: 'Metadata Present',
    metadataPresentPass: 'All required metadata included',
    metadataPresentWarning: 'Add title/date/venue if relevant',
  },
} as const;

export const FINALISE_QUALITY_LIMITS = {
  minCharacterCount: 100,
  maxCharacterCount: 2000,
} as const;

export const METADATA_SELECTION_OPTIONS = [
  { id: 'date', label: 'Date' },
  { id: 'title', label: 'Topic' },
  { id: 'venue', label: 'Location' },
  { id: 'authors', label: 'Panelists / speakers' },
  { id: 'relatedLinks', label: 'Related links' },
] as const;

export type MetadataSelectionOptionId = (typeof METADATA_SELECTION_OPTIONS)[number]['id'];

export const TONE_KEYWORD_HEURISTICS: Record<string, string[]> = {
  professional: ['regards', 'sincerely', 'dear', 'professional', 'respectfully'],
  enthusiastic: ['excited', 'thrilled', 'amazing', 'great', 'enthusiastic'],
  'executive summary': ['summary', 'overview', 'key takeaways', 'high-level'],
};
