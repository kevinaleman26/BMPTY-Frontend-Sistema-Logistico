'use client'

import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export default function SucursalFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

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
                defaultValue={searchParams.get('name') || ''}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
            />

            <TextField
                label="Dirección"
                defaultValue={searchParams.get('address') || ''}
                onChange={(e) => handleFilterChange('address', e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
            />

            <TextField
                select
                label="Estado"
                value={searchParams.get('status') ?? ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
            >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Activo</MenuItem>
                <MenuItem value="false">No activa</MenuItem>
            </TextField>
        </Box>
    )
}
