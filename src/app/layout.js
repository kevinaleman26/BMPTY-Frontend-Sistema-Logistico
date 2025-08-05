'use client'

import { Box, CssBaseline } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import './globals.css'

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <html lang="es">
      <head />
      <body style={{ margin: 0, backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          {/* Contenido dinámico */}
          <Box component="main" sx={{
            flex: 1, // esto hace que ocupe el espacio entre navbar y footer
            display: 'flex',
            flexDirection: 'column' }}>
            {children}
          </Box>
        </QueryClientProvider>
      </body>
    </html>
  )
}
