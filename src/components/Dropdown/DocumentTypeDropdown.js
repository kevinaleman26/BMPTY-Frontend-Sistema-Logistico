'use client'

import { supabase } from '@/lib/supabase'
import { CircularProgress, MenuItem, TextField } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

export default function DocumentTypeDropdown({ value, onChange, name, error }) {
    const { data, isLoading } = useQuery({
        queryKey: ['tipo-documento'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tipo_documento') // <- nombre corregido de la tabla
                .select('id, name')
                .eq('status', true)

            if (error) throw new Error(error.message)
            return data
        }
    })

    return (
        <TextField
            select
            fullWidth
            label="Tipo de documento"
            name={name}
            value={value}
            onChange={onChange}
            InputLabelProps={{ style: { color: '#ccc' } }}
            SelectProps={{ style: { color: '#fff' } }}
            error={Boolean(error)}
            helperText={error}
            required
        >
            {isLoading ? (
                <MenuItem disabled>
                    <CircularProgress size={20} />
                </MenuItem>
            ) : (
                data?.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                        {item.name}
                    </MenuItem>
                ))
            )}
        </TextField>
    )
}
