// src/components/Table/OperadorTable/index.js
'use client'

import { useOperadores } from '@/hooks/useOperadores'
import EditIcon from '@mui/icons-material/Edit'
import { Box, Chip, CircularProgress, IconButton } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import OperadorFilters from './OperadorFilters'

export default function OperadorTable({ onEdit }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data, count, isLoading, page, limit } = useOperadores()

    const columns = [
        { field: 'full_name', headerName: 'Nombre', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        {
            field: 'role',
            headerName: 'Rol',
            flex: 1,
            renderCell: (params) => {
                const roleName = params.row.role?.name || 'Sin rol'
                return <Chip label={roleName} color="primary" />
            }
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
        <Box width="100%">
            <OperadorFilters />
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
