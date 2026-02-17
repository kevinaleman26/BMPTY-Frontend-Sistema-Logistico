'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

/**
 * Hook para verificar si un paquete ya fue facturado
 * Retorna true si el paquete existe en la tabla factura_detalle
 */
export const usePaqueteFacturado = (codigoPaquete) => {
    const queryKey = ['paquete-facturado', codigoPaquete]

    const queryFn = async () => {
        if (!codigoPaquete) return false

        const { data, error } = await supabase
            .from('factura_detalle')
            .select('id')
            .eq('paquete_id', codigoPaquete)
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows returned, que significa no está facturado
            throw error
        }

        // Si hay data, significa que está facturado
        return !!data
    }

    const { data, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn,
        enabled: !!codigoPaquete,
    })

    return {
        estaFacturado: data || false,
        isLoading,
        isError,
        error,
    }
}
