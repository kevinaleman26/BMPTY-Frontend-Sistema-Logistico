'use client'

import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { muiThemeOverrides } from '@/styles/tokens'

const theme = createTheme(muiThemeOverrides)

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 seconds
        staleTime: 60 * 1000,
        // Keep inactive cache entries for 30 minutes (was 5 min).
        // Longer window prevents data disappearing while navigating between
        // modules, which caused infinite loading after short periods of inactivity.
        gcTime: 30 * 60 * 1000,
        // Automatically refetch stale data when the user returns to the tab.
        // This was disabled for performance but caused the "stuck loading" issue
        // after inactivity — data had been garbage-collected and nothing triggered
        // a re-fetch when the user came back.
        refetchOnWindowFocus: true,
        // Refetch when network reconnects after going offline
        refetchOnReconnect: true,
        // 2 retries with exponential backoff for transient failures
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
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
