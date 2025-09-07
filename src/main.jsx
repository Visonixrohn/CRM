import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Registrar el service worker de vite-plugin-pwa si está disponible
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    import('vite-plugin-pwa/register').then(({ registerSW }) => {
      registerSW({ immediate: true });
    });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
