import { Navigate, Route, Routes } from 'react-router-dom';
import { APP_ROUTES } from './constants/routes';
import { HomePage } from './pages/HomePage';
import { CapturePage } from './pages/CapturePage';
// import { FeedAIPage } from './pages/FeedAIPage';
import { RefinePage } from './pages/RefinePage';
import { FinalisePage } from './pages/FinalisePage';
import { AppLayout } from './components/AppLayout';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to={APP_ROUTES.home} replace />} />
        <Route path={APP_ROUTES.home} element={<HomePage />} />
        <Route path={APP_ROUTES.capture} element={<CapturePage />} />
        {/* <Route path={APP_ROUTES.feedData} element={<FeedAIPage />} /> */}
        <Route path={APP_ROUTES.refine} element={<RefinePage />} />
        <Route path={APP_ROUTES.finalise} element={<FinalisePage />} />
        <Route path="*" element={<Navigate to={APP_ROUTES.home} replace />} />
      </Route>
    </Routes>
  );
}

export default App;
