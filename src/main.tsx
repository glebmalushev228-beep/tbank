import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initTelegramWebApp } from './lib/telegram';
import './index.css';

initTelegramWebApp();

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
