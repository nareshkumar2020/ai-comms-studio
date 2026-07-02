interface Step {
  id: string;
  label: string;
  status: 'completed' | 'active' | 'upcoming';
}

interface StepIndicatorProps {
  steps: Step[];
  className?: string;
}

function StepIndicator({ steps, className = '' }: StepIndicatorProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex flex-1 items-center">
          <div className="flex flex-col items-center">
            <div
              className={`
                flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-all duration-200
                ${
                  step.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : step.status === 'active'
                      ? 'bg-primary-600 text-white ring-4 ring-primary-200 dark:ring-primary-900/50'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                }
              `}
            >
              {step.status === 'completed' ? (
                <CheckIcon />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">{step.label}</p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`
                mx-2 h-1 flex-1 rounded-full transition-all duration-200
                ${
                  step.status === 'completed'
                    ? 'bg-green-500'
                    : step.status === 'active'
                      ? 'bg-primary-600'
                      : 'bg-slate-200 dark:bg-slate-700'
                }
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export { StepIndicator };
