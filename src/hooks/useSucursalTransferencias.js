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
        if (!sucursalId) {
            console.log('❌ useSucursalTransferencias: No sucursalId provided')
            return {
                enviadas: [],
                recibidas: [],
                totalEnviado: 0,
                totalRecibido: 0,
                deudaAPagar: 0,
                deudaPorCobrar: 0
            }
        }

        console.log('🔍 useSucursalTransferencias: Fetching data for sucursalId:', sucursalId)

        // ⚡ Ejecutar ambas queries en paralelo para mejor performance
        const enviadasQuery = supabase
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
                receptor_sucursal:sucursal!transferencia_sucursal_receptor_sucursal_id_fkey (
                    id,
                    name
                ),
                metodo_pago:metodo_pago_id (
                    name
                ),
                solicitud_paquete (
                    paquete_id
                )
            `)
            .eq('emisor_sucursal_id', sucursalId)
            .order('created_at', { ascending: false })

        const recibidasQuery = supabase
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
                emisor_sucursal:sucursal!transferencia_sucursal_emisor_sucursal_id_fkey (
                    id,
                    name
                ),
                metodo_pago:metodo_pago_id (
                    name
                ),
                solicitud_paquete (
                    paquete_id
                )
            `)
            .eq('receptor_sucursal_id', sucursalId)
            .order('created_at', { ascending: false })

        // Ejecutar ambas queries simultáneamente
        const [
            { data: enviadasData, error: enviadasError },
            { data: recibidasData, error: recibidasError }
        ] = await Promise.all([enviadasQuery, recibidasQuery])

        console.log('📤 Enviadas:', { count: enviadasData?.length || 0, data: enviadasData, error: enviadasError })
        console.log('📥 Recibidas:', { count: recibidasData?.length || 0, data: recibidasData, error: recibidasError })

        if (enviadasError) {
            console.error('❌ Error fetching enviadas:', enviadasError)
            throw enviadasError
        }

        if (recibidasError) {
            console.error('❌ Error fetching recibidas:', recibidasError)
            throw recibidasError
        }

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

        const result = {
            enviadas: enviadasData || [],
            recibidas: recibidasData || [],
            totalEnviado,
            totalRecibido,
            deudaAPagar,
            deudaPorCobrar
        }

        console.log('✅ useSucursalTransferencias result:', result)

        return result
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
