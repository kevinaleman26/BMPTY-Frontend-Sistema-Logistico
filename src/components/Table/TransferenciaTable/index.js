'use client'

import { useTransferencias } from '@/hooks/useTransferencias'
import { dataGridStyles } from '@/styles/dataGridStyles'
import EditIcon from '@mui/icons-material/Edit'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useCallback } from 'react'
import TransferenciaFilters from './TransferenciaFilters'

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

    const { data, count, isLoading, page, limit } = useTransferencias()

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
            valueGetter: (value, row) => row.emisor_sucursal?.name || '—',
            renderCell: (params) => (
                <Chip label={params.value} color="primary" size="small" />
            )
        },
        {
            field: 'receptor_sucursal',
            headerName: 'Sucursal Receptora',
            flex: 1,
            valueGetter: (value, row) => row.receptor_sucursal?.name || '—',
            renderCell: (params) => (
                <Chip label={params.value} color="primary" size="small" />
            )
        },
        {
            field: 'metodo_pago',
            headerName: 'Método de Pago',
            flex: 1,
            valueGetter: (value, row) => row.metodo_pago?.name || '—',
            renderCell: (params) => (
                <Chip label={params.value} color="primary" size="small" />
            )
        },
        {
            field: 'delivery_status',
            headerName: 'Estado Entrega',
            width: 140,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Entregado' : 'Pendiente'}
                    color={params.value ? 'success' : 'error'}
                    size="small"
                />
            )
        },
        {
            field: 'payment_status',
            headerName: 'Estado Pago',
            width: 140,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Pagado' : 'Pendiente'}
                    color={params.value ? 'success' : 'error'}
                    size="small"
                />
            )
        },
        {
            field: 'created_at',
            headerName: 'Creado en',
            flex: 1,
            renderCell: (params) => formatDate(params.value)
        },
        {
            field: 'accion',
            headerName: 'Acción',
            width: 120,
            renderCell: (params) => (
                <IconButton onClick={() => onEdit(params.row)}>
                    <EditIcon sx={{ color: '#fff' }} />
                </IconButton>
            )
        }
    ], [onEdit])


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
