import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import './index.css';
import App from './App.tsx';
import { ErrorBoundary } from './components/Layout/ErrorBoundary';
import { UpdatePrompt } from './components/Layout/UpdatePrompt';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* reducedMotion="user" 讓所有 framer-motion 動畫跟隨系統的減少動態設定 */}
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
        <App />
        <UpdatePrompt />
      </ErrorBoundary>
    </MotionConfig>
  </StrictMode>
);
