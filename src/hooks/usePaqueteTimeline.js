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
        if (!codigoPaquete) return { eventos: [], transferenciaActiva: null }

        const [{ data: eventos, error }, { data: spRow }] = await Promise.all([
            supabase.rpc('obtener_cronologia_paquete', { p_paquete_id: codigoPaquete }),
            supabase
                .from('solicitud_paquete')
                .select('transferencia_id, transferencia:transferencia_id(id, delivery_status, payment_status, emisor:sucursal!transferencia_sucursal_emisor_sucursal_id_fkey(name), receptor:sucursal!transferencia_sucursal_receptor_sucursal_id_fkey(name))')
                .eq('paquete_id', codigoPaquete)
                .maybeSingle()
        ])

        if (error) throw error

        const ts = spRow?.transferencia
        const transferenciaActiva = ts && ts.delivery_status === false ? ts : null

        return { eventos: eventos || [], transferenciaActiva }
    }

    const { data, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn,
        enabled: !!codigoPaquete,
    })

    return {
        eventos: data?.eventos || [],
        transferenciaActiva: data?.transferenciaActiva || null,
        isLoading,
        isError,
        error,
    }
}
