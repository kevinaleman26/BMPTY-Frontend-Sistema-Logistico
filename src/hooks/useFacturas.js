// src/hooks/useFacturas.js
'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

export const useFacturas = () => {
    const searchParams = useSearchParams()

    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10

    // Filtros iniciales (luego agregamos más si quieres)
    const numero = searchParams.get('numero') || ''
    const cliente = searchParams.get('cliente') || ''
    const status = searchParams.get('status') || ''

    const offset = (page - 1) * limit
    const queryKey = ['facturas', { page, limit, numero, cliente, status }]

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
                sucursal:sucursal_id ( id, name, ruc, address ),
                metodo_pago:metodo_pago ( id, name ),
                cliente:cliente_id ( id, full_name, email ),
                factura_detalle (
                    id,
                    paquete_id,
                    proveedor_paquetes:proveedor_paquetes!factura_detalle_paquete_id_fkey (
                        id, codigo, tipo, largo, alto, ancho, peso, precio
                    )
                )
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);


        if (numero) query = query.ilike('numero', `%${numero}%`)
        if (cliente) query = query.ilike('cliente_email', `%${cliente}%`)
        if (status) query = query.eq('status', status)

        const { data, error, count } = await query
        if (error) throw error
        return { data, count }
    }

    const { data, isLoading, isError, error } = useQuery({ queryKey, queryFn })

    return {
        data: data || { data: [], count: 0 },
        isLoading,
        isError,
        error,
        page,
        limit,
        numero,
        cliente,
        status,
        count: data?.count || 0
    }
}
