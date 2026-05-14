// src/components/Table/OperadorTable/index.js
'use client'

import { useOperadores } from '@/hooks/useOperadores'
import { dataGridStyles } from '@/styles/dataGridStyles'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useCallback } from 'react'
import OperadorFilters from './OperadorFilters'
import { EditIcon } from '@/components/Icons'


export default function OperadorTable({ onEdit }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data, count, isLoading, page, limit, orderBy, orderDir } = useOperadores()

    const sortModel = useMemo(() => [{ field: orderBy, sort: orderDir }], [orderBy, orderDir])

    const handleSortModelChange = useCallback((model) => {
        const params = new URLSearchParams(searchParams.toString())
        if (model.length > 0) {
            params.set('orderBy', model[0].field)
            params.set('orderDir', model[0].sort || 'asc')
        } else {
            params.set('orderBy', 'full_name')
            params.set('orderDir', 'asc')
        }
        params.set('page', '1')
        router.push(`?${params.toString()}`)
    }, [searchParams, router])

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
        { field: 'full_name', headerName: 'Nombre', flex: 1, filterable: false },
        { field: 'email', headerName: 'Email', flex: 1, filterable: false },
        {
            field: 'role_id',
            headerName: 'Rol',
            flex: 1,
            filterable: false,
            valueGetter: (value, row) => row.role?.name || 'Sin rol',
            renderCell: (params) => (
                <Chip label={params.value} color="primary" size="small" />
            )
        },
        {
            field: 'accion',
            headerName: 'Acción',
            width: 100,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
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
            <OperadorFilters />

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
                        sortingMode="server"
                        sortModel={sortModel}
                        onSortModelChange={handleSortModelChange}
                        disableRowSelectionOnClick
                        sx={dataGridStyles}
                    />
                )}
            </Box>
        </Box>
    )
}
