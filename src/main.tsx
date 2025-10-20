import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.css'
import './i18n/config' // Inicializar i18n
import { initializeCache } from './shared/utils/apiCache' // Inicializar sistema de caché
import App from './App.tsx'

// Inicializar el sistema de caché (limpia items expirados)
initializeCache();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
