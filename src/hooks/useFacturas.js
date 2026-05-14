// src/hooks/useFacturas.js
'use client'

import { useSession } from '@/hooks/useSession'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

export const useFacturas = () => {
    const searchParams = useSearchParams()
    const { session, loading } = useSession()

    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10

    // Filtros
    const numero = searchParams.get('numero') || ''
    const payment_status = searchParams.get('payment_status') || ''
    const delivery_status = searchParams.get('delivery_status') || ''
    const fecha_desde = searchParams.get('fecha_desde') || ''
    const fecha_hasta = searchParams.get('fecha_hasta') || ''
    const orderBy = searchParams.get('orderBy') || 'created_at'
    const orderDir = searchParams.get('orderDir') || 'desc'

    const offset = (page - 1) * limit
    const queryKey = ['facturas', { page, limit, numero, payment_status, delivery_status, fecha_desde, fecha_hasta, orderBy, orderDir }]

    const queryFn = async () => {
        let query = supabase
            .from('factura')
            .select(`
                id,
                delivery_status,
                payment_status,
                subtotal,
                descuento,
                otros,
                impuestos,
                total,
                created_at,
                sucursal:sucursal_id ( id, name, ruc, address, razon_social, telefono, email ),
                metodo_pago:metodo_pago ( id, name ),
                cliente:cliente_id ( id, full_name, email, tarifa, phone, codigo, sucursal:sucursal_id(id, name) ),
                factura_detalle (
                    id,
                    paquete_id,
                    proveedor_paquetes:proveedor_paquetes!factura_detalle_paquete_id_fkey (
                        id, codigo, tipo, largo, alto, ancho, peso, precio
                    )
                )
            `, { count: 'exact' })
            .order(orderBy, { ascending: orderDir === 'asc' })
            .range(offset, offset + limit - 1)

        if (session.role.id !== 1) query = query.eq("sucursal_id", session.sucursal.id)
        if (numero) query = query.eq('id', Number(numero))
        if (payment_status) query = query.eq('payment_status', payment_status === 'true')
        if (delivery_status) query = query.eq('delivery_status', delivery_status === 'true')
        if (fecha_desde) query = query.gte('created_at', fecha_desde)
        if (fecha_hasta) query = query.lte('created_at', `${fecha_hasta}T23:59:59`)

        const { data, error, count } = await query
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
        numero,
        payment_status,
        delivery_status,
        fecha_desde,
        fecha_hasta,
        orderBy,
        orderDir,
        count: data?.count || 0
    }
}
