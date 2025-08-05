'use client'

import { supabase } from '@/lib/supabase'
import { MenuItem, TextField } from '@mui/material'
import { useEffect, useState } from 'react'

export default function RoleDropdow({ value, onChange, disabled }) {
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRoles = async () => {
            const { data, error } = await supabase
                .from('role')
                .select('id, name')
                .eq('isactive', true)
                .order('name', { ascending: true })

            if (!error) setRoles(data)
            setLoading(false)
        }

        fetchRoles()
    }, [])

    return (
        <TextField
            select
            label="Rol"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            fullWidth
            required
            disabled={disabled || loading}
        >
            {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                    {role.name}
                </MenuItem>
            ))}
        </TextField>
    )
}
