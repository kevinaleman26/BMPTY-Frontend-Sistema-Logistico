// src/components/Table/FacturaFilters.js
'use client';

import { Box, Button, MenuItem, TextField } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';

/**
 * Props opcionales:
 * - sucursales: [{ id, name }]
 * - metodosPago: [{ id, name }]
 */
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

    const handleClear = () => {
        const keys = [
            'numero',
            'cliente',
            'status',
            'proveedor_codigo',
            'fecha_desde',
            'fecha_hasta',
            'sucursal_id',
            'metodo_pago_id'
        ];
        const params = new URLSearchParams(searchParams.toString());
        keys.forEach((k) => params.delete(k));
        // conserva limit si ya existe; si no, lo ponemos
        if (!params.get('limit')) params.set('limit', '10');
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    };

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
                label="Cliente (email)"
                defaultValue={paramsObj.cliente || ''}
                onChange={(e) => handleFilterChange('cliente', e.target.value)}
                size="small"
                InputLabelProps={{ style: labelStyle }}
                InputProps={{ style: inputStyle }}
            />

            <TextField
                label="Proveedor código"
                defaultValue={paramsObj.proveedor_codigo || ''}
                onChange={(e) => handleFilterChange('proveedor_codigo', e.target.value)}
                size="small"
                InputLabelProps={{ style: labelStyle }}
                InputProps={{ style: inputStyle }}
            />

            <TextField
                select
                label="Estado"
                value={paramsObj.status ?? ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                size="small"
                sx={{ minWidth: 160 }}
                InputLabelProps={{ style: labelStyle }}
                SelectProps={{ style: inputStyle }}
            >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="borrador">Borrador</MenuItem>
                <MenuItem value="emitida">Emitida</MenuItem>
                <MenuItem value="pagada">Pagada</MenuItem>
                <MenuItem value="anulada">Anulada</MenuItem>
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

            {/* Sucursal */}
            {sucursales.length > 0 ? (
                <TextField
                    select
                    label="Sucursal"
                    value={paramsObj.sucursal_id ?? ''}
                    onChange={(e) => handleFilterChange('sucursal_id', e.target.value)}
                    size="small"
                    sx={{ minWidth: 180 }}
                    InputLabelProps={{ style: labelStyle }}
                    SelectProps={{ style: inputStyle }}
                >
                    <MenuItem value="">Todas</MenuItem>
                    {sucursales.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                            {s.name}
                        </MenuItem>
                    ))}
                </TextField>
            ) : (
                <TextField
                    label="Sucursal ID"
                    defaultValue={paramsObj.sucursal_id || ''}
                    onChange={(e) => handleFilterChange('sucursal_id', e.target.value)}
                    size="small"
                    InputLabelProps={{ style: labelStyle }}
                    InputProps={{ style: inputStyle }}
                />
            )}

            {/* Método de pago */}
            {metodosPago.length > 0 ? (
                <TextField
                    select
                    label="Método de pago"
                    value={paramsObj.metodo_pago_id ?? ''}
                    onChange={(e) => handleFilterChange('metodo_pago_id', e.target.value)}
                    size="small"
                    sx={{ minWidth: 200 }}
                    InputLabelProps={{ style: labelStyle }}
                    SelectProps={{ style: inputStyle }}
                >
                    <MenuItem value="">Todos</MenuItem>
                    {metodosPago.map((m) => (
                        <MenuItem key={m.id} value={m.id}>
                            {m.name}
                        </MenuItem>
                    ))}
                </TextField>
            ) : (
                <TextField
                    label="Método de pago ID"
                    defaultValue={paramsObj.metodo_pago_id || ''}
                    onChange={(e) => handleFilterChange('metodo_pago_id', e.target.value)}
                    size="small"
                    InputLabelProps={{ style: labelStyle }}
                    InputProps={{ style: inputStyle }}
                />
            )}

            <Box flex={1} />

            <Button variant="outlined" size="small" onClick={handleClear}>
                Limpiar filtros
            </Button>
        </Box>
    );
}
