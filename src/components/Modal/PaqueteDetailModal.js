'use client'

import { tokens } from '@/styles/tokens'
import CloseIcon from '@mui/icons-material/Close'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import StraightenIcon from '@mui/icons-material/Straighten'
import ScaleIcon from '@mui/icons-material/Scale'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import QrCodeIcon from '@mui/icons-material/QrCode'
import CategoryIcon from '@mui/icons-material/Category'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import PaqueteTimeline from '@/components/Timeline/PaqueteTimeline'

/**
 * Modal de detalle del paquete
 * Muestra información del paquete y su cronología completa
 */
export default function PaqueteDetailModal({ open, onClose, paquete }) {
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
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulance type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`
                }
            }}
        >
            {/* Header */}
            <DialogTitle sx={{ borderBottom: `1px solid ${tokens.border.soft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: tokens.text.emphasis, fontWeight: 600 }}>
                    Detalle del Paquete
                </Typography>
                <IconButton onClick={onClose} sx={{ color: tokens.text.secondary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                {!paquete ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                        <Typography sx={{ color: tokens.text.secondary }}>No hay información del paquete</Typography>
                    </Box>
                ) : (
                    <Box>
                        {/* Información del Paquete */}
                        <Box sx={{ mb: 4, p: 3, backgroundColor: tokens.surface.elevated, borderRadius: '8px', border: `1px solid ${tokens.border.subtle}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '10px',
                                    backgroundColor: 'rgba(244, 178, 35, 0.15)',
                                    border: '1px solid rgba(244, 178, 35, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <LocalShippingIcon sx={{ color: tokens.accent.primary, fontSize: 24 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ color: tokens.text.emphasis }}>
                                        {paquete.codigo}
                                    </Typography>
                                    <Typography sx={{ color: tokens.text.secondary, fontSize: '0.875rem' }}>
                                        {paquete.tipo}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Grid de información */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                                {/* Tipo */}
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
                                        <CategoryIcon sx={{ color: '#2196f3', fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Tipo
                                        </Typography>
                                        <Typography sx={{ color: tokens.text.primary, fontWeight: 600 }}>
                                            {paquete.tipo}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Código */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(156, 39, 176, 0.15)',
                                        border: '1px solid rgba(156, 39, 176, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <QrCodeIcon sx={{ color: '#9c27b0', fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Código
                                        </Typography>
                                        <Typography sx={{ color: tokens.text.primary, fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace', fontWeight: 600 }}>
                                            {paquete.codigo}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Dimensiones */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(255, 152, 0, 0.15)',
                                        border: '1px solid rgba(255, 152, 0, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <StraightenIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Dimensiones (L×A×A)
                                        </Typography>
                                        <Typography sx={{ color: tokens.text.primary, fontWeight: 600 }}>
                                            {paquete.largo} × {paquete.alto} × {paquete.ancho} cm
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Peso */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(76, 175, 80, 0.15)',
                                        border: '1px solid rgba(76, 175, 80, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <ScaleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Peso
                                        </Typography>
                                        <Typography sx={{ color: tokens.text.primary, fontWeight: 600 }}>
                                            {paquete.peso} kg
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Volumen */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(103, 58, 183, 0.15)',
                                        border: '1px solid rgba(103, 58, 183, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <StraightenIcon sx={{ color: '#673ab7', fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Volumen
                                        </Typography>
                                        <Typography sx={{ color: tokens.text.primary, fontWeight: 600 }}>
                                            {paquete.volumen} m³
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Precio */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(244, 178, 35, 0.15)',
                                        border: '1px solid rgba(244, 178, 35, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <AttachMoneyIcon sx={{ color: tokens.accent.primary, fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Precio
                                        </Typography>
                                        <Typography sx={{ color: tokens.text.primary, fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace', fontWeight: 600 }}>
                                            ${paquete.precio?.toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Divider con título */}
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Divider sx={{ flex: 1, borderColor: tokens.border.soft }} />
                            <Typography sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', fontWeight: 600 }}>
                                Cronología del Paquete
                            </Typography>
                            <Divider sx={{ flex: 1, borderColor: tokens.border.soft }} />
                        </Box>

                        {/* Timeline */}
                        <PaqueteTimeline codigoPaquete={paquete?.codigo} />
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    )
}
