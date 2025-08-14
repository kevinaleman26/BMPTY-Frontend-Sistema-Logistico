'use client'

import { supabase } from '@/lib/supabase'
import { Box, CircularProgress, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useEffect, useState } from 'react'

export default function SucursalesTable() {
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)

    const columns = [
        { field: 'name', headerName: 'Nombre', flex: 1 },
        { field: 'address', headerName: 'Dirección', flex: 1 },
        { field: 'tasa', headerName: 'Tasa', flex: 1 },
        {
            field: 'status',
            headerName: 'Estado',
            flex: 1,
            renderCell: (params) => params.value ? 'Activo' : 'No activo'
        }
    ]

    useEffect(() => {
        const fetchSucursales = async () => {
            setLoading(true)
            const { data, error } = await supabase.from('sucursal').select('*').order('id', { ascending: true })
            if (error) {
                console.error(error)
            } else {
                setRows(data || [])
            }
            setLoading(false)
        }
        fetchSucursales()
    }, [])

    return (
        <Box sx={{ width: '550px' }}>
            <Typography variant="h4" color="white" sx={{ py: 4 }}>
                Sucursales
            </Typography>
            {loading ? (
                <CircularProgress />
            ) : (
                <DataGrid
                    rows={rows}
                    columns={columns}
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
                        }
                    }}
                />
            )}
        </Box>
    )
}
