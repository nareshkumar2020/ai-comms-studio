import { createContext, useContext, useMemo, useState, type ReactNode, useEffect } from 'react';
import type { WorkflowPhase } from '../constants/routes';
import type { LLMProviderOption } from '../types/llmProvider';
import type { DraftPayload } from '../lib/api';

interface CaptureMetadata {
  date?: string;
  title?: string;
  venue?: string;
  authors?: string;
  relatedLinks?: string;
}

interface MetadataInclude {
  date?: boolean;
  title?: boolean;
  venue?: boolean;
  authors?: boolean;
  relatedLinks?: boolean;
}

interface UploadedFileInfo {
  name: string;
  size: number;
  type: string;
  content?: string;
}

interface DraftWorkflowState {
  targetAudience: string;
  goal: string;
  desiredLength: string;
  keywords: string;
  brandVoice: string;
  additionalInstructions: string;
  keyPoints: string;

  sourceTranscript: string;
  draftVersions: string[];
  selectedDraftIndex: number;

  channel: string;
  tone: string;
  metadata: CaptureMetadata;
  metadataInclude: MetadataInclude;
  draftQualities: Record<number, any>;
  ragMatches: any[];
  uploadedFile?: UploadedFileInfo | null;
  llmMode: LLMProviderOption;

  activeWorkflowPhase: WorkflowPhase;
  isLoading: boolean;
  error: string | null;
  lastGeneratedPayload: DraftPayload | null;
}

interface DraftContextValue {
  draftState: DraftWorkflowState;
  updateCaptureInput: (
    field:
      | 'channel'
      | 'tone'
      | 'targetAudience'
      | 'goal'
      | 'desiredLength'
      | 'keywords'
      | 'brandVoice'
      | 'additionalInstructions'
      | 'keyPoints',
    value: string,
  ) => void;
  setSourceTranscript: (value: string) => void;
  setDraftVersions: (draftVersions: string[]) => void;
  setDraftVersionsPreserveSelection: (draftVersions: string[], selectedIndex?: number) => void;
  setSelectedDraftIndex: (index: number) => void;
  setCaptureMetadata: (metadata: CaptureMetadata) => void;
  updateMetadataInclude: (metadataInclude: MetadataInclude) => void;
  setDraftQualities: (qualities: Record<number, any>) => void;
  setRagMatches: (matches: any[]) => void;
  setUploadedFileInfo: (file: UploadedFileInfo | null) => void;
  setLLMMode: (mode: LLMProviderOption) => void;
  setActiveWorkflowPhase: (phase: WorkflowPhase) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  setLastGeneratedPayload: (payload: DraftPayload | null) => void;
  resetDraftWorkflow: () => void;
}

const defaultDraftWorkflowState: DraftWorkflowState = {
  targetAudience: '',
  goal: '',
  desiredLength: '',
  keywords: '',
  brandVoice: '',
  additionalInstructions: '',
  keyPoints: '',
  sourceTranscript: '',
  draftVersions: [],
  selectedDraftIndex: 0,
  channel: '',
  tone: '',
  metadata: {},
  metadataInclude: {
    date: false,
    title: false,
    venue: false,
    authors: false,
    relatedLinks: false,
  },
  draftQualities: {},
  ragMatches: [],
  uploadedFile: null,
  llmMode: 'mock',
  activeWorkflowPhase: 'capture',
  isLoading: false,
  error: null,
  lastGeneratedPayload: null,
};

const DraftContext = createContext<DraftContextValue | undefined>(undefined);

export function DraftProvider({ children }: { children: ReactNode }) {
  const [draftState, setDraftState] = useState<DraftWorkflowState>(defaultDraftWorkflowState);

  const updateCaptureInput: DraftContextValue['updateCaptureInput'] = (
    field,
    value,
  ) => {
    setDraftState((current) => ({ ...current, [field]: value }));
  };

  const setSourceTranscript = (sourceTranscript: string) => {
    setDraftState((current) => ({ ...current, sourceTranscript }));
  };

  const setDraftVersions = (draftVersions: string[]) => {
    setDraftState((current) => ({ ...current, draftVersions, selectedDraftIndex: 0 }));
  };

  const setDraftVersionsPreserveSelection = (draftVersions: string[], selectedIndex?: number) => {
    setDraftState((current) => ({
      ...current,
      draftVersions,
      selectedDraftIndex: selectedIndex ?? current.selectedDraftIndex,
    }));
  };

  const setSelectedDraftIndex = (selectedDraftIndex: number) => {
    setDraftState((current) => ({ ...current, selectedDraftIndex }));
  };

  const setCaptureMetadata = (metadata: CaptureMetadata) => {
    setDraftState((current) => ({ ...current, metadata }));
  };

  const updateMetadataInclude = (metadataInclude: MetadataInclude) => {
    setDraftState((current) => ({ ...current, metadataInclude }));
  };

  const setDraftQualities = (draftQualities: Record<number, any>) => {
    setDraftState((current) => ({ ...current, draftQualities }));
  };

  const setRagMatches = (ragMatches: any[]) => {
    setDraftState((current) => ({ ...current, ragMatches }));
  };

  const setUploadedFileInfo = (uploadedFile: UploadedFileInfo | null) => {
    setDraftState((current) => ({ ...current, uploadedFile }));
  };

  const setLLMMode = (llmMode: LLMProviderOption) => {
    setDraftState((current) => ({ ...current, llmMode }));
  };

  const setActiveWorkflowPhase = (activeWorkflowPhase: WorkflowPhase) => {
    setDraftState((current) => ({ ...current, activeWorkflowPhase }));
  };

  const setLoading = (isLoading: boolean) => {
    setDraftState((current) => ({ ...current, isLoading }));
  };

  const setError = (error: string | null) => {
    setDraftState((current) => ({ ...current, error }));
  };

  const setLastGeneratedPayload = (payload: DraftPayload | null) => {
    setDraftState((current) => ({ ...current, lastGeneratedPayload: payload }));
  };

  const resetDraftWorkflow = () => {
    setDraftState(defaultDraftWorkflowState);
  };

  const value = useMemo(
    () => ({
      draftState,
      updateCaptureInput,
      setSourceTranscript,
      setDraftVersions,
      setDraftVersionsPreserveSelection,
      setSelectedDraftIndex,
      setCaptureMetadata,
      updateMetadataInclude,
      setDraftQualities,
      setRagMatches,
      setUploadedFileInfo,
      setLLMMode,
      setActiveWorkflowPhase,
      setLoading,
      setError,
      setLastGeneratedPayload,
      resetDraftWorkflow,
    }),
    [draftState],
  );

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useDraftContext() {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error('useDraftContext must be used inside DraftProvider');
  }
  return context;
}
