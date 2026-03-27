import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ErrorBoundary } from './components/Layout/ErrorBoundary';
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    const banner = document.createElement('div');
    banner.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[300] bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl text-xs flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300';
    banner.innerHTML = '<span>有新版本可用</span>';
    const btn = document.createElement('button');
    btn.textContent = '更新';
    btn.className = 'bg-white text-indigo-600 px-4 py-1.5 rounded-full text-[10px] uppercase font-bold active:scale-95 transition-all';
    btn.onclick = () => updateSW(true);
    banner.appendChild(btn);
    document.body.appendChild(banner);
  },
  onOfflineReady() {},
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
