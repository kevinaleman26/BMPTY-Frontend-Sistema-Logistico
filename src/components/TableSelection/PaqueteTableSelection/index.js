'use client'

import { usePaquetes } from '@/hooks/usePaquetes'
import {
    Box,
    CircularProgress,
    TextField,
    Typography
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export default function PaqueteTableSelection({ formik }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data, count, isLoading, page, limit } = usePaquetes()
    const [initDT, setInitDt] = useState(formik.values.paqueteList.map(item => item.paquete_id) || [])
    const [selectedRows, setSelectedRows] = useState([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (selectedRows){
            const codigoList = selectedRows.map(item => item.codigo)
            formik.setFieldValue('paqueteList', codigoList)
        }
    }, [selectedRows])

    const columns = [
        { field: 'codigo', headerName: 'Código', flex: 3 },
        { field: 'largo', headerName: 'Largo', type: 'number', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'alto', headerName: 'Alto', type: 'number', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'ancho', headerName: 'Ancho', type: 'number', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'peso', headerName: 'Peso', type: 'number', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'volumen', headerName: 'Volumen', type: 'number', flex: 1, align: 'center', headerAlign: 'center' },
    ]

    const filteredRows = useMemo(() => {
        const rows = data?.data || []

        if (initDT.length > 0) {
            // Mostrar solo los paquetes cuyos códigos están en selectedRows
            return rows.filter(row => initDT.includes(row.codigo))
        }

        if (!search.trim()) return rows

        const lowerSearch = search.toLowerCase()
        const filtrados = rows.filter(row =>
            Object.values(row).some(value =>
                String(value).toLowerCase().includes(lowerSearch)
            )
        )
        const combined = [...selectedRows, ...filtrados]
        const removeDuplicate = Array.from(
            new Map(combined.map(item => [item.codigo, item])).values()
        )
        return removeDuplicate;
    }, [search, data?.data, selectedRows, initDT])



    return (
        <Box height={'auto'}>

            <Typography variant="h6" gutterBottom>
                Lista de Paquetes
            </Typography>

            {
                initDT.length === 0 && (
                    <Box my={2}>
                        <Box mb={2}>
                            <TextField
                                fullWidth
                                label="Buscar paquete"
                                variant="outlined"
                                size="small"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Seleccionados:
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                            {selectedRows.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No hay paquetes seleccionados.
                                </Typography>
                            ) : (
                                selectedRows.map((item, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            backgroundColor: '#222',
                                            color: '#fff',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            border: '1px solid #444'
                                        }}
                                    >
                                        {item.codigo}
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Box>
                )
            }

            {/* Tabla */}
            {isLoading ? (
                <CircularProgress />
            ) : (
                <DataGrid
                    rows={filteredRows}
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
                    checkboxSelection={initDT.length === 0}
                    disableRowSelectionOnClick={initDT.length !== 0}
                    onRowSelectionModelChange={(newSelection) => {
                        const ids = Array.isArray(newSelection)
                            ? newSelection
                            : Array.from(newSelection?.ids || [])

                        const selected = filteredRows.filter((row) => ids.includes(row.id)) || []
                        setSelectedRows(selected)
                    }}
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
                        '& .Mui-selected': {
                            backgroundColor: '#444 !important', // color de fondo de fila seleccionada
                            color: '#fff !important'            // color del texto
                        },
                        '& .MuiCheckbox-root.Mui-checked': {
                            color: '#1976d2' // color del checkbox seleccionado (azul por defecto de MUI)
                        }
                    }}
                />
            )}
        </Box>
    )
}
