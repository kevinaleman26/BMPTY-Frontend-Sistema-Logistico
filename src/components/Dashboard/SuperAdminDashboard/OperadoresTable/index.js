// src/components/Table/OperadoresTable/index.js
'use client'

import { supabase } from '@/lib/supabase'
import { Box, Chip, CircularProgress, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useEffect, useState } from 'react'

export default function OperadoresTable() {
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)

    const columns = [
        { field: 'full_name', headerName: 'Nombre', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        {
            field: 'role',
            headerName: 'Rol',
            flex: 1,
            valueGetter: (params) => params.row?.role?.name ?? '—',
            renderCell: (params) => {
                const label = params.row?.role?.name ?? '—'
                const color =
                    label?.toLowerCase().includes('admin') ? 'warning' :
                        label?.toLowerCase().includes('operador') ? 'primary' : 'default'
                return <Chip label={label} color={color} size="small" />
            }
        },
        {
            field: 'sucursal',
            headerName: 'Sucursal',
            flex: 1,
            valueGetter: (params) => params.row?.sucursal?.name ?? '—',
            renderCell: (params) => {
                const label = params.row?.sucursal?.name ?? '—'
                return <Chip label={label} color={'primary'} size="small" />
            }
        }
    ]

    useEffect(() => {
        const fetchOperadores = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from('operador')
                .select(`
                    id,
                    full_name,
                    email,
                    role_id,
                    sucursal_id,
                    creado_en,
                    role:role_id ( id, name ),
                    sucursal:sucursal_id ( id, name )
                `)
                .order('creado_en', { ascending: false })

            if (error) {
                console.error('Error cargando operadores:', error)
                setRows([])
            } else {
                setRows(data || [])
            }
            setLoading(false)
        }

        fetchOperadores()
    }, [])

    return (
        <Box sx={{ width: '550px'  }}>
            <Typography variant="h4" color="white" sx={{ py: 4 }}>
                Operadores
            </Typography>
            {loading ? (
                <CircularProgress />
            ) : (
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row.id} // id es UUID en tu tabla
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
