'use client'

import { useMetodoPago } from '@/hooks/useMetodoPago'
import { useSucursal } from '@/hooks/useSucursal'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export default function TransferenciaFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const { data: metodos, isLoading: isLoadingMetodos } = useMetodoPago()
    const { data: sucursales, isLoading: isLoadingSucursales } = useSucursal()

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
                label="ID Transferencia"
                defaultValue={searchParams.get('factura_id') || ''}
                onChange={(e) => handleFilterChange('factura_id', e.target.value)}
                size="small"
                type="number"
                sx={{ minWidth: 180 }}
            />

            <TextField
                select
                label="Estado de Entrega"
                value={searchParams.get('delivery_status') ?? ''}
                onChange={(e) => handleFilterChange('delivery_status', e.target.value)}
                size="small"
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
                disabled={isLoadingMetodos}
                sx={{ minWidth: 180 }}
            >
                <MenuItem value="">Todos</MenuItem>
                {isLoadingMetodos ? (
                    <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Cargando...
                    </MenuItem>
                ) : (
                    metodos?.map((m) => (
                        <MenuItem key={m.id} value={m.id}>
                            {m.name}
                        </MenuItem>
                    ))
                )}
            </TextField>

            <TextField
                select
                label="Sucursal Emisora"
                value={searchParams.get('emisor_sucursal') ?? ''}
                onChange={(e) => handleFilterChange('emisor_sucursal', e.target.value)}
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
                    sucursales?.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                            {s.name}
                        </MenuItem>
                    ))
                )}
            </TextField>

            <TextField
                select
                label="Sucursal Receptora"
                value={searchParams.get('receptor_sucursal') ?? ''}
                onChange={(e) => handleFilterChange('receptor_sucursal', e.target.value)}
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
                    sucursales?.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                            {s.name}
                        </MenuItem>
                    ))
                )}
            </TextField>
        </Box>
    )
}
