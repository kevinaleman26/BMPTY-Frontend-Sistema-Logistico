'use client'

import { usePaqueteTimeline } from '@/hooks/usePaqueteTimeline'
import { tokens } from '@/styles/tokens'
import AddBoxIcon from '@mui/icons-material/AddBox'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ReceiptIcon from '@mui/icons-material/Receipt'
import PersonIcon from '@mui/icons-material/Person'
import CancelIcon from '@mui/icons-material/Cancel'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

/**
 * Configuración de iconos y colores por tipo de evento
 */
const EVENT_CONFIG = {
    'INGRESO': {
        icon: AddBoxIcon,
        color: '#4caf50',
        titulo: 'Paquete Ingresado',
        descripcion: 'Registrado en el sistema'
    },
    'TRANSFERENCIA_ENVIADA': {
        icon: LocalShippingIcon,
        color: '#2196f3',
        titulo: 'Transferencia Enviada',
        descripcion: 'En tránsito entre sucursales'
    },
    'TRANSFERENCIA_RECIBIDA': {
        icon: CheckCircleIcon,
        color: '#4caf50',
        titulo: 'Transferencia Recibida',
        descripcion: 'Recibido en sucursal destino'
    },
    'FACTURADO': {
        icon: ReceiptIcon,
        color: '#f4b223',
        titulo: 'Facturado',
        descripcion: 'Asignado a cliente'
    },
    'ENTREGADO': {
        icon: PersonIcon,
        color: '#9c27b0',
        titulo: 'Entregado',
        descripcion: 'Retirado por el cliente'
    },
    'TRANSFERENCIA_CANCELADA': {
        icon: CancelIcon,
        color: '#f44336',
        titulo: 'Transferencia Cancelada',
        descripcion: 'Transferencia cancelada'
    }
}

/**
 * Componente individual de evento en la cronología
 */
function TimelineEvent({ evento, isLast }) {
    const config = EVENT_CONFIG[evento.evento_tipo] || EVENT_CONFIG['INGRESO']
    const Icon = config.icon

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Box sx={{ display: 'flex', gap: 2, position: 'relative', pb: isLast ? 0 : 4 }}>
            {/* Línea vertical conectora */}
            {!isLast && (
                <Box sx={{
                    position: 'absolute',
                    left: '20px',
                    top: '50px',
                    bottom: '-16px',
                    width: '2px',
                    background: `linear-gradient(180deg, ${config.color}40 0%, ${tokens.border.subtle} 100%)`,
                }} />
            )}

            {/* Icono del evento */}
            <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                backgroundColor: `${config.color}15`,
                border: `2px solid ${config.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                position: 'relative',
                zIndex: 1,
                boxShadow: `0 0 12px ${config.color}40`,
            }}>
                <Icon sx={{ color: config.color, fontSize: 20 }} />
            </Box>

            {/* Contenido del evento */}
            <Box sx={{ flex: 1 }}>
                <Box sx={{ 
                    backgroundColor: tokens.surface.elevated, 
                    border: `1px solid ${tokens.border.soft}`,
                    borderRadius: '8px',
                    p: 2,
                    transition: 'all 200ms ease',
                    '&:hover': {
                        borderColor: config.color,
                        boxShadow: `0 4px 12px ${config.color}20`,
                        transform: 'translateX(2px)'
                    }
                }}>
                    {/* Título y fecha */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography sx={{ 
                            color: tokens.text.emphasis, 
                            fontWeight: 600,
                            fontSize: '0.9375rem'
                        }}>
                            {config.titulo}
                        </Typography>
                        <Typography sx={{ 
                            color: tokens.text.secondary, 
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace',
                            whiteSpace: 'nowrap',
                            ml: 2
                        }}>
                            {formatFecha(evento.created_at)}
                        </Typography>
                    </Box>

                    {/* Descripción */}
                    <Typography sx={{ 
                        color: tokens.text.secondary, 
                        fontSize: '0.8125rem',
                        mb: 1.5
                    }}>
                        {config.descripcion}
                    </Typography>

                    {/* Detalles del evento */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {evento.sucursal_name && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Typography sx={{ 
                                    color: tokens.text.muted, 
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    minWidth: '80px'
                                }}>
                                    Sucursal:
                                </Typography>
                                <Typography sx={{ color: tokens.text.primary, fontSize: '0.8125rem' }}>
                                    {evento.sucursal_name}
                                </Typography>
                            </Box>
                        )}

                        {evento.operador_name && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Typography sx={{ 
                                    color: tokens.text.muted, 
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    minWidth: '80px'
                                }}>
                                    Operador:
                                </Typography>
                                <Typography sx={{ color: tokens.text.primary, fontSize: '0.8125rem' }}>
                                    {evento.operador_name}
                                </Typography>
                            </Box>
                        )}

                        {evento.cliente_name && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Typography sx={{ 
                                    color: tokens.text.muted, 
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    minWidth: '80px'
                                }}>
                                    Cliente:
                                </Typography>
                                <Typography sx={{ color: tokens.text.primary, fontSize: '0.8125rem' }}>
                                    {evento.cliente_name}
                                </Typography>
                            </Box>
                        )}

                        {evento.factura_id && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Typography sx={{ 
                                    color: tokens.text.muted, 
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    minWidth: '80px'
                                }}>
                                    Factura:
                                </Typography>
                                <Typography sx={{ 
                                    color: config.color, 
                                    fontSize: '0.8125rem',
                                    fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace',
                                    fontWeight: 600
                                }}>
                                    #{evento.factura_id}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

/**
 * Componente principal de cronología de paquete
 */
export default function PaqueteTimeline({ codigoPaquete }) {
    const { eventos, isLoading, isError, error } = usePaqueteTimeline(codigoPaquete)

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress sx={{ color: tokens.accent.primary }} size={32} />
            </Box>
        )
    }

    if (isError) {
        return (
            <Box sx={{ 
                p: 3, 
                backgroundColor: 'rgba(244, 67, 54, 0.1)', 
                border: '1px solid rgba(244, 67, 54, 0.3)',
                borderRadius: '8px'
            }}>
                <Typography sx={{ color: '#f44336' }}>
                    Error al cargar cronología: {error?.message || 'Error desconocido'}
                </Typography>
            </Box>
        )
    }

    if (!eventos || eventos.length === 0) {
        return (
            <Box sx={{ 
                p: 4, 
                textAlign: 'center',
                backgroundColor: tokens.surface.elevated,
                border: `1px solid ${tokens.border.subtle}`,
                borderRadius: '8px'
            }}>
                <Typography sx={{ color: tokens.text.secondary }}>
                    No hay eventos registrados para este paquete
                </Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ 
            p: 3,
            backgroundColor: tokens.surface.base,
            borderRadius: '8px',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`
        }}>
            {/* Header */}
            <Box sx={{ mb: 3, pb: 2, borderBottom: `1px solid ${tokens.border.soft}` }}>
                <Typography sx={{ 
                    color: tokens.text.emphasis, 
                    fontSize: '1.125rem', 
                    fontWeight: 600,
                    mb: 0.5
                }}>
                    Cronología del Paquete
                </Typography>
                <Typography sx={{ 
                    color: tokens.text.secondary, 
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace'
                }}>
                    {codigoPaquete} • {eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'}
                </Typography>
            </Box>

            {/* Timeline */}
            <Box>
                {eventos.map((evento, index) => (
                    <TimelineEvent
                        key={evento.id}
                        evento={evento}
                        isLast={index === eventos.length - 1}
                    />
                ))}
            </Box>
        </Box>
    )
}
