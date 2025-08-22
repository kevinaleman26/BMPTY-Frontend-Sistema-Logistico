'use client'

import { usePaquetes } from '@/hooks/usePaquetes'
import { supabase } from '@/lib/supabase'
import {
    Box,
    CircularProgress,
    TextField,
    Typography
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export default function PaqueteTableSelection({ formik }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data, count, isLoading, page, limit } = usePaquetes()

    const [initDT, setInitDt] = useState(() =>
        Array.isArray(formik?.values?.paqueteList)
            ? formik.values.paqueteList.map(item => item.paquete_id)
            : []
    )
    const [selectedRows, setSelectedRows] = useState([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (selectedRows?.length > 0) {
            formik.setFieldValue('paqueteList', selectedRows)
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

    // 🚀 Trae los paquetes por código (solo si hay initDT) — FUERA de useMemo
    const {
        data: initRows = [],
        isLoading: initLoading,
        isError: initError,
    } = useQuery({
        queryKey: ['proveedor_paquetesByCodigo', initDT],
        enabled: Array.isArray(initDT) && initDT.length > 0,
        staleTime: 30_000,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('proveedor_paquetes')
                .select('*')
                .in('codigo', initDT)
            if (error) throw error
            return data ?? []
        },
    })

    const baseRows = data?.data || []

    // ✅ Solo lógica sincrónica dentro de useMemo
    const filteredRows = useMemo(() => {
        if (initDT.length > 0) return initRows

        if (!search.trim()) return baseRows

        const lower = search.toLowerCase()
        const filtrados = baseRows.filter(row =>
            Object.values(row).some(value => String(value).toLowerCase().includes(lower))
        )
        const combined = [...selectedRows, ...filtrados]
        return Array.from(new Map(combined.map(item => [item.codigo, item])).values())
    }, [initDT, initRows, baseRows, search, selectedRows])

    return (
        <Box height="auto">
            <Typography variant="h6" gutterBottom>
                Lista de Paquetes
            </Typography>

            {initDT.length === 0 && (
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
            )}

            {/* Tabla */}
            {isLoading ? (
                <CircularProgress />
            ) : (
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    loading={isLoading || initLoading}
                    getRowId={(row) => row.id ?? row.codigo}  // 🔑 por si no tienes id
                    rowCount={initDT.length > 0 ? initRows.length : (count || 0)}
                    paginationMode="server"
                    pageSizeOptions={[5, 10, 20]}
                    paginationModel={{
                        page: Math.max(page - 1, 0),
                        pageSize: limit
                    }}
                    onPaginationModelChange={({ page: newPage, pageSize: newPageSize }) => {
                        const params = new URLSearchParams(searchParams.toString())
                        params.set('page', String(newPage + 1)) // DataGrid es 0-indexed
                        params.set('limit', String(newPageSize))
                        router.push(`?${params.toString()}`)
                    }}
                    checkboxSelection={initDT.length === 0}
                    disableRowSelectionOnClick={initDT.length !== 0}
                    onRowSelectionModelChange={(newSelection) => {
                        const ids = Array.isArray(newSelection)
                            ? newSelection
                            : Array.from(newSelection?.ids || [])
                        const idSet = new Set(ids)
                        const selected = filteredRows.filter(r => idSet.has(r.id ?? r.codigo))
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
                            backgroundColor: '#444 !important',
                            color: '#fff !important'
                        },
                        '& .MuiCheckbox-root.Mui-checked': {
                            color: '#1976d2'
                        }
                    }}
                />
            )}
        </Box>
    )
}
