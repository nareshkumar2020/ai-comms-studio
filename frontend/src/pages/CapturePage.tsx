import { CaptureForm } from '../components/CaptureForm';
import { useDraftWorkflowActions } from '../hooks/useDraftWorkflowActions';

export function CapturePage() {
  const { handleGenerateDraftsFromCapture } = useDraftWorkflowActions();

  return (
    <main className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm dark:shadow-slate-900/30">
      <CaptureForm onSubmitCapture={handleGenerateDraftsFromCapture} />
    </main>
  );
}
