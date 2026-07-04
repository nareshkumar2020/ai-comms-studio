import { LLMProviderOption } from '../../types/llmProvider';

interface LLMModeToggleProps {
  mode: LLMProviderOption;
  setMode: (mode: LLMProviderOption) => void;
}

export function LLMModeToggle({ mode, setMode }: LLMModeToggleProps) {
  return (
    <div className="flex items-center gap-4">
      {/* <a 
        href="/mock_data.md" 
        target="_blank" 
        rel="noreferrer"
        className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors underline decoration-slate-300 dark:decoration-slate-600 underline-offset-2"
        title="View mock data scenarios for testing"
      >
        Mock Data Guide
      </a> */}
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-sm text-slate-700 shadow-sm shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-200 dark:shadow-slate-950/40">
        <span className="font-semibold uppercase tracking-wide">AI mode</span>
        <button
          type="button"
          onClick={() => setMode(mode === 'live' ? 'mock' : 'live')}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-slate-900 transition-colors duration-200 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          {mode === 'live' ? 'LIVE' : 'MOCK'}
        </button>
      </div>
    </div>
  );
}
