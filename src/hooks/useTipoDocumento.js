// src/hooks/useTipoDocumento.js
'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

export function useTipoDocumento() {
    return useQuery({
        queryKey: ['tipo_documento'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tipo_documento')
                .select('id, name')
                .eq('status', true)
                .order('name', { ascending: true })

            if (error) throw error
            return data
        }
    })
}
