'use client'

import { supabase } from '@/lib/supabase'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

/**
 * Paginated facturas for a specific client.
 * Uses server-side pagination via Supabase range() to avoid loading all records.
 * Uses keepPreviousData so the grid stays populated during page transitions.
 */
export const useClienteFacturas = (clienteId, { page, pageSize, paymentStatus }) => {
    const from = page * pageSize
    const to = from + pageSize - 1

    return useQuery({
        queryKey: ['cliente-facturas', clienteId, page, pageSize, paymentStatus],
        queryFn: async () => {
            const { data, count, error } = await supabase
                .from('factura')
                .select(`
                    id, payment_status, delivery_status, total, created_at,
                    sucursal:sucursal_id (name),
                    metodo_pago:metodo_pago (name),
                    factura_detalle (id)
                `, { count: 'exact' })
                .eq('cliente_id', clienteId)
                .eq('payment_status', paymentStatus)
                .order('created_at', { ascending: false })
                .range(from, to)

            if (error) throw error
            return { rows: data || [], total: count || 0 }
        },
        enabled: !!clienteId,
        placeholderData: keepPreviousData,
    })
}
