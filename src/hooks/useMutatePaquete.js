// src/hooks/useMutatePaquete.js
'use client'

import { useSession } from '@/hooks/useSession'
import { supabase } from '@/lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useMutatePaquete() {
    const queryClient = useQueryClient()
    const { session } = useSession()

    const createPaquete = useMutation({
        mutationFn: async (nuevo) => {
            const { error } = await supabase
                .from('proveedor_paquetes')
                .insert({
                    ...nuevo,
                    sucursal_origen_id: session?.sucursal?.id,
                    operador_registro_id: session?.id,
                })
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['paquetes'])
        }
    })

    const updatePaquete = useMutation({
        mutationFn: async ({ codigo, ...rest }) => {
            const { error } = await supabase
                .from('proveedor_paquetes')
                .update(rest)
                .eq('codigo', codigo)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['paquetes'])
        }
    })

    return { createPaquete, updatePaquete }
}
