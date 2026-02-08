// src/components/Table/OperadorTable/index.js
'use client'

import { useOperadores } from '@/hooks/useOperadores'
import { dataGridStyles } from '@/styles/dataGridStyles'
import EditIcon from '@mui/icons-material/Edit'
import { Box, Chip, CircularProgress, IconButton } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import OperadorFilters from './OperadorFilters'

export default function OperadorTable({ onEdit }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data, count, isLoading, page, limit } = useOperadores()

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
        { field: 'full_name', headerName: 'Nombre', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        {
            field: 'role',
            headerName: 'Rol',
            flex: 1,
            valueGetter: (value, row) => row.role?.name || 'Sin rol',
            renderCell: (params) => (
                <Chip label={params.value} color="primary" size="small" />
            )
        },
        {
            field: 'accion',
            headerName: 'Acción',
            width: 100,
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
            <OperadorFilters />

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
                        sx={dataGridStyles}
                    />
                )}
            </Box>
        </Box>
    )
}
