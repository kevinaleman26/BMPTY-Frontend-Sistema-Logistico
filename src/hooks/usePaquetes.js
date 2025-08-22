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

    // clave incluye receptor para revalidar al cambiar de sucursal
    const queryKey = ['paquetes', { page, limit, factura_id, tipo, codigo, receptor: session?.sucursal?.id }]

    const queryFn = async () => {
        if (!session?.sucursal?.id) return { data: [], count: 0 }

        // 1) transferencia_sucursal -> IDs
        let tsQuery = supabase
            .from('transferencia_sucursal')
            .select('id')
            .eq('receptor_sucursal_id', session.sucursal.id)

        if (factura_id) tsQuery = tsQuery.ilike('factura_id', `%${factura_id}%`)

        const { data: tsRows, error: tsError } = await tsQuery
        if (tsError) throw tsError

        const solicitudIds = (tsRows ?? []).map(r => r.id)
        if (solicitudIds.length === 0) return { data: [], count: 0 }

        // 2) solicitud_paquete -> paquete_id (limitamos con RANGE para acelerar)
        //    Usamos una ventana dinámica que garantice suficientes candidatos para paginar.
        //    Heurística: traer hasta (offset + limit*4) filas (capadas por un máximo duro).
        const SP_MULTIPLIER = 4
        const SP_HARD_CAP = 4000
        const spUpperBound = Math.min(offset + limit * SP_MULTIPLIER, SP_HARD_CAP) - 1

        let spQuery = supabase
            .from('solicitud_paquete')
            .select('paquete_id, transferencia_id')
            .in('transferencia_id', solicitudIds)
            .order('transferencia_id', { ascending: false }) // determinismo (más recientes primero)
            .range(0, Math.max(spUpperBound, 0))

        const { data: spRows, error: spError } = await spQuery
        if (spError) throw spError

        const paqueteCodigos = Array.from(new Set((spRows ?? []).map(r => r.paquete_id)))
        if (paqueteCodigos.length === 0) return { data: [], count: 0 }

        // 3a) COUNT exacto en proveedor_paquetes sobre el subconjunto de códigos + filtros finales
        let countQuery = supabase
            .from('proveedor_paquetes')
            .select('id', { count: 'exact', head: true })
            .in('codigo', paqueteCodigos)

        if (tipo) countQuery = countQuery.ilike('tipo', `%${tipo}%`)
        if (codigo) countQuery = countQuery.ilike('codigo', `%${codigo}%`)

        const { count, error: countError } = await countQuery
        if (countError) throw countError

        // 3b) PAGE de filas en proveedor_paquetes (paginación real en el subconjunto)
        let rowsQuery = supabase
            .from('proveedor_paquetes')
            .select('*')
            .in('codigo', paqueteCodigos)

        if (tipo) rowsQuery = rowsQuery.ilike('tipo', `%${tipo}%`)
        if (codigo) rowsQuery = rowsQuery.ilike('codigo', `%${codigo}%`)

        rowsQuery = rowsQuery
            .order('id', { ascending: false })       // orden estable
            .range(offset, offset + limit - 1)       // paginación real

        const { data: rows, error: rowsError } = await rowsQuery
        if (rowsError) throw rowsError

        return { data: rows ?? [], count: count ?? 0 }
    }

    const { data, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn,
        enabled: !!session && !loading,
        keepPreviousData: true
    })

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
