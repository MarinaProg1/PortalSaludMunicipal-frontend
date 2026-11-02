import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './routes/AppRouter.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppRouter />
      <Toaster position="top-right" />
    </AuthProvider>
  </StrictMode>,
)