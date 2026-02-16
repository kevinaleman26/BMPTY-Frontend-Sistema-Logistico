'use client'

import { useSucursales } from '@/hooks/useSucursales'
import { dataGridStyles } from '@/styles/dataGridStyles'
import EditIcon from '@mui/icons-material/Edit'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useCallback } from 'react'
import SucursalFilters from './SucursalFilters'

export default function SucursalTable({ onEdit }) {
    const router = useRouter()
    const searchParams = useSearchParams()

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

    const columns = useMemo(() => [
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
    ], [onEdit])

    return (
        <Box sx={{ width: '100%' }}>
            {/* Filtros */}
            <SucursalFilters />

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
