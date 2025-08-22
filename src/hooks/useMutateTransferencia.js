// hooks/useMutateTransferencia.js
'use client'

import { supabase } from '@/lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useMutateTransferencia() {
    const queryClient = useQueryClient()

    const createTransferencia = useMutation({
        mutationFn: async (data) => {

            const transferensia = data;
            const listaPaquetes = data.paqueteList.map(item => item.codigo);

            delete transferensia.paqueteList

            const { data: transferencia, error } = await supabase
                .from('transferencia_sucursal')
                .insert({
                    ...transferensia,
                    created_at: new Date()
                })
                .select()
                .single()

            if (error) throw error

            const { data: dt, error: solicitudError } = await supabase
                .from('solicitud_paquete')
                .update({ transferencia_id: transferencia.id })
                .in('paquete_id', listaPaquetes)
                .select('*');

            if (solicitudError) throw solicitudError
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['transferencias'])
        },
        onError: (err) => {
            console.log(err)
        }
    })

    const updateTransferencia = useMutation({
        mutationFn: async ({ id, ...rest }) => {
            const { error } = await supabase
                .from('transferencia_sucursal')
                .update(rest)
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['transferencias'])
        }
    })

    return { createTransferencia, updateTransferencia }
}
