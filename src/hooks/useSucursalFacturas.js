'use client'

import { supabase } from '@/lib/supabase'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

/**
 * Paginated facturas for a specific branch.
 * Uses server-side pagination via Supabase range() to avoid loading all records.
 * Uses keepPreviousData so the grid stays populated during page transitions.
 */
export const useSucursalFacturas = (sucursalId, { page, pageSize, paymentStatus }) => {
    const from = page * pageSize
    const to = from + pageSize - 1

    return useQuery({
        queryKey: ['sucursal-facturas', sucursalId, page, pageSize, paymentStatus],
        queryFn: async () => {
            const { data, count, error } = await supabase
                .from('factura')
                .select(`
                    id, payment_status, delivery_status, total, created_at,
                    cliente:cliente_id (full_name),
                    metodo_pago:metodo_pago (name),
                    factura_detalle (id)
                `, { count: 'exact' })
                .eq('sucursal_id', sucursalId)
                .eq('payment_status', paymentStatus)
                .order('created_at', { ascending: false })
                .range(from, to)

            if (error) throw error
            return { rows: data || [], total: count || 0 }
        },
        enabled: !!sucursalId,
        placeholderData: keepPreviousData,
    })
}
