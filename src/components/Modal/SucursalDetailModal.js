'use client'

import { useSucursalPackages } from '@/hooks/useSucursalPackages'
import { tokens } from '@/styles/tokens'
import CloseIcon from '@mui/icons-material/Close'
import PaymentIcon from '@mui/icons-material/Payment'
import MoneyOffIcon from '@mui/icons-material/MoneyOff'
import StoreIcon from '@mui/icons-material/Store'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import { DataGrid } from '@mui/x-data-grid'
import { dataGridStyles } from '@/styles/dataGridStyles'
import { useMemo } from 'react'

/**
 * Modal de detalle de la sucursal
 * Muestra información de la sucursal, paquetes pagados, paquetes pendientes y totales
 */
export default function SucursalDetailModal({ open, onClose, sucursal }) {
    const { paid, unpaid, totalPaid, totalUnpaid, isLoading } = useSucursalPackages(sucursal?.id)

    // Columnas para las tablas de paquetes
    const columns = useMemo(() => [
        {
            field: 'factura_id',
            headerName: 'Factura',
            width: 100,
            valueGetter: (value, row) => row.id
        },
        {
            field: 'fecha',
            headerName: 'Fecha',
            width: 120,
            valueGetter: (value, row) => new Date(row.created_at).toLocaleDateString('es-ES')
        },
        {
            field: 'cliente',
            headerName: 'Cliente',
            flex: 1,
            valueGetter: (value, row) => row.cliente?.full_name || '—'
        },
        {
            field: 'paquetes',
            headerName: 'Paquetes',
            width: 100,
            valueGetter: (value, row) => row.factura_detalle?.length || 0
        },
        {
            field: 'metodo_pago',
            headerName: 'Método Pago',
            width: 140,
            valueGetter: (value, row) => row.metodo_pago?.name || '—'
        },
        {
            field: 'total',
            headerName: 'Total',
            width: 120,
            valueGetter: (value, row) => `$${row.total?.toFixed(2) || '0.00'}`,
            renderCell: (params) => (
                <Typography sx={{ fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace', fontWeight: 600 }}>
                    {params.value}
                </Typography>
            )
        }
    ], [])

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
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
            <DialogTitle sx={{ borderBottom: `1px solid ${tokens.border.soft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: tokens.text.emphasis, fontWeight: 600 }}>
                    Detalle de la Sucursal
                </Typography>
                <IconButton onClick={onClose} sx={{ color: tokens.text.secondary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                        <CircularProgress sx={{ color: tokens.accent.primary }} />
                    </Box>
                ) : (
                    <Box>
                        {/* Información de la Sucursal */}
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
                                    <StoreIcon sx={{ color: tokens.accent.primary, fontSize: 24 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ color: tokens.text.emphasis }}>
                                        {sucursal?.name}
                                    </Typography>
                                    <Chip 
                                        label={sucursal?.status ? 'Activo' : 'Inactivo'} 
                                        color={sucursal?.status ? 'success' : 'error'} 
                                        size="small"
                                        sx={{ mt: 0.5 }}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Dirección
                                    </Typography>
                                    <Typography sx={{ color: tokens.text.primary }}>{sucursal?.address || '—'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        RUC
                                    </Typography>
                                    <Typography sx={{ color: tokens.text.primary, fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace' }}>
                                        {sucursal?.ruc || '—'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Tasa
                                    </Typography>
                                    <Typography sx={{ color: tokens.text.primary, fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace', fontWeight: 600 }}>
                                        {sucursal?.tasa || '—'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Teléfono
                                    </Typography>
                                    <Typography sx={{ color: tokens.text.primary }}>{sucursal?.phone || '—'}</Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Cards de Totales */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 4 }}>
                            {/* Total Pagado */}
                            <Box sx={{
                                p: 3,
                                backgroundColor: tokens.surface.elevated,
                                borderRadius: '8px',
                                border: `1px solid ${tokens.border.soft}`,
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: '#4caf50'
                                }
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
                                        <PaymentIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                                    </Box>
                                    <Typography sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem', fontWeight: 600 }}>
                                        Total Facturado Pagado
                                    </Typography>
                                </Box>
                                <Typography sx={{
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                    color: tokens.text.emphasis,
                                    fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace'
                                }}>
                                    ${totalPaid.toFixed(2)}
                                </Typography>
                                <Typography sx={{ fontSize: '0.875rem', color: tokens.text.secondary, mt: 1 }}>
                                    {paid.length} {paid.length === 1 ? 'factura' : 'facturas'}
                                </Typography>
                            </Box>

                            {/* Total Adeudado */}
                            <Box sx={{
                                p: 3,
                                backgroundColor: tokens.surface.elevated,
                                borderRadius: '8px',
                                border: `1px solid ${tokens.border.soft}`,
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: '#ff9800'
                                }
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
                                        <MoneyOffIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                                    </Box>
                                    <Typography sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem', fontWeight: 600 }}>
                                        Total Facturado Pendiente
                                    </Typography>
                                </Box>
                                <Typography sx={{
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                    color: tokens.text.emphasis,
                                    fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace'
                                }}>
                                    ${totalUnpaid.toFixed(2)}
                                </Typography>
                                <Typography sx={{ fontSize: '0.875rem', color: tokens.text.secondary, mt: 1 }}>
                                    {unpaid.length} {unpaid.length === 1 ? 'factura' : 'facturas'}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Tabla de Facturas Pagadas */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ color: tokens.text.emphasis, mb: 2, fontSize: '1.125rem', fontWeight: 600 }}>
                                Facturas Pagadas ({paid.length})
                            </Typography>
                            <Box sx={{ height: 300, width: '100%' }}>
                                <DataGrid
                                    rows={paid}
                                    columns={columns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5]}
                                    disableRowSelectionOnClick
                                    sx={dataGridStyles}
                                    localeText={{
                                        noRowsLabel: 'No hay facturas pagadas',
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Tabla de Facturas Pendientes */}
                        <Box>
                            <Typography variant="h6" sx={{ color: tokens.text.emphasis, mb: 2, fontSize: '1.125rem', fontWeight: 600 }}>
                                Facturas Pendientes ({unpaid.length})
                            </Typography>
                            <Box sx={{ height: 300, width: '100%' }}>
                                <DataGrid
                                    rows={unpaid}
                                    columns={columns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5]}
                                    disableRowSelectionOnClick
                                    sx={dataGridStyles}
                                    localeText={{
                                        noRowsLabel: 'No hay facturas pendientes',
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    )
}
