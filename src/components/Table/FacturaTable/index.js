// src/components/Table/FacturaTable/index.js
'use client'

import { useFacturas } from '@/hooks/useFacturas'
import { useMutateFactura } from '@/hooks/useMutateFactura'
import { useSession } from '@/hooks/useSession'
import { dataGridStyles } from '@/styles/dataGridStyles'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useMemo, useCallback } from 'react'
import FacturaFilters from './FacturaFilters'
import { OptimizedChip, StatusChip, CurrencyCell, DateCell, FacturaActionButtons } from './OptimizedCells'

export default function FacturaTable({ onEdit }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { session } = useSession()
    const { data, count, isLoading, page, limit } = useFacturas()
    const { bulkUpdateFacturas } = useMutateFactura()
    const [selectedRows, setSelectedRows] = useState([])

    const rows = data?.data || []

    // Only SuperAdmin (1) and Admin (2) can change payment status
    const canChangePayment = session?.role?.id === 1 || session?.role?.id === 2

    const handlePageChange = useCallback((newPage) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', newPage + 1)
        setSelectedRows([])
        router.push(`?${params.toString()}`)
    }, [searchParams, router])

    const handlePageSizeChange = useCallback((newLimit) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('limit', newLimit)
        params.set('page', 1)
        setSelectedRows([])
        router.push(`?${params.toString()}`)
    }, [searchParams, router])

    const handleSelectAll = useCallback((e) => {
        if (e.target.checked) {
            setSelectedRows(rows)
        } else {
            setSelectedRows([])
        }
    }, [rows])

    const handleSelectOne = useCallback((row) => {
        setSelectedRows(prev => {
            const isSelected = prev.some(r => r.id === row.id)
            if (isSelected) return prev.filter(r => r.id !== row.id)
            return [...prev, row]
        })
    }, [])

    const handleBulkUpdate = useCallback(async (changes) => {
        const ids = selectedRows.map(r => r.id)
        await bulkUpdateFacturas.mutateAsync({ ids, ...changes })
        setSelectedRows([])
    }, [selectedRows, bulkUpdateFacturas])

    const columns = useMemo(() => [
        {
            field: 'select',
            headerName: '',
            width: 50,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderHeader: () => (
                <Checkbox
                    checked={rows.length > 0 && selectedRows.length === rows.length}
                    indeterminate={selectedRows.length > 0 && selectedRows.length < rows.length}
                    onChange={handleSelectAll}
                    sx={{ color: '#f4b223', '&.Mui-checked': { color: '#f4b223' }, '&.MuiCheckbox-indeterminate': { color: '#f4b223' } }}
                />
            ),
            renderCell: (params) => {
                const isSelected = selectedRows.some(r => r.id === params.row.id)
                return (
                    <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectOne(params.row)}
                        sx={{ color: '#f4b223', '&.Mui-checked': { color: '#f4b223' } }}
                    />
                )
            }
        },
        { field: 'id', headerName: 'Número', width: 80 },
        {
            field: 'cliente',
            headerName: 'Cliente',
            flex: 1,
            minWidth: 150,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            valueGetter: (value, row) =>
                row.cliente?.full_name || row.cliente?.email || '—',
            renderCell: (params) => params.value
        },
        {
            field: 'sucursal',
            headerName: 'Sucursal',
            flex: 1,
            minWidth: 160,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            valueGetter: (value, row) => row.sucursal?.name || '—',
            renderCell: (params) => <OptimizedChip label={params.value} />
        },
        {
            field: 'metodo_pago',
            headerName: 'Método de pago',
            flex: 1,
            minWidth: 150,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            valueGetter: (value, row) => row.metodo_pago?.name || '—',
            renderCell: (params) => <OptimizedChip label={params.value} />
        },
        {
            field: 'delivery_status',
            headerName: 'Estado Entrega',
            flex: 1,
            minWidth: 140,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <StatusChip
                    value={params.value}
                    trueLabel="Entregado"
                    falseLabel="Pendiente"
                />
            )
        },
        {
            field: 'payment_status',
            headerName: 'Estado Pago',
            flex: 1,
            minWidth: 140,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <StatusChip
                    value={params.value}
                    trueLabel="Pagado"
                    falseLabel="Pendiente"
                />
            )
        },
        {
            field: 'total',
            headerName: 'Total',
            flex: 1,
            minWidth: 120,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => <CurrencyCell value={params.value} />
        },
        {
            field: 'created_at',
            headerName: 'Fecha',
            flex: 1,
            minWidth: 180,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => <DateCell value={params.value} />
        },
        {
            field: 'accion',
            headerName: 'Acción',
            width: 120,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <FacturaActionButtons row={params.row} onEdit={onEdit} />
            )
        }
    ], [rows, selectedRows, handleSelectAll, handleSelectOne, onEdit])

    return (
        <Box sx={{ width: '100%' }}>
            {/* Filtros */}
            <FacturaFilters />

            {/* Barra de acciones masivas */}
            {selectedRows.length > 0 && (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    mb: 1,
                    backgroundColor: '#111',
                    border: '1px solid #f4b223',
                    borderRadius: 1,
                    flexWrap: 'wrap'
                }}>
                    <Chip
                        label={`${selectedRows.length} seleccionada${selectedRows.length > 1 ? 's' : ''}`}
                        size="small"
                        sx={{ backgroundColor: '#f4b223', color: '#000', fontWeight: 700 }}
                    />

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleBulkUpdate({ delivery_status: true })}
                            disabled={bulkUpdateFacturas.isPending}
                            sx={{ textTransform: 'none' }}
                        >
                            Marcar entregado
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleBulkUpdate({ delivery_status: false })}
                            disabled={bulkUpdateFacturas.isPending}
                            sx={{ textTransform: 'none', borderColor: '#666', color: '#aaa' }}
                        >
                            Pendiente entrega
                        </Button>

                        {canChangePayment && (
                            <>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="success"
                                    onClick={() => handleBulkUpdate({ payment_status: true })}
                                    disabled={bulkUpdateFacturas.isPending}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Marcar pagado
                                </Button>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleBulkUpdate({ payment_status: false })}
                                    disabled={bulkUpdateFacturas.isPending}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Pendiente pago
                                </Button>
                            </>
                        )}
                    </Box>

                    <Button
                        size="small"
                        variant="text"
                        onClick={() => setSelectedRows([])}
                        sx={{ ml: 'auto', color: '#666', textTransform: 'none' }}
                    >
                        Limpiar selección
                    </Button>
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
                        rows={rows}
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
        </Box>
    )
}
