// hooks/useTransferencias.js
'use client'

import { useSession } from '@/hooks/useSession'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

export const useTransferencias = () => {
    const searchParams = useSearchParams()
    const { session, loading } = useSession()

    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10
    const factura_id = searchParams.get('factura_id') || ''
    const metodo_pago = searchParams.get('metodo_pago') || ''
    const emisor_sucursal = searchParams.get('emisor_sucursal') || ''
    const receptor_sucursal = searchParams.get('receptor_sucursal') || ''
    const delivery_status = searchParams.get('delivery_status') || ''
    const payment_status = searchParams.get('payment_status') || ''

    const offset = (page - 1) * limit

    const queryKey = ['transferencias', { page, limit, factura_id, metodo_pago, emisor_sucursal, receptor_sucursal, delivery_status, payment_status }]

    const queryFn = async () => {
        // Obtener ID de la sucursal "ROBOT" para excluirla
        const { data: robotSucursal } = await supabase
            .from('sucursal')
            .select('id')
            .eq('name', 'ROBOT')
            .maybeSingle()

        let query;
        if (session.role.id !== 1) {
            query = supabase
                .from('transferencia_sucursal')
                .select(`
                id,
                delivery_status,
                payment_status,
                delivery_date,
                payment_date,
                created_at,
                metodo_pago (
                    id,
                    name
                ),
                emisor_sucursal: sucursal!transferencia_sucursal_emisor_sucursal_id_fkey (
                    id,
                    name
                ),
                receptor_sucursal: sucursal!transferencia_sucursal_receptor_sucursal_id_fkey (
                    id,
                    name
                ),
                solicitud_paquete:solicitud_paquete!solicitud_paquete_transferencia_id_fkey (
                    paquete_id
                )
            `, { count: 'exact' })
                .range(offset, offset + limit - 1)
                .eq("emisor_sucursal_id", session.sucursal.id)
        } else {
            query = supabase
                .from('transferencia_sucursal')
                .select(`
                id,
                delivery_status,
                payment_status,
                delivery_date,
                payment_date,
                created_at,
                metodo_pago (
                    id,
                    name
                ),
                emisor_sucursal: sucursal!transferencia_sucursal_emisor_sucursal_id_fkey (
                    id,
                    name
                ),
                receptor_sucursal: sucursal!transferencia_sucursal_receptor_sucursal_id_fkey (
                    id,
                    name
                ),
                solicitud_paquete:solicitud_paquete!solicitud_paquete_transferencia_id_fkey (
                    paquete_id
                )
            `, { count: 'exact' })
                .range(offset, offset + limit - 1)
        }

        // Excluir transferencias de sucursal emisora "ROBOT"
        if (robotSucursal?.id) {
            query = query.neq('emisor_sucursal_id', robotSucursal.id)
        }

        // Filtros dinámicos
        if (factura_id) query = query.eq('id', Number(factura_id))
        if (metodo_pago) query = query.eq('metodo_pago_id', Number(metodo_pago))
        if (emisor_sucursal) query = query.eq('emisor_sucursal_id', Number(emisor_sucursal))
        if (receptor_sucursal) query = query.eq('receptor_sucursal_id', Number(receptor_sucursal))
        if (delivery_status) query = query.eq('delivery_status', delivery_status === 'true')
        if (payment_status) query = query.eq('payment_status', payment_status === 'true')

        const { data, count, error } = await query

        if (error) throw error

        return { data, count }
    }

    const { data, isLoading, isError, error } = useQuery({ queryKey, queryFn, enabled: !!session && !loading, })

    return {
        data: data || { data: [], count: 0 },
        isLoading: isLoading || loading,
        isError,
        error,
        page,
        limit,
        factura_id,
        metodo_pago,
        emisor_sucursal,
        receptor_sucursal,
        delivery_status,
        payment_status,
        count: data?.count || 0
    }
}
