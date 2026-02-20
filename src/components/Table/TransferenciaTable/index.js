'use client'

import { useTransferencias } from '@/hooks/useTransferencias'
import { useSession } from '@/hooks/useSession'
import { useMutateTransferencia } from '@/hooks/useMutateTransferencia'
import { dataGridStyles } from '@/styles/dataGridStyles'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useCallback, useState, useEffect } from 'react'
import TransferenciaFilters from './TransferenciaFilters'
import dynamic from 'next/dynamic'
import { SucursalChip, TotalAmount, StatusChip, ActionButtons } from './OptimizedCells'


// ⚡ Dynamic imports para reducir bundle inicial
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => ({ default: mod.PDFDownloadLink })),
  { ssr: false }
)
const TransferenciaPDF = dynamic(() => import('@/components/PDF/TransferenciaPDF'), {
  ssr: false
})

// Triggers PDF download outside the render phase to avoid setState-during-render errors.
function PDFTrigger({ url, loading, filename, onDone }) {
    useEffect(() => {
        if (!loading && url) {
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            link.click()
            onDone()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, loading])
    return null
}

// Hoist helper function outside component
const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export default function TransferenciaTable({ onEdit }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { session } = useSession()
    const { cancelTransferencia } = useMutateTransferencia()
    const [qrCodes, setQrCodes] = useState({})
    const [pdfDialogOpen, setPdfDialogOpen] = useState(false)
    const [selectedRow, setSelectedRow] = useState(null)
    const [cancelTarget, setCancelTarget] = useState(null)

    const { data, count, isLoading, page, limit } = useTransferencias()

    // ⚡ Generate QR code with dynamic import to reduce bundle
    const generateQRCode = useCallback(async (transferId) => {
        if (qrCodes[transferId]) return qrCodes[transferId]

        try {
            const QRCode = await import('qrcode')
            const trackingUrl = `${window.location.origin}/tracking/transferencia/${transferId}`
            const qrDataUrl = await QRCode.default.toDataURL(trackingUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#1256c4',
                    light: '#ffffff'
                }
            })
            setQrCodes(prev => ({ ...prev, [transferId]: qrDataUrl }))
            return qrDataUrl
        } catch (error) {
            console.error('Error generating QR code:', error)
            return null
        }
    }, [qrCodes])

    const handlePageChange = useCallback((newPage) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', newPage + 1)
        router.push(`?${params.toString()}`)
    }, [searchParams, router])

    const handlePageSizeChange = useCallback((newLimit) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('limit', newLimit)
        params.set('page', 1)
        router.push(`?${params.toString()}`)
    }, [searchParams, router])

    // Memoize permission check
    const canEdit = useMemo(() => {
        return session?.role?.id === 1 || session?.role?.id === 2
    }, [session?.role?.id])

    // Handle PDF download
    const handleDownloadPDF = useCallback(async (row) => {
        await generateQRCode(row.id)
        setSelectedRow(row)
        setPdfDialogOpen(true)
    }, [generateQRCode])

    // Handle cancel: open confirmation dialog
    const handleCancel = useCallback((row) => {
        setCancelTarget(row)
    }, [])

    // Handle confirmed cancellation
    const handleConfirmCancel = useCallback(async () => {
        if (!cancelTarget) return
        await cancelTransferencia.mutateAsync({
            id: cancelTarget.id,
            emisorSucursalId: cancelTarget.emisor_sucursal?.id ?? cancelTarget.emisor_sucursal_id,
            operadorId: session?.id
        })
        setCancelTarget(null)
    }, [cancelTarget, cancelTransferencia, session?.id])

    // ⚡ OPTIMIZED COLUMNS - Reduced complexity, memoized components
    const columns = useMemo(() => [
        {
            field: 'id',
            headerName: 'ID',
            width: 80,
            // Simple field, no renderCell needed
        },
        {
            field: 'emisor_sucursal',
            headerName: 'Sucursal Emisora',
            flex: 1,
            minWidth: 150,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            valueGetter: (value, row) => row.emisor_sucursal?.name || '—',
            renderCell: (params) => <SucursalChip name={params.value} />
        },
        {
            field: 'receptor_sucursal',
            headerName: 'Sucursal Receptora',
            flex: 1,
            minWidth: 150,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            valueGetter: (value, row) => row.receptor_sucursal?.name || '—',
            renderCell: (params) => <SucursalChip name={params.value} />
        },
        {
            field: 'total',
            headerName: 'Monto Total',
            width: 130,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => <TotalAmount value={params.value} />
        },
        {
            field: 'metodo_pago',
            headerName: 'Método de Pago',
            flex: 1,
            minWidth: 150,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            valueGetter: (value, row) => row.metodo_pago?.name || 'Pendiente',
            renderCell: (params) => <StatusChip status={params.value} type="metodo" />
        },
        {
            field: 'delivery_status',
            headerName: 'Estado Entrega',
            width: 140,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => <StatusChip status={params.value} type="delivery" />
        },
        {
            field: 'payment_status',
            headerName: 'Estado Pago',
            width: 140,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => <StatusChip status={params.value} type="payment" />
        },
        {
            field: 'created_at',
            headerName: 'Creado en',
            flex: 1,
            minWidth: 180,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            valueGetter: (value) => formatDate(value),
            // Use valueGetter instead of renderCell for better performance
        },
        {
            field: 'accion',
            headerName: 'Acción',
            width: 150,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <ActionButtons
                    row={params.row}
                    canEdit={canEdit}
                    canCancel={canEdit}
                    onEdit={onEdit}
                    onCancel={handleCancel}
                    onDownloadPDF={handleDownloadPDF}
                />
            )
        }
    ], [canEdit, onEdit, handleCancel, handleDownloadPDF])


    return (
        <Box sx={{ width: '100%' }}>
            {/* Filtros */}
            <TransferenciaFilters />

            {/* Tabla */}
            <Box sx={{ height: 500, width: '100%' }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <DataGrid
                        rows={data?.data || []}
                        columns={columns}
                        rowCount={count || 0}
                        paginationMode="server"
                        pageSizeOptions={[5, 10, 20]}
                        paginationModel={{
                            page: Math.max(page - 1, 0),
                            pageSize: limit
                        }}
                        onPaginationModelChange={({ page: newPage, pageSize: newPageSize }) => {
                            if (newPageSize !== limit) {
                                handlePageSizeChange(newPageSize)
                            } else {
                                handlePageChange(newPage)
                            }
                        }}
                        disableRowSelectionOnClick
                        sx={{
                            ...dataGridStyles,
                            // ⚡ Performance optimizations for horizontal scroll
                            '& .MuiDataGrid-virtualScroller': {
                                overscrollBehaviorX: 'contain',
                            },
                            '& .MuiDataGrid-row': {
                                willChange: 'transform',
                            }
                        }}
                        // ⚡ Enable column virtualization for better performance
                        columnBuffer={2}
                        columnThreshold={2}
                        // ⚡ Disable expensive features for better scroll performance
                        disableColumnResize
                        disableColumnReorder
                        // ⚡ Reduce render complexity
                        hideFooterSelectedRowCount
                    />
                )}
            </Box>

            {/* Cancel Confirmation Dialog */}
            <Dialog
                open={Boolean(cancelTarget)}
                onClose={() => setCancelTarget(null)}
                PaperProps={{ sx: { backgroundColor: '#1a1a1a', border: '1px solid #444' } }}
            >
                <DialogTitle sx={{ color: '#fff' }}>Cancelar transferencia</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: '#aaa' }}>
                        ¿Estás seguro de que deseas cancelar la transferencia #{cancelTarget?.id}?
                        Los paquetes quedarán disponibles nuevamente y esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setCancelTarget(null)}
                        disabled={cancelTransferencia.isPending}
                    >
                        Volver
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmCancel}
                        disabled={cancelTransferencia.isPending}
                    >
                        {cancelTransferencia.isPending ? 'Cancelando...' : 'Confirmar cancelación'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* PDF Dialog - Hidden component for PDF generation */}
            {pdfDialogOpen && selectedRow && (
                <PDFDownloadLink
                    document={
                        <TransferenciaPDF
                            data={{
                                ...selectedRow,
                                paquetes: selectedRow.solicitud_paquete?.map(sp => ({
                                    codigo: sp.paquete?.codigo || sp.paquete_id,
                                    tipo: sp.paquete?.tipo || 'N/A',
                                    peso: sp.paquete?.peso || 0,
                                    precio: sp.paquete?.precio || 0
                                })) || []
                            }}
                            qrCodeDataUrl={qrCodes[selectedRow.id] || null}
                        />
                    }
                    fileName={`Transferencia-${selectedRow.id}.pdf`}
                    style={{ display: 'none' }}
                >
                    {({ url, loading }) => (
                        <PDFTrigger
                            url={url}
                            loading={loading}
                            filename={`Transferencia-${selectedRow.id}.pdf`}
                            onDone={() => setPdfDialogOpen(false)}
                        />
                    )}
                </PDFDownloadLink>
            )}
        </Box>
    )
}
