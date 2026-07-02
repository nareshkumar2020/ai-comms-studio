import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { DraftProvider } from './context/DraftContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="ai-comms-studio">
      <DraftProvider>
        <App />
      </DraftProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
