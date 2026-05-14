'use client'

import { useSession } from '@/hooks/useSession'
import { useSucursal } from '@/hooks/useSucursal'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

/**
 * Parses raw barcode scanner output into a clean search string.
 *
 * Barcode readers emit extra framing that isn't stored in the DB:
 *   - GS1 symbology identifier prefix: "]C1", "]e0", etc. (first 3 chars when starts with "]")
 *   - GS1 data separator: "|" between fields
 *
 * Examples:
 *   "]C142033198|9361289677042301997142" → "9361289677042301997142"
 *   "WH88172 1-1"                        → "WH88172 1-1"  (unchanged)
 */
function parseBarcode(input) {
    let value = input.trim()
    // Strip GS1 symbology identifier ("]" + 2-char code, e.g. "]C1")
    if (value.startsWith(']') && value.length > 3) {
        value = value.slice(3)
    }
    // If GS1 data separator present, take the last segment (the actual tracking number)
    if (value.includes('|')) {
        value = value.split('|').pop()
    }
    return value
}

export default function PaqueteFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { session } = useSession()
    const { data: sucursales } = useSucursal()

    const isSuperAdmin = session?.role?.id === 1

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

    const handleCodigoChange = useDebouncedCallback((raw) => {
        const parsed = parseBarcode(raw)
        const params = new URLSearchParams(searchParams.toString())
        if (parsed) {
            params.set('codigo', parsed)
        } else {
            params.delete('codigo')
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
                label="Código / Barcode"
                defaultValue={searchParams.get('codigo') || ''}
                onChange={(e) => handleCodigoChange(e.target.value)}
                size="small"
                sx={{ minWidth: 220 }}
                helperText="Acepta código manual o escaneo de barcode"
            />

            <TextField
                select
                label="Estado"
                value={searchParams.get('estado') || ''}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                size="small"
                sx={{ minWidth: 210 }}
            >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="en_transferencia_activa">En transferencia activa</MenuItem>
                <MenuItem value="transferencia_recibida">Transferencia recibida</MenuItem>
                <MenuItem value="facturado">Facturado</MenuItem>
                <MenuItem value="no_facturado">No facturado</MenuItem>
            </TextField>

            {isSuperAdmin && (
                <TextField
                    select
                    label="Sucursal"
                    value={searchParams.get('sucursal_id') || ''}
                    onChange={(e) => handleFilterChange('sucursal_id', e.target.value)}
                    size="small"
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">Todas</MenuItem>
                    {(sucursales ?? []).map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                            {s.name}
                        </MenuItem>
                    ))}
                </TextField>
            )}
        </Box>
    )
}
