// src/components/Table/OperadorTable/OperadorFilters.js
'use client'

import { Box, TextField } from '@mui/material'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export default function OperadorFilters() {
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
                label="Nombre completo"
                defaultValue={searchParams.get('full_name') || ''}
                onChange={(e) => handleFilterChange('full_name', e.target.value)}
                size="small"
                sx={{ minWidth: 250, flex: 1 }}
            />

            <TextField
                label="Email"
                defaultValue={searchParams.get('email') || ''}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                size="small"
                sx={{ minWidth: 250, flex: 1 }}
            />
        </Box>
    )
}
