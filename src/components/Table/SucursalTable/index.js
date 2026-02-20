'use client'

import { useSucursales } from '@/hooks/useSucursales'
import SucursalDetailModal from '@/components/Modal/SucursalDetailModal'
import { dataGridStyles } from '@/styles/dataGridStyles'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useCallback, useState } from 'react'
import SucursalFilters from './SucursalFilters'
import { EditIcon, VisibilityIcon } from '@/components/Icons'


import { OptimizedChip, StatusChip, CurrencyCell, DateCell } from './OptimizedCells'
/**
 * Alternative implementation with custom checkbox column
 * This avoids the bug with checkboxSelection prop
 */
export default function SucursalTable({ onEdit }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [selectedRows, setSelectedRows] = useState([])
    const [detailModalOpen, setDetailModalOpen] = useState(false)
    const [selectedSucursal, setSelectedSucursal] = useState(null)

    const { data, count, isLoading, page, limit } = useSucursales()

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

    const handleOpenDetail = useCallback((sucursal) => {
        setSelectedSucursal(sucursal)
        setDetailModalOpen(true)
    }, [])

    const handleCloseDetail = useCallback(() => {
        setDetailModalOpen(false)
        setSelectedSucursal(null)
    }, [])

    const handleSelectAll = useCallback((event) => {
        if (event.target.checked) {
            const newSelected = data?.data?.map((row) => row.id) || []
            setSelectedRows(newSelected)
        } else {
            setSelectedRows([])
        }
    }, [data])

    const handleSelectOne = useCallback((id) => {
        setSelectedRows((prev) => {
            if (prev.includes(id)) {
                return prev.filter((rowId) => rowId !== id)
            } else {
                return [...prev, id]
            }
        })
    }, [])

    const columns = useMemo(() => [
        {
            field: 'select',
            headerName: '',
            width: 60,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderHeader: () => (
                <Checkbox
                    checked={data?.data?.length > 0 && selectedRows.length === data?.data?.length}
                    indeterminate={selectedRows.length > 0 && selectedRows.length < (data?.data?.length || 0)}
                    onChange={handleSelectAll}
                    sx={{ color: '#f4b223', '&.Mui-checked': { color: '#f4b223' } }}
                />
            ),
            renderCell: (params) => (
                <Checkbox
                    checked={selectedRows.includes(params.row.id)}
                    onChange={() => handleSelectOne(params.row.id)}
                    sx={{ color: '#f4b223', '&.Mui-checked': { color: '#f4b223' } }}
                />
            )
        },
        {
            field: 'id',
            headerName: 'ID',
            width: 80,
            type: 'number'
        },
        {
            field: 'name',
            headerName: 'Nombre',
            flex: 1,
            minWidth: 150,
            type: 'string'
        },
        {
            field: 'address',
            headerName: 'Dirección',
            flex: 1.5,
            minWidth: 200,
            type: 'string'
        },
        {
            field: 'status',
            headerName: 'Estado',
            width: 140,
            type: 'boolean',
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Activo' : 'No activa'}
                    color={params.value ? 'success' : 'error'}
                    size="small"
                />
            )
        },
        {
            field: 'tasa',
            headerName: 'Tasa',
            width: 140,
            type: 'number'
        },
        {
            field: 'accion',
            headerName: 'Acción',
            width: 120,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton onClick={() => handleOpenDetail(params.row)} title="Ver detalle">
                        <VisibilityIcon sx={{ color: '#fff' }} />
                    </IconButton>
                    <IconButton onClick={() => onEdit(params.row)} title="Editar">
                        <EditIcon sx={{ color: '#fff' }} />
                    </IconButton>
                </Box>
            )
        }
    ], [onEdit, handleOpenDetail, selectedRows, data, handleSelectAll, handleSelectOne])

    return (
        <Box sx={{ width: '100%' }}>
            {/* Filtros */}
            <SucursalFilters />

            {/* Selected count indicator */}
            {selectedRows.length > 0 && (
                <Box sx={{
                    p: 2,
                    backgroundColor: 'rgba(244, 178, 35, 0.1)',
                    borderRadius: 1,
                    mb: 2,
                    border: '1px solid rgba(244, 178, 35, 0.3)'
                }}>
                    <Box sx={{ color: '#f4b223', fontWeight: 600 }}>
                        {selectedRows.length} sucursal{selectedRows.length > 1 ? 'es' : ''} seleccionada{selectedRows.length > 1 ? 's' : ''}
                    </Box>
                </Box>
            )}

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
                            if (pageSize !== limit) {
                                handlePageSizeChange(pageSize)
                            }
                            if (page !== Math.max(page - 1, 0)) {
                                handlePageChange(page)
                            }
                        }}
                        disableRowSelectionOnClick
                        getRowId={(row) => row.id}
                        sx={dataGridStyles}
        // ⚡ Performance optimizations
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
            <SucursalDetailModal
                open={detailModalOpen}
                onClose={handleCloseDetail}
                sucursal={selectedSucursal}
            />
        </Box>
    )
}
