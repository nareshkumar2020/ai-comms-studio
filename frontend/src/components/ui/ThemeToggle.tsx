import { THEME_TOGGLE_COPY } from '../../constants/uiCopy';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

function ThemeToggle({ isDarkMode, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-2 py-1 text-slate-700 shadow-sm shadow-slate-200/60 transition-colors duration-200 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-200 dark:shadow-slate-950/40 dark:hover:bg-slate-900"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm text-slate-900 transition-colors duration-200 dark:bg-slate-800 dark:text-slate-100">
        {isDarkMode ? '🌙' : '☀️'}
      </span>
      <span className="hidden text-xs font-semibold uppercase tracking-wide sm:inline">
        {isDarkMode ? THEME_TOGGLE_COPY.darkModeLabel : THEME_TOGGLE_COPY.lightModeLabel}
      </span>
    </button>
  );
}

export { ThemeToggle };
