// src/components/Table/ClientesTable/index.js
'use client'

import { supabase } from '@/lib/supabase'
import { Box, Chip, CircularProgress, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useEffect, useState } from 'react'

export default function ClientesTable() {
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)

    const columns = [
        { field: 'full_name', headerName: 'Nombre', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        {
            field: 'document_type',
            headerName: 'Tipo Documento',
            flex: 1,
            renderCell: (params) => (<Chip
                    label={params.row?.tipo_documento?.name ?? '—'}
                    size="small"
                    color="info"
                    variant="outlined"
                />
            )
        },
        { field: 'document', headerName: 'Documento', flex: 1 },
        { field: 'phone', headerName: 'Teléfono', flex: 1 },
        {
            field: 'sucursal',
            headerName: 'Sucursal',
            flex: 1,
            valueGetter: (params) => params.row?.sucursal?.name ?? '—',
            renderCell: (params) => (
                <Chip
                    label={params.row?.sucursal?.name ?? '—'}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            )
        },
        {
            field: 'tarifa',
            headerName: 'Tarifa',
            flex: 1,
            renderCell: ({ value }) => (`$${Number(value).toFixed(2)}`)
        }
    ]

    useEffect(() => {
        const fetchClientes = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from('cliente')
                .select(`
                    id,
                    full_name,
                    email,
                    document,
                    phone,
                    tarifa,
                    created_at,
                    sucursal:sucursal_id ( id, name ),
                    tipo_documento:document_type ( id, name )
                `)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error cargando clientes:', error)
                setRows([])
            } else {
                setRows(data || [])
            }
            setLoading(false)
        }

        fetchClientes()
    }, [])

    return (
        <Box sx={{ width: '1100px' }}>
            <Typography variant="h4" color="white" sx={{ py: 4 }}>
                Clientes
            </Typography>
            {loading ? (
                <CircularProgress />
            ) : (
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row.id} // UUID
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
