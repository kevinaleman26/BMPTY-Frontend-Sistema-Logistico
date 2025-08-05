'use client'

import { supabase } from '@/lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useMutateOperador() {
    const queryClient = useQueryClient()

    const createOperador = useMutation({
        mutationFn: async ({ email, full_name, role_id, sucursal_id, password }) => {
            const res = await fetch('/api/operador/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, full_name, role_id, sucursal_id, password }),
                credentials: 'include'
            })

            if (!res.ok) {
                const { error } = await res.json()
                throw new Error(error)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['operadores'])
        }
    })

    const updateOperador = useMutation({
        mutationFn: async ({ id, ...rest }) => {
            const { error } = await supabase
                .from('operador')
                .update(rest)
                .eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['operadores'])
        }
    })

    return { createOperador, updateOperador }
}
