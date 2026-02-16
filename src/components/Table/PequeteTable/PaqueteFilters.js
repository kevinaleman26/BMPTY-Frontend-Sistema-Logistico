'use client'

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export default function PaqueteFilters() {
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
                label="Factura ID"
                defaultValue={searchParams.get('factura_id') || ''}
                onChange={(e) => handleFilterChange('factura_id', e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
            />

            <TextField
                label="Tipo"
                defaultValue={searchParams.get('tipo') || ''}
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
            />

            <TextField
                label="Código"
                defaultValue={searchParams.get('codigo') || ''}
                onChange={(e) => handleFilterChange('codigo', e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
            />
        </Box>
    )
}
