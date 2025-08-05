// src/hooks/useMutateCliente.js
'use client'

import { supabase } from '@/lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function useMutateCliente() {
    const queryClient = useQueryClient()

    const createCliente = useMutation({
        mutationFn: async (nuevo) => {
            const { data } = await axios.post('/api/cliente/create', nuevo)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['clientes'])
        },
        onError: (error) => {
            console.error('Error al crear cliente:', error)
            throw error
        }
    })

    const updateCliente = useMutation({
        mutationFn: async ({ id, ...rest }) => {
            const { error } = await supabase
                .from('cliente')
                .update(rest)
                .eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['clientes'])
        }
    })

    return { createCliente, updateCliente }
}
