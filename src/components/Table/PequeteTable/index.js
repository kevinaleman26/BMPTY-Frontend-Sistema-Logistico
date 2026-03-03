'use client'

import { usePaquetes } from '@/hooks/usePaquetes'
import { dataGridStyles } from '@/styles/dataGridStyles'
import { tokens } from '@/styles/tokens'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useCallback, useState } from 'react'
import PaqueteFilters from './PaqueteFilters'
import ReceiptIcon from '@mui/icons-material/Receipt'
import PaqueteDetailModal from '@/components/Modal/PaqueteDetailModal'
import PaqueteEditModal from '@/components/Modal/PaqueteEditModal'
import { EditIcon, VisibilityIcon } from '@/components/Icons'


import { OptimizedChip, StatusChip, CurrencyCell, DateCell } from './OptimizedCells'
export default function PaqueteTable({ onEdit }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data, count, isLoading, page, limit, orderBy, orderDir } = usePaquetes()

    const sortModel = useMemo(() => [{ field: orderBy, sort: orderDir }], [orderBy, orderDir])

    const handleSortModelChange = useCallback((model) => {
        const params = new URLSearchParams(searchParams.toString())
        if (model.length > 0) {
            params.set('orderBy', model[0].field)
            params.set('orderDir', model[0].sort || 'desc')
        } else {
            params.set('orderBy', 'codigo')
            params.set('orderDir', 'desc')
        }
        params.set('page', '1')
        router.push(`?${params.toString()}`)
    }, [searchParams, router])

    const [detailModalOpen, setDetailModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedPaquete, setSelectedPaquete] = useState(null)

    const handleViewDetail = (paquete) => {
        setSelectedPaquete(paquete)
        setDetailModalOpen(true)
    }

    const handleEdit = (paquete) => {
        setSelectedPaquete(paquete)
        setEditModalOpen(true)
    }

    const handleCloseDetailModal = () => {
        setDetailModalOpen(false)
        setSelectedPaquete(null)
    }

    const handleCloseEditModal = () => {
        setEditModalOpen(false)
        setSelectedPaquete(null)
    }

    const columns = useMemo(() => [
        {
            field: 'codigo',
            headerName: 'Código',
            flex: 1,
            minWidth: 150,
            filterable: false,
            renderCell: (params) => (
                <Box sx={{ fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace', fontWeight: 600 }}>
                    {params.value}
                </Box>
            )
        },
        { field: 'tipo', headerName: 'Tipo', width: 120, filterable: false },
        {
            field: 'peso',
            headerName: 'Peso (kg)',
            type: 'number',
            width: 120,
            filterable: false,
            renderCell: (params) => (
                <Box sx={{ fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace', fontWeight: 600 }}>
                    {params.value}
                </Box>
            )
        },
        { field: 'largo', headerName: 'Largo (cm)', type: 'number', width: 100, filterable: false },
        { field: 'alto', headerName: 'Alto (cm)', type: 'number', width: 100, filterable: false },
        { field: 'ancho', headerName: 'Ancho (cm)', type: 'number', width: 100, filterable: false },
        {
            field: 'precio',
            headerName: 'Precio',
            type: 'number',
            width: 120,
            filterable: false,
            renderCell: (params) => (
                <Box sx={{ fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace', fontWeight: 600, color: tokens.accent.primary }}>
                    ${params.value?.toFixed(2)}
                </Box>
            )
        },
        {
            field: 'facturado',
            headerName: 'Facturado',
            width: 120,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Sí' : 'No'}
                    size="small"
                    sx={{
                        backgroundColor: params.value
                            ? 'rgba(76, 175, 80, 0.2)'  // Verde claro
                            : 'rgba(33, 150, 243, 0.2)', // Celeste claro
                        color: params.value
                            ? '#4caf50'  // Verde
                            : '#2196f3', // Celeste
                        border: params.value
                            ? '1px solid rgba(76, 175, 80, 0.4)'
                            : '1px solid rgba(33, 150, 243, 0.4)',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: '24px',
                        '& .MuiChip-label': {
                            px: 1.5
                        }
                    }}
                />
            )
        },
        {
            field: 'acciones',
            headerName: 'Acciones',
            width: 180,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Tooltip title="Ver detalles y cronología">
                        <IconButton
                            size="small"
                            onClick={() => handleViewDetail(params.row)}
                            sx={{
                                color: tokens.accent.primary,
                                '&:hover': {
                                    backgroundColor: 'rgba(244, 178, 35, 0.1)'
                                }
                            }}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar paquete">
                        <IconButton
                            size="small"
                            onClick={() => handleEdit(params.row)}
                            sx={{
                                color: '#2196f3',
                                '&:hover': {
                                    backgroundColor: 'rgba(33, 150, 243, 0.1)'
                                }
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ], [])

    const handlePaginationChange = useCallback(({ page: newPage, pageSize: newPageSize }) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', newPage + 1)
        params.set('limit', newPageSize)
        router.push(`?${params.toString()}`)
    }, [searchParams, router])

    return (
        <Box width="100%">
            <PaqueteFilters />
            <Box height={500}>
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
                        onPaginationModelChange={handlePaginationChange}
                        sortingMode="server"
                        sortModel={sortModel}
                        onSortModelChange={handleSortModelChange}
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

            {/* Modales */}
            <PaqueteDetailModal
                open={detailModalOpen}
                onClose={handleCloseDetailModal}
                paquete={selectedPaquete}
            />

            <PaqueteEditModal
                open={editModalOpen}
                onClose={handleCloseEditModal}
                paquete={selectedPaquete}
            />
        </Box>
    )
}
