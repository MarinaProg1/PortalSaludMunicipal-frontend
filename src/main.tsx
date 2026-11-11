import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import AppRouter from './routes/AppRouter'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import { Toaster as SonnerToaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppRouter />
      <Toaster position="top-right" />
      <SonnerToaster position="top-right" richColors />
    </AuthProvider>
  </StrictMode>,
)
