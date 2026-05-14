'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

/**
 * Lightweight summary hook: totals and counts for a client.
 * Only fetches id, payment_status, total — no joins to details.
 * Paginated table data is handled by useClienteFacturas and useClientePaquetes.
 */
export const useClientePackages = (clienteId) => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['cliente-packages-summary', clienteId],
        queryFn: async () => {
            if (!clienteId) return { paidCount: 0, unpaidCount: 0, totalPaid: 0, totalUnpaid: 0 }

            const { data: facturas, error } = await supabase
                .from('factura')
                .select('id, payment_status, total')
                .eq('cliente_id', clienteId)

            if (error) throw error

            const paid = facturas?.filter(f => f.payment_status) || []
            const unpaid = facturas?.filter(f => !f.payment_status) || []

            return {
                paidCount: paid.length,
                unpaidCount: unpaid.length,
                totalPaid: paid.reduce((s, f) => s + (f.total || 0), 0),
                totalUnpaid: unpaid.reduce((s, f) => s + (f.total || 0), 0),
            }
        },
        enabled: !!clienteId,
    })

    return {
        paidCount: data?.paidCount || 0,
        unpaidCount: data?.unpaidCount || 0,
        totalPaid: data?.totalPaid || 0,
        totalUnpaid: data?.totalUnpaid || 0,
        isLoading,
        isError,
        error,
    }
}
