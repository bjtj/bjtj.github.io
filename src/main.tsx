import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './ThemeProvider.tsx'
import "material-icons/iconfont/material-icons.css";
import ReactGA from "react-ga4";
import { GA_ID } from '@/constants';

ReactGA.initialize(GA_ID);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
