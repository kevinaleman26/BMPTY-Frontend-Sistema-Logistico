// src/hooks/useMutatePaquete.js
'use client'

import { supabase } from '@/lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useMutatePaquete() {
    const queryClient = useQueryClient()

    const createPaquete = useMutation({
        mutationFn: async (nuevo) => {
            const { error } = await supabase.from('paquetes').insert(nuevo)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['paquetes'])
        }
    })

    const updatePaquete = useMutation({
        mutationFn: async ({ id, ...rest }) => {
            const { error } = await supabase.from('paquetes').update(rest).eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['paquetes'])
        }
    })

    return { createPaquete, updatePaquete }
}
