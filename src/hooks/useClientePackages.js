'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

/**
 * Hook para obtener facturas y paquetes de un cliente específico
 * Retorna: facturas pagadas, facturas pendientes, paquetes entregados, paquetes pendientes, totales
 */
export const useClientePackages = (clienteId) => {
    const queryKey = ['cliente-packages', clienteId]

    const queryFn = async () => {
        if (!clienteId) return {
            paid: [],
            unpaid: [],
            totalPaid: 0,
            totalUnpaid: 0,
            packagesDelivered: [],
            packagesPending: []
        }

        // Obtener todas las facturas del cliente con sus detalles
        const { data: facturas, error } = await supabase
            .from('factura')
            .select(`
                id,
                payment_status,
                delivery_status,
                total,
                created_at,
                sucursal:sucursal_id ( name ),
                metodo_pago:metodo_pago ( name ),
                factura_detalle (
                    id,
                    paquete_id,
                    proveedor_paquetes:proveedor_paquetes!factura_detalle_paquete_id_fkey (
                        codigo, tipo, peso, precio, largo, alto, ancho
                    )
                )
            `)
            .eq('cliente_id', clienteId)
            .order('created_at', { ascending: false })

        if (error) throw error

        // Separar facturas pagadas y pendientes
        const paid = facturas?.filter(f => f.payment_status) || []
        const unpaid = facturas?.filter(f => !f.payment_status) || []

        // Calcular totales
        const totalPaid = paid.reduce((sum, f) => sum + (f.total || 0), 0)
        const totalUnpaid = unpaid.reduce((sum, f) => sum + (f.total || 0), 0)

        // Extraer todos los paquetes con información de factura
        const allPackages = []
        facturas?.forEach(factura => {
            factura.factura_detalle?.forEach(detalle => {
                if (detalle.proveedor_paquetes) {
                    allPackages.push({
                        id: `${factura.id}-${detalle.paquete_id}`, // ID único
                        factura_id: factura.id,
                        factura_fecha: factura.created_at,
                        sucursal: factura.sucursal?.name,
                        delivery_status: factura.delivery_status,
                        payment_status: factura.payment_status,
                        ...detalle.proveedor_paquetes
                    })
                }
            })
        })

        // Separar paquetes entregados y pendientes
        const packagesDelivered = allPackages.filter(p => p.delivery_status)
        const packagesPending = allPackages.filter(p => !p.delivery_status)

        return {
            paid,
            unpaid,
            totalPaid,
            totalUnpaid,
            packagesDelivered,
            packagesPending
        }
    }

    const { data, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn,
        enabled: !!clienteId,
    })

    return {
        paid: data?.paid || [],
        unpaid: data?.unpaid || [],
        totalPaid: data?.totalPaid || 0,
        totalUnpaid: data?.totalUnpaid || 0,
        packagesDelivered: data?.packagesDelivered || [],
        packagesPending: data?.packagesPending || [],
        isLoading,
        isError,
        error,
    }
}
