'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

/**
 * Hook para obtener facturas y paquetes de una sucursal específica
 * Retorna: facturas pagadas, facturas pendientes, totales
 */
export const useSucursalPackages = (sucursalId) => {
    const queryKey = ['sucursal-packages', sucursalId]

    const queryFn = async () => {
        if (!sucursalId) return { paid: [], unpaid: [], totalPaid: 0, totalUnpaid: 0 }

        // Obtener todas las facturas de la sucursal con sus detalles
        const { data: facturas, error } = await supabase
            .from('factura')
            .select(`
                id,
                payment_status,
                delivery_status,
                total,
                created_at,
                cliente:cliente_id ( id, full_name, email ),
                metodo_pago:metodo_pago ( name ),
                factura_detalle (
                    id,
                    paquete_id,
                    proveedor_paquetes:proveedor_paquetes!factura_detalle_paquete_id_fkey (
                        codigo, tipo, peso, precio
                    )
                )
            `)
            .eq('sucursal_id', sucursalId)
            .order('created_at', { ascending: false })

        if (error) throw error

        // Separar facturas pagadas y pendientes
        const paid = facturas?.filter(f => f.payment_status) || []
        const unpaid = facturas?.filter(f => !f.payment_status) || []

        // Calcular totales
        const totalPaid = paid.reduce((sum, f) => sum + (f.total || 0), 0)
        const totalUnpaid = unpaid.reduce((sum, f) => sum + (f.total || 0), 0)

        return { paid, unpaid, totalPaid, totalUnpaid }
    }

    const { data, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn,
        enabled: !!sucursalId,
    })

    return {
        paid: data?.paid || [],
        unpaid: data?.unpaid || [],
        totalPaid: data?.totalPaid || 0,
        totalUnpaid: data?.totalUnpaid || 0,
        isLoading,
        isError,
        error,
    }
}
