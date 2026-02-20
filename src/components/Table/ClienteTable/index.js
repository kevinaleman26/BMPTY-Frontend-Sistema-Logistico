'use client'

import { useClientes } from '@/hooks/useClientes'
import { dataGridStyles } from '@/styles/dataGridStyles'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useCallback, useState } from 'react'
import ClienteFilters from './ClienteFilters'
import ClienteDetailModal from '@/components/Modal/ClienteDetailModal'
import { EditIcon, VisibilityIcon } from '@/components/Icons'


import { OptimizedChip, StatusChip, CurrencyCell, DateCell } from './OptimizedCells'
export default function ClienteTable({ onEdit }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [detailModalOpen, setDetailModalOpen] = useState(false)
    const [selectedCliente, setSelectedCliente] = useState(null)

    const { data, count, isLoading, page, limit } = useClientes()

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

    const handleViewDetail = useCallback((cliente) => {
        setSelectedCliente(cliente)
        setDetailModalOpen(true)
    }, [])

    const handleCloseDetail = useCallback(() => {
        setDetailModalOpen(false)
        setSelectedCliente(null)
    }, [])

    const columns = useMemo(() => [
        {
            field: 'sucursal',
            headerName: 'Sucursal',
            width: 160,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            valueGetter: (value, row) => row.sucursal?.name || '—',
            renderCell: (params) => (
                <Chip label={params.value} color="primary" size="small" />
            )
        },
        {
            field: 'codigo',
            headerName: 'Código',
            width: 120,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Box sx={{
                    fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace',
                    fontWeight: 600,
                    color: '#f4b223'
                }}>
                    {params.value || '-'}
                </Box>
            )
        },
        { field: 'full_name', headerName: 'Nombre', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        {
            field: 'tipo_documento',
            headerName: 'Tipo Documento',
            width: 160,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            valueGetter: (value, row) => row.tipo_documento?.name || '—',
            renderCell: (params) => (
                <Chip label={params.value} color="secondary" size="small" />
            )
        },
        { field: 'document', headerName: 'Documento', width: 140 },
        {
            field: 'accion',
            headerName: 'Acción',
            width: 120,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Ver detalle">
                        <IconButton onClick={() => handleViewDetail(params.row)} size="small">
                            <VisibilityIcon sx={{ color: '#f4b223' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                        <IconButton onClick={() => onEdit(params.row)} size="small">
                            <EditIcon sx={{ color: '#fff' }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ], [onEdit, handleViewDetail])

    return (
        <Box sx={{ width: '100%' }}>
            {/* Filtros */}
            <ClienteFilters />

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
                        columnBuffer={2}
                        columnThreshold={2}
                        disableColumnResize
                        disableColumnReorder
                        hideFooterSelectedRowCount
                        sx={{
                            ...dataGridStyles,
                            '& .MuiDataGrid-virtualScroller': {
                                overscrollBehaviorX: 'contain',
                            },
                            '& .MuiDataGrid-row': {
                                willChange: 'transform',
                            }
                        }}
                    />
                )}
            </Box>

            {/* Modal de Detalle */}
            <ClienteDetailModal
                open={detailModalOpen}
                onClose={handleCloseDetail}
                cliente={selectedCliente}
            />
        </Box>
    )
}
