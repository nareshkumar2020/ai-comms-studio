import { FinalizeView } from '../components/FinalizeView';
import { useDraftWorkflowActions } from '../hooks/useDraftWorkflowActions';
import { useWorkflowNavigation } from '../hooks/useWorkflowNavigation';

export function FinalisePage() {
  const { handleResetDraftWorkflow } = useDraftWorkflowActions();
  const { navigateToHome } = useWorkflowNavigation();

  const handleRestartWorkflow = () => {
    handleResetDraftWorkflow();
    navigateToHome();
  };

  return (
    <main className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm dark:shadow-slate-900/30">
      <FinalizeView onRestartWorkflow={handleRestartWorkflow} />
    </main>
  );
}
