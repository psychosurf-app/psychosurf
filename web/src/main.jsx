import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import SaveNotice from './components/SaveNotice.jsx';
import { initTelegram } from './telegram.js';
import { watchKeyboard } from './lib/keyboard.js';

initTelegram();
watchKeyboard();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <SaveNotice />
  </StrictMode>,
);
