'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

export const usePaquetes = () => {
    const searchParams = useSearchParams()

    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10
    const factura_id = searchParams.get('factura_id') || ''
    const tipo = searchParams.get('tipo') || ''
    const codigo = searchParams.get('codigo') || ''

    const offset = (page - 1) * limit

    const queryKey = ['paquetes', { page, limit, factura_id, tipo, codigo }]

    const queryFn = async () => {
        let query = supabase
            .from('proveedor_paquetes')
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1)

        if (factura_id) query = query.ilike('factura_id', `%${factura_id}%`)
        if (tipo) query = query.ilike('tipo', `%${tipo}%`)
        if (codigo) query = query.ilike('codigo', `%${codigo}%`)

        const { data, count, error } = await query

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
        factura_id,
        tipo,
        codigo,
        count: data?.count || 0
    }
}
