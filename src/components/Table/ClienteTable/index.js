'use client'

import { useClientes } from '@/hooks/useClientes'
import { dataGridStyles } from '@/styles/dataGridStyles'
import EditIcon from '@mui/icons-material/Edit'
import { Box, Chip, CircularProgress, IconButton } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import ClienteFilters from './ClienteFilters'

export default function ClienteTable({ onEdit }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const { data, count, isLoading, page, limit } = useClientes()

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
        {
            field: 'sucursal',
            headerName: 'Sucursal',
            width: 160,
            valueGetter: (value, row) => row.sucursal?.name || '—',
            renderCell: (params) => (
                <Chip label={params.value} color="primary" size="small" />
            )
        },
        { field: 'full_name', headerName: 'Nombre', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        {
            field: 'tipo_documento',
            headerName: 'Tipo Documento',
            width: 160,
            valueGetter: (value, row) => row.tipo_documento?.name || '—',
            renderCell: (params) => (
                <Chip label={params.value} color="secondary" size="small" />
            )
        },
        { field: 'document', headerName: 'Documento', width: 140 },
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
            <ClienteFilters />

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
