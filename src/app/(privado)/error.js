'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import RefreshIcon from '@mui/icons-material/Refresh'
import HomeIcon from '@mui/icons-material/Home'
import { tokens } from '@/styles/tokens'

/**
 * Error boundary for all private routes.
 * Rendered inside (privado)/layout.js so the sidebar and navbar remain visible.
 * Next.js passes { error, reset } — reset() re-renders the failing segment.
 */
export default function PrivadoError({ error, reset }) {
    const router = useRouter()

    useEffect(() => {
        console.error('[PrivadoError]', error)
    }, [error])

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                p: 4,
            }}
        >
            <Box
                sx={{
                    p: 4,
                    backgroundColor: tokens.surface.elevated,
                    border: `1px solid ${tokens.border.soft}`,
                    borderRadius: '12px',
                    maxWidth: 480,
                    width: '100%',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: 0, right: 0,
                        height: '3px',
                        background: tokens.semantic.error,
                    },
                }}
            >
                {/* Icon */}
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '12px',
                        backgroundColor: tokens.semantic.errorBg,
                        border: `1px solid rgba(211, 47, 47, 0.3)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2.5,
                        fontSize: '1.75rem',
                    }}
                >
                    ⚠
                </Box>

                <Typography
                    variant="h6"
                    sx={{ color: tokens.text.emphasis, fontWeight: 600, mb: 1 }}
                >
                    Algo salió mal
                </Typography>

                <Typography
                    sx={{ color: tokens.text.secondary, fontSize: '0.875rem', mb: 3 }}
                >
                    Ocurrió un error inesperado en esta sección. Puedes intentar de nuevo o
                    volver al inicio.
                </Typography>

                {/* Error detail — only in development */}
                {error?.message && process.env.NODE_ENV === 'development' && (
                    <Box
                        sx={{
                            p: 1.5,
                            mb: 3,
                            backgroundColor: 'rgba(211, 47, 47, 0.08)',
                            border: '1px solid rgba(211, 47, 47, 0.2)',
                            borderRadius: '6px',
                            textAlign: 'left',
                        }}
                    >
                        <Typography
                            sx={{
                                color: '#ef5350',
                                fontSize: '0.75rem',
                                fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace',
                                wordBreak: 'break-all',
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {error.message}
                        </Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={reset}
                        sx={{
                            backgroundColor: tokens.accent.primary,
                            color: '#000',
                            fontWeight: 600,
                            '&:hover': { backgroundColor: tokens.accent.primaryHover },
                        }}
                    >
                        Reintentar
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<HomeIcon />}
                        onClick={() => router.push('/dashboard')}
                        sx={{
                            borderColor: tokens.border.soft,
                            color: tokens.text.primary,
                            '&:hover': {
                                borderColor: tokens.accent.primary,
                                backgroundColor: 'rgba(244, 178, 35, 0.05)',
                            },
                        }}
                    >
                        Ir al inicio
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}
