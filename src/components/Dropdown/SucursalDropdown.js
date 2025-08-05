'use client'

import { supabase } from '@/lib/supabase'
import { FormHelperText, MenuItem, TextField } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

export default function SucursalDropdown({ name, value, onChange, error, helperText }) {
    const { data, isLoading } = useQuery({
        queryKey: ['sucursales'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sucursal')
                .select('id, name')
                .eq('status', true)

            if (error) throw new Error(error.message)
            return data
        }
    })

    return (
        <TextField
            select
            label="Sucursal"
            name={name}
            value={value}
            onChange={onChange}
            fullWidth
            required
            error={error}
        >
            {isLoading ? (
                <MenuItem disabled>Cargando...</MenuItem>
            ) : (
                data?.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                        {item.name}
                    </MenuItem>
                ))
            )}
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </TextField>
    )
}
