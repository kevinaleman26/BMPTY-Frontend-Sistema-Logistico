'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

export const useOperadores = () => {
    const searchParams = useSearchParams()

    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10
    const full_name = searchParams.get('full_name') || ''
    const email = searchParams.get('email') || ''
    const role_id = searchParams.get('role_id') || ''

    const offset = (page - 1) * limit

    const queryKey = ['operadores', { page, limit, full_name, email, role_id }]

    const queryFn = async () => {
        let query = supabase
            .from('operador')
            .select('id, full_name, email, sucursal_id, role_id, role(name)', { count: 'exact' })
            .range(offset, offset + limit - 1)

        if (full_name) query = query.ilike('full_name', `%${full_name}%`)
        if (email) query = query.ilike('email', `%${email}%`)
        if (role_id) query = query.eq('role_id', role_id)

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
        full_name,
        email,
        role_id,
        count: data?.count || 0
    }
}
