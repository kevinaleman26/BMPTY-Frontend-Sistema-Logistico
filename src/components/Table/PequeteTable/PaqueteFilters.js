'use client'

import { Box, TextField } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export default function PaqueteFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleFilterChange = useDebouncedCallback((key, value) => {
        const params = new URLSearchParams(searchParams.toString())

        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }

        params.set('page', 1)
        router.push(`?${params.toString()}`)
    }, 300)

    return (
        <Box display="flex" gap={2} mb={2}>
            <TextField
                label="Factura ID"
                defaultValue={searchParams.get('factura_id') || ''}
                onChange={(e) => handleFilterChange('factura_id', e.target.value)}
                size="small"
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{ style: { color: '#fff' } }}
            />

            <TextField
                label="Tipo"
                defaultValue={searchParams.get('tipo') || ''}
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                size="small"
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{ style: { color: '#fff' } }}
            />

            <TextField
                label="Código"
                defaultValue={searchParams.get('codigo') || ''}
                onChange={(e) => handleFilterChange('codigo', e.target.value)}
                size="small"
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{ style: { color: '#fff' } }}
            />
        </Box>
    )
}
