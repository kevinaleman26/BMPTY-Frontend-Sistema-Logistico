'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

export function useClientes() {
    const searchParams = useSearchParams()

    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10

    const nombre = searchParams.get('nombre') || ''
    const documento = searchParams.get('documento') || ''
    const sucursalId = searchParams.get('sucursal_id') || ''
    const tipoDocumentoId = searchParams.get('document_type') || ''

    const from = (page - 1) * limit
    const to = from + limit - 1

    const queryKey = ['clientes', { page, limit, nombre, documento, sucursalId, tipoDocumentoId }]

    const queryFn = async () => {
        let query = supabase
            .from('cliente')
            .select(
                '*, sucursal(id, name), tipo_documento(id,name)'
                , { count: 'exact' }
            )
            .range(from, to)

        if (nombre) query = query.ilike('full_name', `%${nombre}%`)
        if (documento) query = query.ilike('document_number', `%${documento}%`)
        if (sucursalId) query = query.eq('sucursal_id', sucursalId)
        if (tipoDocumentoId) query = query.eq('document_type', tipoDocumentoId)

        const { data, error, count } = await query

        if (error) throw error

        return { data, count }
    }

    const { data, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn
    })

    return {
        data,
        isLoading,
        isError,
        error,
        count: data?.count || 0,
        page,
        limit
    }
}
