'use client'

import { useSucursales } from '@/hooks/useSucursales'
import { useTipoDocumento } from '@/hooks/useTipoDocumento'
import { Box, CircularProgress, MenuItem, TextField } from '@mui/material'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

export default function ClienteFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [nombre, setNombre] = useState(searchParams.get('nombre') || '')
    const [documento, setDocumento] = useState(searchParams.get('documento') || '')
    const [sucursal, setSucursal] = useState(searchParams.get('sucursal_id') || '')
    const [tipoDoc, setTipoDoc] = useState(searchParams.get('document_type') || '')

    const [debouncedNombre] = useDebounce(nombre, 500)
    const [debouncedDocumento] = useDebounce(documento, 500)

    const { data: sucursales, isLoading: isLoadingSucursales } = useSucursales()
    const { data: tiposDocumento, isLoading: isLoadingTipos } = useTipoDocumento()

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
        router.push(`${pathname}?${params.toString()}`)
    }, [debouncedNombre, debouncedDocumento, sucursal, tipoDoc, pathname, router, searchParams])

    return (
        <Box
            className="slide-up"
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                mb: 3,
                p: 2.5,
                backgroundColor: 'surface.elevated',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                opacity: 0,
                animationFillMode: 'forwards',
                animationDelay: '0.1s',
            }}
        >
            <TextField
                label="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
            />
            <TextField
                label="Documento"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
            />
            <TextField
                select
                label="Sucursal"
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value)}
                size="small"
                disabled={isLoadingSucursales}
                sx={{ minWidth: 180 }}
            >
                <MenuItem value="">Todas</MenuItem>
                {isLoadingSucursales ? (
                    <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Cargando...
                    </MenuItem>
                ) : (
                    sucursales?.data?.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                            {s.name}
                        </MenuItem>
                    ))
                )}
            </TextField>
            <TextField
                select
                label="Tipo Documento"
                value={tipoDoc}
                onChange={(e) => setTipoDoc(e.target.value)}
                size="small"
                disabled={isLoadingTipos}
                sx={{ minWidth: 180 }}
            >
                <MenuItem value="">Todos</MenuItem>
                {isLoadingTipos ? (
                    <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Cargando...
                    </MenuItem>
                ) : (
                    tiposDocumento?.map((d) => (
                        <MenuItem key={d.id} value={d.id}>
                            {d.name}
                        </MenuItem>
                    ))
                )}
            </TextField>
        </Box>
    )
}
