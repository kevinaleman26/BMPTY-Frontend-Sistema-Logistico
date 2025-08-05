// src/hooks/useSucursal.js
'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

export function useSucursal() {
    return useQuery({
        queryKey: ['sucursal'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sucursal')
                .select('id, name, tasa')
                .eq('status', true)
                .order('name', { ascending: true })

            if (error) throw error
            return data
        }
    })
}
