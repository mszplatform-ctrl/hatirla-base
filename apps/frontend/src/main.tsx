import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "./xotiji-brand.css";
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
