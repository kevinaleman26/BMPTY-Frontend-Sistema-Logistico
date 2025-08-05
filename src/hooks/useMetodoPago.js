'use client'


import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

export const useMetodoPago = () => {
    return useQuery({
        queryKey: ['metodo_pago'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('metodo_pago')
                .select('id, name')
                .eq('status', true)
                .order('name', { ascending: true })

            if (error) throw error
            return data
        }
    })
}
