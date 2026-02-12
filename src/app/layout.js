'use client'

import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { muiThemeOverrides, tokens } from '@/styles/tokens'
import './globals.css'

const theme = createTheme(muiThemeOverrides)

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{
        margin: 0,
        backgroundColor: tokens.surface.base,
        color: tokens.text.primary,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: tokens.font.family.base
      }}>
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
      </body>
    </html>
  )
}
