'use client'

import { Box, MenuItem, TextField } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export default function SucursalFilters() {
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
                label="Nombre"
                defaultValue={searchParams.get('name') || ''}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                size="small"
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{ style: { color: '#fff' } }}
            />

            <TextField
                label="Dirección"
                defaultValue={searchParams.get('address') || ''}
                onChange={(e) => handleFilterChange('address', e.target.value)}
                size="small"
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{ style: { color: '#fff' } }}
            />

            <TextField
                select
                label="Estado"
                value={searchParams.get('status') ?? ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                size="small"
                InputLabelProps={{ style: { color: '#ccc' } }}
                SelectProps={{ style: { color: '#fff' } }}
                sx={{ minWidth: 160 }}
            >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Activo</MenuItem>
                <MenuItem value="false">No activa</MenuItem>
            </TextField>
        </Box>
    )
}
