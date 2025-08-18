// src/components/Table/FacturaFilters.js
'use client';

import { Box, MenuItem, TextField } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function FacturaFilters({ sucursales = [], metodosPago = [] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Convierte los searchParams a objeto para fácil lectura por defaultValue/value
    const paramsObj = useMemo(() => {
        const obj = Object.fromEntries(searchParams.entries());
        return obj;
    }, [searchParams]);

    const pushWithParams = (params) => {
        // siempre set page=1 al cambiar filtros y aseguremos limit
        if (!params.get('limit')) params.set('limit', '10');
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    };

    const handleFilterChange = useDebouncedCallback((key, value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value !== undefined && value !== null && value !== '') params.set(key, value);
        else params.delete(key);
        pushWithParams(params);
    }, 300);

    const labelStyle = { color: '#ccc' };
    const inputStyle = { color: '#fff' };

    return (
        <Box display="flex" flexWrap="wrap" gap={2} mb={2} alignItems="center">
            <TextField
                label="Número"
                defaultValue={paramsObj.numero || ''}
                onChange={(e) => handleFilterChange('numero', e.target.value)}
                size="small"
                InputLabelProps={{ style: labelStyle }}
                InputProps={{ style: inputStyle }}
            />

            <TextField
                select
                label="Estado Pagado"
                value={paramsObj.payment_status ?? ''}
                onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                size="small"
                sx={{ minWidth: 160 }}
                InputLabelProps={{ style: labelStyle }}
                SelectProps={{ style: inputStyle }}
            >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Pagado</MenuItem>
                <MenuItem value="false">Pendiente</MenuItem>
            </TextField>

            <TextField
                select
                label="Estado Entregado"
                value={paramsObj.delivery_status ?? ''}
                onChange={(e) => handleFilterChange('delivery_status', e.target.value)}
                size="small"
                sx={{ minWidth: 160 }}
                InputLabelProps={{ style: labelStyle }}
                SelectProps={{ style: inputStyle }}
            >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Entregado</MenuItem>
                <MenuItem value="false">Pendiente</MenuItem>
            </TextField>


            {/* Fecha desde/hasta (YYYY-MM-DD) */}
            <TextField
                type="date"
                label="Fecha desde"
                value={paramsObj.fecha_desde ?? ''}
                onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true, style: labelStyle }}
                InputProps={{ style: inputStyle }}
            />

            <TextField
                type="date"
                label="Fecha hasta"
                value={paramsObj.fecha_hasta ?? ''}
                onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true, style: labelStyle }}
                InputProps={{ style: inputStyle }}
            />

        </Box>
    );
}
