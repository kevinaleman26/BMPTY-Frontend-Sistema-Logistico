'use client'

import { usePaquetes } from '@/hooks/usePaquetes'
import { dataGridStyles } from '@/styles/dataGridStyles'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useCallback } from 'react'
import PaqueteFilters from './PaqueteFilters'

export default function PaqueteTable({ onEdit }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data, count, isLoading, page, limit } = usePaquetes()

    const columns = useMemo(() => [
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
                        disableRowSelectionOnClick
                        sx={dataGridStyles}
                    />
                )}
            </Box>
        </Box>
    )
}
