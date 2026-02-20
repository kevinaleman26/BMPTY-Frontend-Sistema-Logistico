'use client'

import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Button,
    LinearProgress,
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

const COUNTDOWN_SECONDS = 60

/**
 * Modal de advertencia de sesión inactiva.
 * Muestra un countdown y permite al usuario extender la sesión.
 *
 * @param {object}   props
 * @param {boolean}  props.open        - Controla visibilidad del modal
 * @param {() => void} props.onStay    - Callback: usuario elige continuar
 * @param {() => void} props.onLogout  - Callback: countdown llegó a 0
 */
export default function IdleWarningModal({ open, onStay, onLogout }) {
    const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS)

    useEffect(() => {
        if (!open) {
            setSeconds(COUNTDOWN_SECONDS)
            return
        }

        const interval = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    onLogout()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [open, onLogout])

    const progress = (seconds / COUNTDOWN_SECONDS) * 100

    return (
        <Dialog
            open={open}
            disableEscapeKeyDown
            PaperProps={{
                sx: {
                    background: '#111',
                    border: '1px solid #444',
                    borderRadius: 2,
                    minWidth: 360,
                    maxWidth: 420,
                    overflow: 'hidden',
                }
            }}
            slotProps={{
                backdrop: { sx: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.7)' } }
            }}
        >
            {/* Barra de progreso en la parte superior */}
            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                    height: 3,
                    backgroundColor: '#333',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: seconds > 20 ? '#f4b223' : '#ef4444',
                        transition: 'background-color 0.5s ease',
                    }
                }}
            />

            <DialogContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>

                    {/* Icono con countdown */}
                    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: 'rgba(244, 178, 35, 0.1)',
                                border: `2px solid ${seconds > 20 ? '#f4b223' : '#ef4444'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'border-color 0.5s ease',
                            }}
                        >
                            <AccessTimeIcon
                                sx={{
                                    fontSize: 36,
                                    color: seconds > 20 ? '#f4b223' : '#ef4444',
                                    transition: 'color 0.5s ease',
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Textos */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography
                            variant="h6"
                            sx={{ color: '#fff', fontWeight: 700, mb: 1 }}
                        >
                            Sesión por expirar
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: '#888', lineHeight: 1.6 }}
                        >
                            Tu sesión cerrará por inactividad en
                        </Typography>
                        <Typography
                            variant="h3"
                            sx={{
                                color: seconds > 20 ? '#f4b223' : '#ef4444',
                                fontWeight: 800,
                                fontFamily: 'monospace',
                                mt: 1,
                                transition: 'color 0.5s ease',
                            }}
                        >
                            {String(seconds).padStart(2, '0')}s
                        </Typography>
                    </Box>

                    {/* Botones */}
                    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={onLogout}
                            sx={{
                                borderColor: '#444',
                                color: '#888',
                                '&:hover': { borderColor: '#666', color: '#ccc', background: 'rgba(255,255,255,0.04)' }
                            }}
                        >
                            Cerrar sesión
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={onStay}
                            sx={{
                                background: '#f4b223',
                                color: '#000',
                                fontWeight: 700,
                                '&:hover': { background: '#e6a71f' }
                            }}
                        >
                            Seguir conectado
                        </Button>
                    </Box>

                </Box>
            </DialogContent>
        </Dialog>
    )
}
