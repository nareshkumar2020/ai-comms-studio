export const APP_ROUTES = {
  home: '/home',
  capture: '/capture',
  feedData: '/feed-data',
  refine: '/refine',
  finalise: '/finalise',
} as const;

export type AppRoutePath = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];

export type WorkflowPhase = 'capture' | 'refine' | 'finalise';

export const ROUTE_BY_WORKFLOW_PHASE: Record<WorkflowPhase, AppRoutePath> = {
  capture: APP_ROUTES.capture,
  refine: APP_ROUTES.refine,
  finalise: APP_ROUTES.finalise,
};

export const WORKFLOW_PHASE_BY_ROUTE: Record<AppRoutePath, WorkflowPhase | null> = {
  [APP_ROUTES.home]: null,
  [APP_ROUTES.capture]: 'capture',
  [APP_ROUTES.feedData]: null,
  [APP_ROUTES.refine]: 'refine',
  [APP_ROUTES.finalise]: 'finalise',
};
