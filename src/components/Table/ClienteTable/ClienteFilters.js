'use client'


import { useSucursales } from '@/hooks/useSucursales'
import { useTipoDocumento } from '@/hooks/useTipoDocumento'
import { Box, MenuItem, TextField } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

export default function ClienteFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [nombre, setNombre] = useState(searchParams.get('nombre') || '')
    const [documento, setDocumento] = useState(searchParams.get('documento') || '')
    const [sucursal, setSucursal] = useState(searchParams.get('sucursal_id') || '')
    const [tipoDoc, setTipoDoc] = useState(searchParams.get('document_type') || '')

    const [debouncedNombre] = useDebounce(nombre, 500)
    const [debouncedDocumento] = useDebounce(documento, 500)

    const { data: sucursales } = useSucursales()
    const { data: tiposDocumento } = useTipoDocumento()

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())

        debouncedNombre
            ? params.set('nombre', debouncedNombre)
            : params.delete('nombre')

        debouncedDocumento
            ? params.set('documento', debouncedDocumento)
            : params.delete('documento')

        sucursal
            ? params.set('sucursal_id', sucursal)
            : params.delete('sucursal_id')

        tipoDoc
            ? params.set('document_type', tipoDoc)
            : params.delete('document_type')

        params.set('page', '1')
        router.push(`?${params.toString()}`)
    }, [debouncedNombre, debouncedDocumento, sucursal, tipoDoc])


    return (
        <Box display="flex" gap={2} mb={2}>
            <TextField
                label="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{ style: { color: '#fff' } }}
            />
            <TextField
                label="Documento"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{ style: { color: '#fff' } }}
            />
            <TextField
                select
                label="Sucursal"
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value)}
                sx={{ minWidth: 180 }}
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{ style: { color: '#fff' } }}
            >
                <MenuItem value="">Todas</MenuItem>
                {sucursales && sucursales.data?.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
            </TextField>
            <TextField
                select
                label="Tipo Documento"
                value={tipoDoc}
                onChange={(e) => setTipoDoc(e.target.value)}
                sx={{ minWidth: 180 }}
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{ style: { color: '#fff' } }}
            >
                <MenuItem value="">Todos</MenuItem>
                {tiposDocumento?.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
            </TextField>
        </Box>
    )
}
