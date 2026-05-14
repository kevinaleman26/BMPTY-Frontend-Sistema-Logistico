'use client'

import PaqueteTimeline from '@/components/Timeline/PaqueteTimeline'
import { tokens } from '@/styles/tokens'
import TimelineIcon from '@mui/icons-material/Timeline'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { CloseIcon } from '@/components/Icons'


/**
 * Modal para mostrar la cronología completa de un paquete
 */
export default function PaqueteTimelineModal({ open, onClose, codigoPaquete }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: tokens.surface.card,
                    border: `1px solid ${tokens.border.soft}`,
                    borderRadius: '8px',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`
                }
            }}
        >
            {/* Header */}
            <DialogTitle sx={{ 
                borderBottom: `1px solid ${tokens.border.soft}`, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(33, 150, 243, 0.15)',
                        border: '1px solid rgba(33, 150, 243, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <TimelineIcon sx={{ color: tokens.accent.secondary, fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ color: tokens.text.emphasis, fontWeight: 600, fontSize: '1.125rem' }}>
                            Cronología del Paquete
                        </Typography>
                        <Typography sx={{ 
                            color: tokens.text.secondary, 
                            fontSize: '0.875rem',
                            fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace'
                        }}>
                            {codigoPaquete}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} sx={{ color: tokens.text.secondary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                {codigoPaquete ? (
                    <PaqueteTimeline codigoPaquete={codigoPaquete} />
                ) : (
                    <Box sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        backgroundColor: tokens.surface.elevated,
                        border: `1px solid ${tokens.border.subtle}`,
                        borderRadius: '8px'
                    }}>
                        <Typography sx={{ color: tokens.text.secondary }}>
                            No se especificó un código de paquete
                        </Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    )
}
