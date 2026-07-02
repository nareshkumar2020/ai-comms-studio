import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useDraftContext } from "../context/DraftContext";
import { Alert, ThemeToggle, LLMModeToggle } from "./ui";
import { APP_BRANDING_COPY, APP_ERROR_COPY } from "../constants/uiCopy";
import { APP_ROUTES } from "../constants/routes";

export function AppLayout() {
  const { draftState, setError, setLLMMode, resetDraftWorkflow } = useDraftContext();
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(true);

  return (
    <div className={isDarkModeEnabled ? "dark" : ""}>
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200">
        <div className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-8">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex flex-1 items-center gap-3">
                <Link 
                  to={APP_ROUTES.home}
                  onClick={() => resetDraftWorkflow()} 
                  className="text-xl font-bold text-slate-900 dark:text-slate-100 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {APP_BRANDING_COPY.logoText}
                </Link>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <LLMModeToggle mode={draftState.llmMode} setMode={setLLMMode} />
                <ThemeToggle
                  isDarkMode={isDarkModeEnabled}
                  onToggle={() => setIsDarkModeEnabled((current) => !current)}
                />
              </div>
            </div>

            {draftState.error && (
              <Alert
                variant="error"
                title={APP_ERROR_COPY.alertTitle}
                message={draftState.error}
                onClose={() => setError(null)}
              />
            )}

            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
