'use client'

import { useTransferencias } from '@/hooks/useTransferencias'
import { useSession } from '@/hooks/useSession'
import { dataGridStyles } from '@/styles/dataGridStyles'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useCallback, useState } from 'react'
import TransferenciaFilters from './TransferenciaFilters'
import dynamic from 'next/dynamic'
import { EditIcon, DescriptionIcon } from '@/components/Icons'


// ⚡ Dynamic imports para reducir bundle inicial
// PDF y QRCode se cargarán solo cuando se necesiten
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => ({ default: mod.PDFDownloadLink })),
  { ssr: false }
)
const TransferenciaPDF = dynamic(() => import('@/components/PDF/TransferenciaPDF'), {
  ssr: false
})

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
    const [qrCodes, setQrCodes] = useState({})

    const { data, count, isLoading, page, limit } = useTransferencias()

    // ⚡ Generate QR code with dynamic import to reduce bundle
    const generateQRCode = useCallback(async (transferId) => {
        if (qrCodes[transferId]) return qrCodes[transferId]

        try {
            // Lazy load QRCode library only when generating QR
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

    const columns = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 80 },
        {
            field: 'emisor_sucursal',
            headerName: 'Sucursal Emisora',
            flex: 1,
            minWidth: 150,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            valueGetter: (value, row) => row.emisor_sucursal?.name || '—',
            renderCell: (params) => (
                <Chip label={params.value} color="primary" size="small" />
            )
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
            renderCell: (params) => (
                <Chip label={params.value} color="primary" size="small" />
            )
        },
        {
            field: 'total',
            headerName: 'Monto Total',
            width: 130,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Box sx={{
                    fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace',
                    fontWeight: 600,
                    color: '#f4b223'
                }}>
                    ${Number(params.value || 0).toFixed(2)}
                </Box>
            )
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
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={params.value === 'Pendiente' ? 'default' : 'primary'}
                    size="small"
                />
            )
        },
        {
            field: 'delivery_status',
            headerName: 'Estado Entrega',
            width: 140,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Recibida' : 'Pendiente'}
                    color={params.value ? 'success' : 'warning'}
                    size="small"
                />
            )
        },
        {
            field: 'payment_status',
            headerName: 'Estado Pago',
            width: 140,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Pagada' : 'Pendiente'}
                    color={params.value ? 'success' : 'error'}
                    size="small"
                />
            )
        },
        {
            field: 'created_at',
            headerName: 'Creado en',
            flex: 1,
            minWidth: 180,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => formatDate(params.value)
        },
        {
            field: 'accion',
            headerName: 'Acción',
            width: 150,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => {
                // SuperAdmin y Admin pueden editar, Operador solo ve PDF
                const canEdit = session?.role?.id === 1 || session?.role?.id === 2

                return (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {/* PDF Download Button */}
                        <PDFDownloadLink
                            document={
                                <TransferenciaPDF
                                    data={{
                                        ...params.row,
                                        paquetes: params.row.solicitud_paquete?.map(sp => ({
                                            codigo: sp.paquete?.codigo || sp.paquete_id,
                                            tipo: sp.paquete?.tipo || 'N/A',
                                            peso: sp.paquete?.peso || 0,
                                            precio: sp.paquete?.precio || 0
                                        })) || []
                                    }}
                                    qrCodeDataUrl={qrCodes[params.row.id] || null}
                                />
                            }
                            fileName={`Transferencia-${params.row.id}.pdf`}
                            style={{ textDecoration: 'none' }}
                            onClick={() => generateQRCode(params.row.id)}
                        >
                            {({ loading }) => (
                                <Tooltip title="Descargar PDF">
                                    <IconButton size="small" disabled={loading}>
                                        <DescriptionIcon sx={{ color: '#f4b223' }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </PDFDownloadLink>

                        {/* Edit Button - Only for SuperAdmin and Admin */}
                        {canEdit && (
                            <Tooltip title="Editar">
                                <IconButton onClick={() => onEdit(params.row)} size="small">
                                    <EditIcon sx={{ color: '#fff' }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                )
            }
        }
    ], [onEdit, session, qrCodes, generateQRCode])


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
                        onPaginationModelChange={({ page, pageSize }) => {
                            handlePageChange(page)
                            handlePageSizeChange(pageSize)
                        }}
                        disableRowSelectionOnClick
                        sx={dataGridStyles}
                    />
                )}
            </Box>
        </Box>
    )
}
