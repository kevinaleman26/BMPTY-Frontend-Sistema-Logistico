'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

/**
 * Hook para verificar el estado de facturación de un paquete.
 *
 * - estaFacturado:      el paquete aparece en factura_detalle
 * - estaPagado:         la factura relacionada tiene payment_status = true
 * - bloqueadoParaEditar: facturado Y pagado → edición completamente bloqueada
 *   (si solo está facturado pero no pagado se permite editar con advertencia)
 */
export const usePaqueteFacturado = (codigoPaquete) => {
    const queryKey = ['paquete-facturado', codigoPaquete]

    const queryFn = async () => {
        if (!codigoPaquete) return { estaFacturado: false, estaPagado: false }

        const { data, error } = await supabase
            .from('factura_detalle')
            .select('id, factura:factura_id(payment_status)')
            .eq('paquete_id', codigoPaquete)
            .limit(1)
            .maybeSingle()

        if (error) throw error

        if (!data) return { estaFacturado: false, estaPagado: false }

        return {
            estaFacturado: true,
            estaPagado: data.factura?.payment_status === true,
        }
    }

    const { data, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn,
        enabled: !!codigoPaquete,
    })

    const estaFacturado = data?.estaFacturado ?? false
    const estaPagado    = data?.estaPagado    ?? false

    return {
        estaFacturado,
        estaPagado,
        bloqueadoParaEditar: estaFacturado && estaPagado,
        isLoading,
        isError,
        error,
    }
}
