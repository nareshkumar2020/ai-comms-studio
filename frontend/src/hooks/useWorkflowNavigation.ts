import { useNavigate } from 'react-router-dom';
import { APP_ROUTES, ROUTE_BY_WORKFLOW_PHASE, type WorkflowPhase } from '../constants/routes';
import { useDraftContext } from '../context/DraftContext';

export function useWorkflowNavigation() {
  const navigate = useNavigate();
  const { setActiveWorkflowPhase } = useDraftContext();

  const navigateToWorkflowPhase = (phase: WorkflowPhase) => {
    setActiveWorkflowPhase(phase);
    navigate(ROUTE_BY_WORKFLOW_PHASE[phase]);
  };

  return {
    navigateToHome: () => navigate(APP_ROUTES.home),
    navigateToCapture: () => navigateToWorkflowPhase('capture'),
    navigateToFeedData: () => navigate(APP_ROUTES.feedData),
    navigateToRefine: () => navigateToWorkflowPhase('refine'),
    navigateToFinalise: () => navigateToWorkflowPhase('finalise'),
  };
}
