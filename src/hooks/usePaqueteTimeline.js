'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

/**
 * Hook para obtener la cronología completa de un paquete
 * Usa la función RPC obtener_cronologia_paquete creada en la migración
 */
export const usePaqueteTimeline = (codigoPaquete) => {
    const queryKey = ['paquete-timeline', codigoPaquete]

    const queryFn = async () => {
        if (!codigoPaquete) return []

        const { data, error } = await supabase
            .rpc('obtener_cronologia_paquete', {
                p_paquete_id: codigoPaquete
            })

        if (error) throw error

        return data || []
    }

    const { data, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn,
        enabled: !!codigoPaquete,
    })

    return {
        eventos: data || [],
        isLoading,
        isError,
        error,
    }
}
