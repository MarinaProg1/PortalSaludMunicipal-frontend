import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './styles/theme.css'

import AppRouter from './routes/AppRouter'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import { Toaster as SonnerToaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(7, 42, 69, 0.96)',
            color: '#eaf5ff',
            border: '1px solid rgba(111, 240, 230, 0.28)',
            boxShadow: '0 18px 40px -16px rgba(0, 8, 20, 0.85)',
            borderRadius: '12px',
            fontWeight: 600,
          },
          success: { iconTheme: { primary: '#6ff0e6', secondary: '#042a3d' } },
          error: { iconTheme: { primary: '#ff8a8a', secondary: '#2a1220' } },
        }}
      />
      <SonnerToaster position="top-right" richColors theme="dark" />
    </AuthProvider>
  </StrictMode>,
)
