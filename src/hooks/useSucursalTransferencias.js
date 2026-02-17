'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

/**
 * Hook para obtener transferencias de una sucursal específica
 * Retorna: transferencias enviadas, transferencias recibidas, deudas y totales
 */
export const useSucursalTransferencias = (sucursalId) => {
    const queryKey = ['sucursal-transferencias', sucursalId]

    const queryFn = async () => {
        if (!sucursalId) return {
            enviadas: [],
            recibidas: [],
            totalEnviado: 0,
            totalRecibido: 0,
            deudaAPagar: 0,      // Lo que esta sucursal debe a otras (recibió paquetes)
            deudaPorCobrar: 0    // Lo que otras sucursales le deben (envió paquetes)
        }

        // Obtener transferencias ENVIADAS por esta sucursal
        const { data: enviadasData, error: enviadasError } = await supabase
            .from('transferencia_sucursal')
            .select(`
                id,
                emisor_sucursal_id,
                receptor_sucursal_id,
                delivery_status,
                payment_status,
                total,
                created_at,
                delivery_date,
                payment_date,
                receptor_sucursal:receptor_sucursal_id (
                    id,
                    name
                ),
                metodo_pago:metodo_pago_id (
                    name
                ),
                solicitud_paquete (
                    paquete_id,
                    proveedor_paquetes:paquete_id (
                        codigo,
                        tipo,
                        peso,
                        precio
                    )
                )
            `)
            .eq('emisor_sucursal_id', sucursalId)
            .order('created_at', { ascending: false })

        if (enviadasError) throw enviadasError

        // Obtener transferencias RECIBIDAS por esta sucursal
        const { data: recibidasData, error: recibidasError } = await supabase
            .from('transferencia_sucursal')
            .select(`
                id,
                emisor_sucursal_id,
                receptor_sucursal_id,
                delivery_status,
                payment_status,
                total,
                created_at,
                delivery_date,
                payment_date,
                emisor_sucursal:emisor_sucursal_id (
                    id,
                    name
                ),
                metodo_pago:metodo_pago_id (
                    name
                ),
                solicitud_paquete (
                    paquete_id,
                    proveedor_paquetes:paquete_id (
                        codigo,
                        tipo,
                        peso,
                        precio
                    )
                )
            `)
            .eq('receptor_sucursal_id', sucursalId)
            .order('created_at', { ascending: false })

        if (recibidasError) throw recibidasError

        // Calcular totales de transferencias enviadas
        const totalEnviado = (enviadasData || []).reduce((sum, t) => sum + (Number(t.total) || 0), 0)

        // Calcular totales de transferencias recibidas
        const totalRecibido = (recibidasData || []).reduce((sum, t) => sum + (Number(t.total) || 0), 0)

        // Calcular deudas
        // Deuda a pagar: transferencias recibidas que aún no se han pagado
        const deudaAPagar = (recibidasData || [])
            .filter(t => !t.payment_status)
            .reduce((sum, t) => sum + (Number(t.total) || 0), 0)

        // Deuda por cobrar: transferencias enviadas que aún no nos han pagado
        const deudaPorCobrar = (enviadasData || [])
            .filter(t => !t.payment_status)
            .reduce((sum, t) => sum + (Number(t.total) || 0), 0)

        return {
            enviadas: enviadasData || [],
            recibidas: recibidasData || [],
            totalEnviado,
            totalRecibido,
            deudaAPagar,
            deudaPorCobrar
        }
    }

    const { data, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn,
        enabled: !!sucursalId,
    })

    return {
        enviadas: data?.enviadas || [],
        recibidas: data?.recibidas || [],
        totalEnviado: data?.totalEnviado || 0,
        totalRecibido: data?.totalRecibido || 0,
        deudaAPagar: data?.deudaAPagar || 0,
        deudaPorCobrar: data?.deudaPorCobrar || 0,
        isLoading,
        isError,
        error,
    }
}
