'use client'

import { usePaquetes } from '@/hooks/usePaquetes'
import { Box, CircularProgress } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import PaqueteFilters from './PaqueteFilters'

export default function PaqueteTable({ onEdit }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data, count, isLoading, page, limit } = usePaquetes()

    const columns = [
        { field: 'factura_id', headerName: 'Factura ID', width: 100 },
        { field: 'tipo', headerName: 'Tipo', width: 100 },
        { field: 'codigo', headerName: 'Código', flex: 1 },
        { field: 'largo', headerName: 'Largo', type: 'number', width: 100 },
        { field: 'alto', headerName: 'Alto', type: 'number', width: 100 },
        { field: 'ancho', headerName: 'Ancho', type: 'number', width: 100 },
        { field: 'peso', headerName: 'Peso', type: 'number', width: 100 },
        { field: 'volumen', headerName: 'Volumen', type: 'number', width: 100 },
        { field: 'precio', headerName: 'Precio', type: 'number', width: 100 },
        /*
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
        */
    ]

    return (
        <Box width="100%">
            <PaqueteFilters />
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
