'use client'

import { useTransferencias } from '@/hooks/useTransferencias'
import EditIcon from '@mui/icons-material/Edit'
import { Box, Chip, CircularProgress, IconButton } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import TransferenciaFilters from './TransferenciaFilters'

export default function TransferenciaTable({ onEdit }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const {
        data,
        count,
        isLoading,
        page,
        limit
    } = useTransferencias()

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
        { field: 'id', headerName: 'Factura ID', flex: 1 },
        {
            field: 'emisor_sucursal.name',
            headerName: 'Sucursal Emisora',
            flex: 1,
            renderCell: (params) => (
                <Chip label={params.row.emisor_sucursal?.name || '—'} color="primary" />
            )
        },
        {
            field: 'receptor_sucursal.name',
            headerName: 'Sucursal Receptora',
            flex: 1,
            renderCell: (params) => (
                <Chip label={params.row.receptor_sucursal?.name || '—'} color="primary" />
            )
        },
        {
            field: 'metodo_pago.name',
            headerName: 'Método de Pago',
            flex: 1,
            renderCell: (params) => (
                <Chip label={params.row.metodo_pago?.name || '—'} color="primary" />
            )
        },

        {
            field: 'delivery_status',
            headerName: 'Estado Entrega',
            flex: 1,
            renderCell: (params) => (
                <Chip
                    label={params.row.delivery_status ? 'Entregado' : 'Pendiente'}
                    color={params.row.delivery_status ? 'success' : 'error'}
                />
            )
        },
        {
            field: 'payment_status',
            headerName: 'Estado Pago',
            flex: 1,
            renderCell: (params) => (
                <Chip
                    label={params.row.payment_status ? 'Pagado' : 'Pendiente'}
                    color={params.row.payment_status ? 'success' : 'error'}
                />
            )
        },
        { field: 'created_at', headerName: 'Creado en', flex: 1 },
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
        <Box width="100%">
            <TransferenciaFilters />
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
                        onPaginationModelChange={({ page, pageSize }) => {
                            handlePageChange(page)
                            handlePageSizeChange(pageSize)
                        }}
                        getRowId={(row) => row.id}
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
