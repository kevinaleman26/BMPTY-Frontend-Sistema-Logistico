// src/hooks/useClientesBasic.js
'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

export const useClientesBasic = (sucursalId = 0) => {
    return useQuery({
        queryKey: ['clientes-basic', sucursalId],
        enabled: !!sucursalId,
        queryFn: async () => {

            let query = supabase
                .from('cliente')
                .select('id, email, full_name')
                .order('full_name', { ascending: true })

            if (sucursalId !== 0) query = query.eq('sucursal_id', sucursalId)

            const { data, error } = await query
            if (error) throw error
            return data
        }
    })
}
