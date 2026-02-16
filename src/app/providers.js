'use client'

import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { muiThemeOverrides, tokens } from '@/styles/tokens'

const theme = createTheme(muiThemeOverrides)

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient())

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
