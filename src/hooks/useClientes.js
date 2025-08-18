'use client'

import { useSession } from '@/hooks/useSession'; // <-- tu hook de sesión
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

export function useClientes() {
    const searchParams = useSearchParams()
    const { session, loading } = useSession()

    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10

    const nombre = searchParams.get('nombre') || ''
    const documento = searchParams.get('documento') || ''
    const sucursalId = searchParams.get('sucursal_id') || ''
    const tipoDocumentoId = searchParams.get('document_type') || ''

    const from = (page - 1) * limit
    const to = from + limit - 1

    const queryKey = ['clientes', { page, limit, nombre, documento, sucursalId, tipoDocumentoId, user: session?.user?.id }]

    const queryFn = async () => {

        let query;

        if (session.role.id !== 1) {
            query = supabase
                .from('cliente')
                .select(
                    '*, sucursal(id, name), tipo_documento(id,name)',
                    { count: 'exact' }
                )
                .range(from, to)
                .eq("sucursal_id", session.sucursal_id)
        } else {
            query = supabase
                .from('cliente')
                .select(
                    '*, sucursal(id, name), tipo_documento(id,name)',
                    { count: 'exact' }
                )
                .range(from, to)
        }

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
        queryFn,
        enabled: !!session && !loading, // 👈 espera a que la sesión esté lista
    })

    return {
        data,
        isLoading: isLoading || loading, // 👈 cubre también el loading de la sesión
        isError,
        error,
        count: data?.count || 0,
        page,
        limit,
        session, // 👈 lo devuelvo por si quieres usar datos de sesión en el componente
    }
}
