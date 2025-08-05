'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

export const useSucursales = () => {
    const searchParams = useSearchParams()

    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    const nombre = searchParams.get('name') || ''
    const direccion = searchParams.get('address') || ''
    const estado = searchParams.get('status') || ''

    const queryKey = ['sucursales', { page, limit, nombre, direccion, estado }]

    const queryFn = async () => {
        let query = supabase
            .from('sucursal')
            .select('*', { count: 'exact' })
            .range(from, to)

        if (nombre) query = query.ilike('name', `%${nombre}%`)
        if (direccion) query = query.ilike('address', `%${direccion}%`)
        if (estado) query = query.eq('status', estado === 'true')

        const { data, error, count } = await query

        if (error) throw error

        return { data, count }
    }

    const { data, isLoading, isError } = useQuery({ queryKey, queryFn })

    return {
        data: data || { data: [], count: 0 },
        count: data?.count || 0,
        isLoading,
        isError,
        page,
        limit
    }
}
