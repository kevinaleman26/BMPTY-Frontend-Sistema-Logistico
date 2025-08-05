'use client'

import { useSucursales } from '@/hooks/useSucursales'
import EditIcon from '@mui/icons-material/Edit'
import { Box, Chip, CircularProgress, IconButton } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import SucursalFilters from './SucursalFilters'

export default function SucursalTable({ onEdit }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const { data, count, isLoading, page, limit } = useSucursales()

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', newPage + 1)
        router.push(`?${params.toString()}`)
    }

    const handlePageSizeChange = (newLimit) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('limit', newLimit)
        params.set('page', 1)
        router.push(`?${params.toString()}`)
    }

    const columns = [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'name', headerName: 'Nombre', flex: 1 },
        { field: 'address', headerName: 'Dirección', flex: 1 },
        {
            field: 'status',
            headerName: 'Estado',
            width: 140,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Activo' : 'No activa'}
                    color={params.value ? 'success' : 'error'}
                    size="small"
                />
            )
        },
        { field: 'tasa', headerName: 'Tasa', width: 140 },
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
    ]

    return (
        <Box sx={{ width: '100%' }}>
            {/* Filtros */}
            <SucursalFilters />

            {/* Tabla */}
            <Box sx={{ height: 500, width: '100%' }}>
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <DataGrid
                        rows={data.data || []}
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
                        sx={{
                            backgroundColor: '#111',
                            color: '#fff',
                            borderColor: '#444',
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #333'
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#222',
                                borderBottom: '1px solid #333',
                                color: '#000',
                                fontWeight: 'bold'
                            },
                            '& .MuiDataGrid-columnSeparator': {
                                display: 'none'
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#222 !important'
                            }
                        }}
                    />
                )}
            </Box>
        </Box>
    )
}
