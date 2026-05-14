'use client'

import { useClientePackages } from '@/hooks/useClientePackages'
import { useClienteFacturas } from '@/hooks/useClienteFacturas'
import { useClientePaquetes } from '@/hooks/useClientePaquetes'
import { tokens } from '@/styles/tokens'
import PaymentIcon from '@mui/icons-material/Payment'
import MoneyOffIcon from '@mui/icons-material/MoneyOff'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ReceiptIcon from '@mui/icons-material/Receipt'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import TimelineIcon from '@mui/icons-material/Timeline'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import { DataGrid } from '@mui/x-data-grid'
import { dataGridStyles } from '@/styles/dataGridStyles'
import PaqueteTimelineModal from '@/components/Modal/PaqueteTimelineModal'
import { useMemo, useState, useCallback, useEffect } from 'react'
import { CloseIcon } from '@/components/Icons'

const PAGE_SIZE_OPTIONS = [5, 10, 25]

export default function ClienteDetailModal({ open, onClose, cliente }) {
    // Summary: totals and counts (lightweight query, no joins to details)
    const { paidCount, unpaidCount, totalPaid, totalUnpaid, isLoading } = useClientePackages(cliente?.id)

    // Pagination state — one per table, reset when cliente changes
    const [paidFacturasPM, setPaidFacturasPM] = useState({ page: 0, pageSize: 5 })
    const [unpaidFacturasPM, setUnpaidFacturasPM] = useState({ page: 0, pageSize: 5 })
    const [deliveredPM, setDeliveredPM] = useState({ page: 0, pageSize: 5 })
    const [pendingPM, setPendingPM] = useState({ page: 0, pageSize: 5 })

    useEffect(() => {
        setPaidFacturasPM({ page: 0, pageSize: 5 })
        setUnpaidFacturasPM({ page: 0, pageSize: 5 })
        setDeliveredPM({ page: 0, pageSize: 5 })
        setPendingPM({ page: 0, pageSize: 5 })
    }, [cliente?.id])

    // Server-side paginated queries — only fetch current page
    const { data: paidFacturasData, isFetching: fetchingPaidFacturas } = useClienteFacturas(
        cliente?.id, { ...paidFacturasPM, paymentStatus: true }
    )
    const { data: unpaidFacturasData, isFetching: fetchingUnpaidFacturas } = useClienteFacturas(
        cliente?.id, { ...unpaidFacturasPM, paymentStatus: false }
    )
    const { data: deliveredData, isFetching: fetchingDelivered } = useClientePaquetes(
        cliente?.id, { ...deliveredPM, deliveryStatus: true }
    )
    const { data: pendingData, isFetching: fetchingPending } = useClientePaquetes(
        cliente?.id, { ...pendingPM, deliveryStatus: false }
    )

    const [timelineModalOpen, setTimelineModalOpen] = useState(false)
    const [selectedPackageCode, setSelectedPackageCode] = useState(null)

    const handleOpenTimeline = useCallback((codigo) => {
        setSelectedPackageCode(codigo)
        setTimelineModalOpen(true)
    }, [])

    const handleCloseTimeline = useCallback(() => {
        setTimelineModalOpen(false)
        setSelectedPackageCode(null)
    }, [])

    const invoiceColumns = useMemo(() => [
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
            field: 'paquetes',
            headerName: 'Paquetes',
            width: 100,
            valueGetter: (value, row) => row.factura_detalle?.length || 0
        },
        {
            field: 'sucursal',
            headerName: 'Sucursal',
            flex: 1,
            minWidth: 150,
            valueGetter: (value, row) => row.sucursal?.name || '—'
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
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            valueGetter: (value, row) => `$${row.total?.toFixed(2) || '0.00'}`,
            renderCell: (params) => (
                <Typography sx={{ fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace', fontWeight: 600 }}>
                    {params.value}
                </Typography>
            )
        }
    ], [])

    const packageColumns = useMemo(() => [
        {
            field: 'factura_id',
            headerName: 'Factura',
            width: 100,
        },
        {
            field: 'codigo',
            headerName: 'Código',
            width: 180,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace', fontWeight: 600 }}>
                        {params.value}
                    </Typography>
                    <Tooltip title="Ver cronología">
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleOpenTimeline(params.value)
                            }}
                            sx={{
                                color: tokens.accent.secondary,
                                '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.1)' }
                            }}
                        >
                            <TimelineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        },
        {
            field: 'tipo',
            headerName: 'Tipo',
            width: 120,
        },
        {
            field: 'peso',
            headerName: 'Peso (kg)',
            width: 110,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            valueGetter: (value) => `${value || 0} kg`,
            renderCell: (params) => (
                <Typography sx={{ fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'dimensiones',
            headerName: 'Dimensiones',
            width: 160,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            valueGetter: (value, row) => `${row.largo || 0}×${row.alto || 0}×${row.ancho || 0}`,
            renderCell: (params) => (
                <Typography sx={{ fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace', fontSize: '0.8125rem' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'sucursal',
            headerName: 'Sucursal',
            flex: 1,
            minWidth: 120,
        },
        {
            field: 'precio',
            headerName: 'Precio',
            width: 110,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            valueGetter: (value) => `$${value?.toFixed(2) || '0.00'}`,
            renderCell: (params) => (
                <Typography sx={{ fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace', fontWeight: 600 }}>
                    {params.value}
                </Typography>
            )
        }
    ], [handleOpenTimeline])

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
            <DialogTitle sx={{ borderBottom: `1px solid ${tokens.border.soft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: tokens.text.emphasis, fontWeight: 600 }}>
                    Detalle del Cliente
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
                        {/* Información del Cliente */}
                        <Box sx={{ mb: 4, p: 3, backgroundColor: tokens.surface.elevated, borderRadius: '8px', border: `1px solid ${tokens.border.subtle}` }}>
                            <Typography variant="h6" sx={{ color: tokens.text.emphasis, mb: 2 }}>
                                {cliente?.full_name}
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Email
                                    </Typography>
                                    <Typography sx={{ color: tokens.text.primary }}>{cliente?.email}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Teléfono
                                    </Typography>
                                    <Typography sx={{ color: tokens.text.primary }}>{cliente?.phone || '—'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Documento
                                    </Typography>
                                    <Typography sx={{ color: tokens.text.primary }}>{cliente?.document}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Sucursal
                                    </Typography>
                                    <Typography sx={{ color: tokens.text.primary }}>{cliente?.sucursal?.name || '—'}</Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Cards de Totales */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 4 }}>
                            <Box sx={{
                                p: 3,
                                backgroundColor: tokens.surface.elevated,
                                borderRadius: '8px',
                                border: `1px solid ${tokens.border.soft}`,
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#4caf50' }
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: '8px', backgroundColor: 'rgba(76, 175, 80, 0.15)', border: '1px solid rgba(76, 175, 80, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <PaymentIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                                    </Box>
                                    <Typography sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem', fontWeight: 600 }}>
                                        Total Pagado
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: tokens.text.emphasis, fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace' }}>
                                    ${totalPaid.toFixed(2)}
                                </Typography>
                                <Typography sx={{ fontSize: '0.875rem', color: tokens.text.secondary, mt: 1 }}>
                                    {paidCount} {paidCount === 1 ? 'factura' : 'facturas'}
                                </Typography>
                            </Box>

                            <Box sx={{
                                p: 3,
                                backgroundColor: tokens.surface.elevated,
                                borderRadius: '8px',
                                border: `1px solid ${tokens.border.soft}`,
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#ff9800' }
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: '8px', backgroundColor: 'rgba(255, 152, 0, 0.15)', border: '1px solid rgba(255, 152, 0, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MoneyOffIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                                    </Box>
                                    <Typography sx={{ color: tokens.text.secondary, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem', fontWeight: 600 }}>
                                        Total Adeudado
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: tokens.text.emphasis, fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace' }}>
                                    ${totalUnpaid.toFixed(2)}
                                </Typography>
                                <Typography sx={{ fontSize: '0.875rem', color: tokens.text.secondary, mt: 1 }}>
                                    {unpaidCount} {unpaidCount === 1 ? 'factura' : 'facturas'}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Accordion de Facturas */}
                        <Accordion
                            defaultExpanded
                            sx={{
                                backgroundColor: tokens.surface.elevated,
                                border: `1px solid ${tokens.border.soft}`,
                                borderRadius: '8px',
                                mb: 2,
                                '&:before': { display: 'none' },
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: tokens.text.primary }} />}
                                sx={{ backgroundColor: 'transparent', borderBottom: `1px solid ${tokens.border.subtle}`, '&:hover': { backgroundColor: 'rgba(244, 178, 35, 0.05)' } }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: '8px', backgroundColor: 'rgba(244, 178, 35, 0.15)', border: '1px solid rgba(244, 178, 35, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ReceiptIcon sx={{ color: tokens.accent.primary, fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: tokens.text.emphasis, fontWeight: 600, fontSize: '1.125rem' }}>
                                            Facturas
                                        </Typography>
                                        <Typography sx={{ color: tokens.text.secondary, fontSize: '0.875rem' }}>
                                            {paidCount + unpaidCount} facturas ({paidCount} pagadas, {unpaidCount} pendientes)
                                        </Typography>
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 3 }}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" sx={{ color: tokens.text.emphasis, mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                                        Facturas Pagadas ({paidFacturasData?.total ?? paidCount})
                                    </Typography>
                                    <Box sx={{ height: 300, width: '100%' }}>
                                        <DataGrid
                                            rows={paidFacturasData?.rows || []}
                                            columns={invoiceColumns}
                                            rowCount={paidFacturasData?.total ?? 0}
                                            paginationMode="server"
                                            paginationModel={paidFacturasPM}
                                            onPaginationModelChange={setPaidFacturasPM}
                                            pageSizeOptions={PAGE_SIZE_OPTIONS}
                                            loading={fetchingPaidFacturas}
                                            disableRowSelectionOnClick
                                            sx={dataGridStyles}
                                            localeText={{ noRowsLabel: 'No hay facturas pagadas' }}
                                        />
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="h6" sx={{ color: tokens.text.emphasis, mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                                        Facturas Pendientes ({unpaidFacturasData?.total ?? unpaidCount})
                                    </Typography>
                                    <Box sx={{ height: 300, width: '100%' }}>
                                        <DataGrid
                                            rows={unpaidFacturasData?.rows || []}
                                            columns={invoiceColumns}
                                            rowCount={unpaidFacturasData?.total ?? 0}
                                            paginationMode="server"
                                            paginationModel={unpaidFacturasPM}
                                            onPaginationModelChange={setUnpaidFacturasPM}
                                            pageSizeOptions={PAGE_SIZE_OPTIONS}
                                            loading={fetchingUnpaidFacturas}
                                            disableRowSelectionOnClick
                                            sx={dataGridStyles}
                                            localeText={{ noRowsLabel: 'No hay facturas pendientes' }}
                                        />
                                    </Box>
                                </Box>
                            </AccordionDetails>
                        </Accordion>

                        {/* Accordion de Paquetes */}
                        <Accordion
                            defaultExpanded
                            sx={{
                                backgroundColor: tokens.surface.elevated,
                                border: `1px solid ${tokens.border.soft}`,
                                borderRadius: '8px',
                                '&:before': { display: 'none' },
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: tokens.text.primary }} />}
                                sx={{ backgroundColor: 'transparent', borderBottom: `1px solid ${tokens.border.subtle}`, '&:hover': { backgroundColor: 'rgba(244, 178, 35, 0.05)' } }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: '8px', backgroundColor: 'rgba(33, 150, 243, 0.15)', border: '1px solid rgba(33, 150, 243, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <LocalShippingIcon sx={{ color: tokens.accent.secondary, fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: tokens.text.emphasis, fontWeight: 600, fontSize: '1.125rem' }}>
                                            Paquetes
                                        </Typography>
                                        <Typography sx={{ color: tokens.text.secondary, fontSize: '0.875rem' }}>
                                            {(deliveredData?.total ?? 0) + (pendingData?.total ?? 0)} paquetes ({deliveredData?.total ?? 0} entregados, {pendingData?.total ?? 0} pendientes)
                                        </Typography>
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 3 }}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" sx={{ color: tokens.text.emphasis, mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                                        Paquetes Entregados ({deliveredData?.total ?? 0})
                                    </Typography>
                                    <Box sx={{ height: 350, width: '100%' }}>
                                        <DataGrid
                                            rows={deliveredData?.rows || []}
                                            columns={packageColumns}
                                            rowCount={deliveredData?.total ?? 0}
                                            paginationMode="server"
                                            paginationModel={deliveredPM}
                                            onPaginationModelChange={setDeliveredPM}
                                            pageSizeOptions={PAGE_SIZE_OPTIONS}
                                            loading={fetchingDelivered}
                                            disableRowSelectionOnClick
                                            sx={dataGridStyles}
                                            localeText={{ noRowsLabel: 'No hay paquetes entregados' }}
                                        />
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="h6" sx={{ color: tokens.text.emphasis, mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                                        Paquetes Pendientes de Entrega ({pendingData?.total ?? 0})
                                    </Typography>
                                    <Box sx={{ height: 350, width: '100%' }}>
                                        <DataGrid
                                            rows={pendingData?.rows || []}
                                            columns={packageColumns}
                                            rowCount={pendingData?.total ?? 0}
                                            paginationMode="server"
                                            paginationModel={pendingPM}
                                            onPaginationModelChange={setPendingPM}
                                            pageSizeOptions={PAGE_SIZE_OPTIONS}
                                            loading={fetchingPending}
                                            disableRowSelectionOnClick
                                            sx={dataGridStyles}
                                            localeText={{ noRowsLabel: 'No hay paquetes pendientes de entrega' }}
                                        />
                                    </Box>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                )}
            </DialogContent>

            <PaqueteTimelineModal
                open={timelineModalOpen}
                onClose={handleCloseTimeline}
                codigoPaquete={selectedPackageCode}
            />
        </Dialog>
    )
}
