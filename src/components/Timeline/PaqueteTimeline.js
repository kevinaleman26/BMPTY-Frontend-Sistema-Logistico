'use client'

import { usePaqueteTimeline } from '@/hooks/usePaqueteTimeline'
import { tokens } from '@/styles/tokens'
import AddBoxIcon from '@mui/icons-material/AddBox'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ReceiptIcon from '@mui/icons-material/Receipt'
import PersonIcon from '@mui/icons-material/Person'
import CancelIcon from '@mui/icons-material/Cancel'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
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

const ESTADO_CONFIG = {
    'INGRESO':                  { label: 'Ingresado',              color: '#4caf50', bg: 'rgba(76,175,80,0.1)'  },
    'TRANSFERENCIA_ENVIADA':    { label: 'En tránsito',            color: '#2196f3', bg: 'rgba(33,150,243,0.1)' },
    'TRANSFERENCIA_RECIBIDA':   { label: 'Recibido en destino',    color: '#4caf50', bg: 'rgba(76,175,80,0.1)'  },
    'FACTURADO':                { label: 'Facturado',              color: '#f4b223', bg: 'rgba(244,178,35,0.1)' },
    'ENTREGADO':                { label: 'Entregado al cliente',   color: '#9c27b0', bg: 'rgba(156,39,176,0.1)' },
    'TRANSFERENCIA_CANCELADA':  { label: 'Transferencia cancelada',color: '#f44336', bg: 'rgba(244,67,54,0.1)'  },
}

function TransferenciaActivaBanner({ transferencia }) {
    if (!transferencia) return null
    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            mb: 2,
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 152, 0, 0.08)',
            border: '1px solid rgba(255, 152, 0, 0.35)',
        }}>
            <WarningAmberIcon sx={{ color: '#ff9800', fontSize: 20, flexShrink: 0 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                    label="En transferencia activa"
                    size="small"
                    sx={{ backgroundColor: '#ff9800', color: '#000', fontWeight: 700, fontSize: '0.75rem' }}
                />
                <Typography sx={{ color: tokens.text.secondary, fontSize: '0.8125rem' }}>
                    Transferencia
                    <Typography component="span" sx={{ color: '#ff9800', fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace', fontWeight: 700, mx: 0.5 }}>
                        #{transferencia.id}
                    </Typography>
                    pendiente de recepción
                </Typography>
                {transferencia.emisor?.name && transferencia.receptor?.name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ color: tokens.text.primary, fontSize: '0.8125rem', fontWeight: 600 }}>{transferencia.emisor.name}</Typography>
                        <ArrowForwardIcon sx={{ color: '#ff9800', fontSize: 14 }} />
                        <Typography sx={{ color: tokens.text.primary, fontSize: '0.8125rem', fontWeight: 600 }}>{transferencia.receptor.name}</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    )
}

function EstadoBanner({ eventos }) {
    if (!eventos?.length) return null
    const ultimo = eventos[eventos.length - 1]
    const cfg = ESTADO_CONFIG[ultimo.evento_tipo]
    if (!cfg) return null
    const esTransferencia = ultimo.evento_tipo === 'TRANSFERENCIA_ENVIADA' || ultimo.evento_tipo === 'TRANSFERENCIA_RECIBIDA'

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            mb: 2,
            borderRadius: '8px',
            backgroundColor: cfg.bg,
            border: `1px solid ${cfg.color}40`,
        }}>
            <Chip
                label={cfg.label}
                size="small"
                sx={{ backgroundColor: cfg.color, color: '#fff', fontWeight: 700, fontSize: '0.75rem' }}
            />
            {esTransferencia && ultimo.emisor_sucursal_name && ultimo.receptor_sucursal_name && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography sx={{ color: tokens.text.primary, fontSize: '0.8125rem', fontWeight: 600 }}>
                        {ultimo.emisor_sucursal_name}
                    </Typography>
                    <ArrowForwardIcon sx={{ color: cfg.color, fontSize: 16 }} />
                    <Typography sx={{ color: tokens.text.primary, fontSize: '0.8125rem', fontWeight: 600 }}>
                        {ultimo.receptor_sucursal_name}
                    </Typography>
                </Box>
            )}
        </Box>
    )
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

                        {(evento.evento_tipo === 'TRANSFERENCIA_ENVIADA' || evento.evento_tipo === 'TRANSFERENCIA_RECIBIDA') && (
                            <>
                                {evento.transferencia_id && (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ color: tokens.text.muted, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '80px' }}>
                                            Transfer:
                                        </Typography>
                                        <Typography sx={{ color: config.color, fontSize: '0.8125rem', fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace', fontWeight: 600 }}>
                                            #{evento.transferencia_id}
                                        </Typography>
                                    </Box>
                                )}
                                {evento.emisor_sucursal_name && evento.receptor_sucursal_name && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography sx={{ color: tokens.text.muted, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '80px' }}>
                                            Ruta:
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography sx={{ color: tokens.text.primary, fontSize: '0.8125rem' }}>
                                                {evento.emisor_sucursal_name}
                                            </Typography>
                                            <ArrowForwardIcon sx={{ color: config.color, fontSize: 14 }} />
                                            <Typography sx={{ color: tokens.text.primary, fontSize: '0.8125rem' }}>
                                                {evento.receptor_sucursal_name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </>
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
    const { eventos, transferenciaActiva, isLoading, isError, error } = usePaqueteTimeline(codigoPaquete)

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
            {/* Banner: transferencia activa (pendiente de recepción) */}
            <TransferenciaActivaBanner transferencia={transferenciaActiva} />

            {/* Banner de estado actual */}
            <EstadoBanner eventos={eventos} />

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
