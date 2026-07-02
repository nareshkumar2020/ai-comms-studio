import { type DraftQualityCheck } from '../../types/qualityChecks';

interface QualityChecksProps {
  checks: DraftQualityCheck[];
  loading?: boolean;
  loadingDescription?: string;
  scoreLabel?: string;
  scoreValue?: string;
}

export function QualityChecks({
  checks,
  loading = false,
  loadingDescription = 'Validating quality checks...',
  scoreLabel,
  scoreValue,
}: QualityChecksProps) {
  return (
    <div>
      {loading ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          {loadingDescription}
        </p>
      ) : scoreLabel && scoreValue ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          {scoreLabel}: {scoreValue}
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {checks.map((qualityCheck) => (
          <div
            key={qualityCheck.id}
            className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
          >
            <div
              className={`
                mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold
                ${
                  qualityCheck.status === 'pass'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : qualityCheck.status === 'fail'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }
              `}
            >
              {qualityCheck.status === 'pass' ? '✓' : qualityCheck.status === 'fail' ? '✕' : '!'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {qualityCheck.label}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {qualityCheck.description}
              </p>
              {qualityCheck.helperText && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {qualityCheck.helperText}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
