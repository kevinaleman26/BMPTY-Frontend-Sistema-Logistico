// src/hooks/useClientesBasic.js
'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

export const useClientesBasic = () => {
    return useQuery({
        queryKey: ['clientes-basic'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('cliente')
                .select('id, email, full_name')
                .order('full_name', { ascending: true })
            if (error) throw error
            return data
        }
    })
}
