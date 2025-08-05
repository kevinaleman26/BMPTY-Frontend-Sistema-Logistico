'use client'

import { useMetodoPago } from '@/hooks/useMetodoPago'
import { useSucursal } from '@/hooks/useSucursal'
import { Box, MenuItem, TextField } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export default function TransferenciaFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const { data: metodos } = useMetodoPago()
    const { data: sucursales } = useSucursal()

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
        <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <TextField
                label="ID Factura"
                defaultValue={searchParams.get('factura_id') || ''}
                onChange={(e) => handleFilterChange('factura_id', e.target.value)}
                size="small"
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{ style: { color: '#fff' } }}
            />

            <TextField
                select
                label="Estado de Entrega"
                value={searchParams.get('delivery_status') ?? ''}
                onChange={(e) => handleFilterChange('delivery_status', e.target.value)}
                size="small"
                InputLabelProps={{ style: { color: '#ccc' } }}
                SelectProps={{ style: { color: '#fff' } }}
                sx={{ minWidth: 180 }}
            >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="false">Pendiente</MenuItem>
                <MenuItem value="true">Entregado</MenuItem>
            </TextField>

            <TextField
                select
                label="Estado de Pago"
                value={searchParams.get('payment_status') ?? ''}
                onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                size="small"
                InputLabelProps={{ style: { color: '#ccc' } }}
                SelectProps={{ style: { color: '#fff' } }}
                sx={{ minWidth: 180 }}
            >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="false">Pendiente</MenuItem>
                <MenuItem value="true">Pagado</MenuItem>
            </TextField>

            <TextField
                select
                label="Método de Pago"
                value={searchParams.get('metodo_pago') ?? ''}
                onChange={(e) => handleFilterChange('metodo_pago', e.target.value)}
                size="small"
                InputLabelProps={{ style: { color: '#ccc' } }}
                SelectProps={{ style: { color: '#fff' } }}
                sx={{ minWidth: 180 }}
            >
                <MenuItem value="">Todos</MenuItem>
                {metodos?.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                        {m.name}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                select
                label="Sucursal Emisora"
                value={searchParams.get('emisor_sucursal') ?? ''}
                onChange={(e) => handleFilterChange('emisor_sucursal', e.target.value)}
                size="small"
                InputLabelProps={{ style: { color: '#ccc' } }}
                SelectProps={{ style: { color: '#fff' } }}
                sx={{ minWidth: 180 }}
            >
                <MenuItem value="">Todas</MenuItem>
                {sucursales?.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                        {s.name}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                select
                label="Sucursal Receptora"
                value={searchParams.get('receptor_sucursal') ?? ''}
                onChange={(e) => handleFilterChange('receptor_sucursal', e.target.value)}
                size="small"
                InputLabelProps={{ style: { color: '#ccc' } }}
                SelectProps={{ style: { color: '#fff' } }}
                sx={{ minWidth: 180 }}
            >
                <MenuItem value="">Todas</MenuItem>
                {sucursales?.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                        {s.name}
                    </MenuItem>
                ))}
            </TextField>
        </Box>
    )
}
