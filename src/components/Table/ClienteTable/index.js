'use client'

import { useClientes } from '@/hooks/useClientes'
import EditIcon from '@mui/icons-material/Edit'
import { Box, Chip, CircularProgress, IconButton } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import ClienteFilters from './ClienteFilters'

export default function ClienteTable({ onEdit }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const { data, count, isLoading, page, limit } = useClientes()

    const columns = [
        {
            field: 'sucursal',
            headerName: 'Sucursal',
            width: 160,
            renderCell: (params) => (
                <Chip label={params.row.sucursal?.name || '—'} color="primary" size="small" />
            )
        },
        { field: 'full_name', headerName: 'Nombre', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        {
            field: 'tipo_documento',
            headerName: 'Tipo Documento',
            width: 160,
            renderCell: (params) => (
                <Chip
                    label={params.row.tipo_documento?.name || '—'}
                    color="secondary"
                    size="small"
                />
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
        <Box width="100%">
            <ClienteFilters />

            <Box height={500}>
                {isLoading ? (
                    <CircularProgress />
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
                            const params = new URLSearchParams(searchParams.toString())

                            params.set('page', newPage + 1) // el DataGrid usa 0-indexed
                            params.set('limit', newPageSize)

                            router.push(`?${params.toString()}`)
                        }}
                        disableRowSelectionOnClick
                        sx={{
                            backgroundColor: '#111',
                            color: '#fff',
                            borderColor: '#444',
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#222',
                                color: '#000',
                                fontWeight: 'bold'
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#222 !important'
                            },
                            '& .MuiDataGrid-footerContainer': {
                                backgroundColor: '#222',
                                color: '#000',
                                fontWeight: 'bold',
                                borderTop: '1px solid #444',
                            },
                            '& .MuiTablePagination-root': {
                                color: '#fff',
                            },
                            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                color: '#fff',
                            },
                            '& .MuiTablePagination-input .MuiSelect-select': {
                                color: '#fff',
                                backgroundColor: 'transparent',
                            },
                            '& .MuiTablePagination-actions .MuiIconButton-root': {
                                color: '#fff',
                            },
                        }}
                    />
                )}
            </Box>
        </Box>
    )
}
