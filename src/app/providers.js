'use client'

import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { muiThemeOverrides, tokens } from '@/styles/tokens'

const theme = createTheme(muiThemeOverrides)

export function Providers({ children }) {
  // ⚡ Configuración optimizada de QueryClient para mejor performance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Considerar datos frescos por 60 segundos
        staleTime: 60 * 1000,
        // Mantener datos en cache por 5 minutos
        cacheTime: 5 * 60 * 1000,
        // No refetch automático al volver a la pestaña (ahorra requests)
        refetchOnWindowFocus: false,
        // Solo 1 retry en caso de error (más rápido que 3 retries default)
        retry: 1,
        // Mantener datos previos durante refetch (mejor UX)
        keepPreviousData: true,
      },
    },
  }))

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <CssBaseline />
        <Box component="main" sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {children}
        </Box>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
