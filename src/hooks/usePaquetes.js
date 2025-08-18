'use client'

import { useSession } from '@/hooks/useSession'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

export const usePaquetes = () => {
    const searchParams = useSearchParams()
    const { session, loading } = useSession()

    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10

    const factura_id = searchParams.get('factura_id') || ''
    const tipo = searchParams.get('tipo') || ''
    const codigo = searchParams.get('codigo') || ''

    const offset = (page - 1) * limit

    const queryKey = ['paquetes', { page, limit, factura_id, tipo, codigo }]

    const queryFn = async () => {
        let query = supabase
            .from('transferencia_sucursal')
            .select(`
                id,
                solicitud_paquete(
                    proveedor_paquetes(*)
                )
            `, { count: 'exact' })
            .eq('receptor_sucursal_id', session.sucursal.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);


        if (factura_id) query = query.ilike('factura_id', `%${factura_id}%`)
        if (tipo) query = query.ilike('tipo', `%${tipo}%`)
        if (codigo) query = query.ilike('codigo', `%${codigo}%`)

        const { data, count, error } = await query

        let response = []
        data.map(item => {
            item.solicitud_paquete.map(item => {
                if (response.find(element => element.id === item.proveedor_paquetes.id)) {
                    return
                }
                response.push(item.proveedor_paquetes)
            })
        })

        if (error) throw error
        return { data: response, count }
    }

    const { data, isLoading, isError, error } = useQuery({ queryKey, queryFn, enabled: !!session && !loading, })

    return {
        data: data || { data: [], count: 0 },
        isLoading,
        isError,
        error,
        page,
        limit,
        factura_id,
        tipo,
        codigo,
        count: data?.count || 0
    }
}
