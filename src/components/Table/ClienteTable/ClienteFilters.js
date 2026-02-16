'use client'

import { useSucursales } from '@/hooks/useSucursales'
import { useTipoDocumento } from '@/hooks/useTipoDocumento'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export default function ClienteFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const { data: sucursales, isLoading: isLoadingSucursales } = useSucursales()
    const { data: tiposDocumento, isLoading: isLoadingTipos } = useTipoDocumento()

    const handleFilterChange = useDebouncedCallback((key, value) => {
        const params = new URLSearchParams(searchParams.toString())

        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }

        params.set('page', '1')
        router.push(`${pathname}?${params.toString()}`)
    }, 300)

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
                defaultValue={searchParams.get('nombre') || ''}
                onChange={(e) => handleFilterChange('nombre', e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
            />

            <TextField
                label="Documento"
                defaultValue={searchParams.get('documento') || ''}
                onChange={(e) => handleFilterChange('documento', e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
            />

            <TextField
                select
                label="Sucursal"
                value={searchParams.get('sucursal_id') ?? ''}
                onChange={(e) => handleFilterChange('sucursal_id', e.target.value)}
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
                value={searchParams.get('document_type') ?? ''}
                onChange={(e) => handleFilterChange('document_type', e.target.value)}
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
