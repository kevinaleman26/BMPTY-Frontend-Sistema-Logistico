'use client'

import { useSession } from '@/hooks/useSession'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

export const usePaquetes = ({ soloDisponibles = false, localPage, localLimit } = {}) => {
    const searchParams = useSearchParams()
    const { session, loading } = useSession()

    const page = localPage ?? (Number(searchParams.get('page')) || 1)
    const limit = localLimit ?? (Number(searchParams.get('limit')) || 10)

    const factura_id = searchParams.get('factura_id') || ''
    const tipo = searchParams.get('tipo') || ''
    const codigo = searchParams.get('codigo') || ''
    const orderBy = searchParams.get('orderBy') || 'codigo'
    const orderDir = searchParams.get('orderDir') || 'desc'

    const offset = (page - 1) * limit

    const queryKey = ['paquetes', { page, limit, factura_id, tipo, codigo, orderBy, orderDir, sucursal: session?.sucursal?.id, soloDisponibles }]

    const queryFn = async () => {
        if (!session?.sucursal?.id) return { data: [], count: 0 }

        // ─── PATH A: paquetes recibidos via transferencia ───────────────────────
        let tsQuery = supabase
            .from('transferencia_sucursal')
            .select('id')
            .eq('receptor_sucursal_id', session.sucursal.id)

        // Transferencias canceladas eliminan sus solicitud_paquete al cancelarse,
        // por lo que no aparecen aquí. Incluimos transferencias entregadas Y
        // en tránsito: el equipo puede facturar/transferir paquetes recibidos
        // antes de marcar formalmente como entregada la transferencia entrante.
        // La exclusión de transferencias SALIENTES activas (más abajo) previene
        // el doble-envío de paquetes que ya están en camino a otra sucursal.

        if (factura_id) tsQuery = tsQuery.ilike('factura_id', `%${factura_id}%`)

        // ─── PATH B: paquetes registrados directamente en esta sucursal ─────────
        // Paquetes con sucursal_origen_id = esta sucursal y sin ninguna solicitud_paquete
        const directQuery = supabase
            .from('proveedor_paquetes')
            .select('codigo, solicitud_paquete:solicitud_paquete(paquete_id)')
            .eq('sucursal_origen_id', session.sucursal.id)
            .is('solicitud_paquete.paquete_id', null)

        // Ejecutar ambas queries en paralelo
        const [{ data: tsRows, error: tsError }, { data: directRaw }] = await Promise.all([
            tsQuery,
            directQuery,
        ])

        if (tsError) throw tsError

        // Códigos de paquetes registrados directamente
        const codigosDirectos = (directRaw ?? []).map(r => r.codigo)

        // Códigos de paquetes recibidos via transferencia
        let codigosTransferidos = []
        const solicitudIds = (tsRows ?? []).map(r => r.id)

        if (solicitudIds.length > 0) {
            const SP_HARD_CAP = 4000

            const { data: spRows, error: spError } = await supabase
                .from('solicitud_paquete')
                .select('paquete_id')
                .in('transferencia_id', solicitudIds)
                .order('transferencia_id', { ascending: false })
                .range(0, SP_HARD_CAP - 1)

            if (spError) throw spError
            codigosTransferidos = (spRows ?? []).map(r => r.paquete_id)
        }

        // Unión de ambas fuentes (sin duplicados)
        let paqueteCodigos = [...new Set([...codigosTransferidos, ...codigosDirectos])]
        if (paqueteCodigos.length === 0) return { data: [], count: 0 }

        // ─── EXCLUSIONES (solo cuando soloDisponibles) ───────────────────────────
        if (soloDisponibles) {
            // Paquetes en transferencias salientes activas desde esta sucursal
            const { data: outgoingTs } = await supabase
                .from('transferencia_sucursal')
                .select('id')
                .eq('emisor_sucursal_id', session.sucursal.id)
                .eq('delivery_status', false)

            const [enTransitoData, facturadosData] = await Promise.all([
                outgoingTs?.length > 0
                    ? supabase
                        .from('solicitud_paquete')
                        .select('paquete_id')
                        .in('transferencia_id', outgoingTs.map(r => r.id))
                        .in('paquete_id', paqueteCodigos)
                        .then(r => r.data)
                    : Promise.resolve([]),
                supabase
                    .from('factura_detalle')
                    .select('paquete_id')
                    .in('paquete_id', paqueteCodigos)
                    .then(r => r.data),
            ])

            const codigosExcluidos = new Set([
                ...(enTransitoData ?? []).map(r => r.paquete_id),
                ...(facturadosData ?? []).map(r => r.paquete_id),
            ])

            paqueteCodigos = paqueteCodigos.filter(c => !codigosExcluidos.has(c))
            if (paqueteCodigos.length === 0) return { data: [], count: 0 }
        }

        // ─── FETCH PAGINADO ──────────────────────────────────────────────────────
        let countQuery = supabase
            .from('proveedor_paquetes')
            .select('id', { count: 'exact', head: true })
            .in('codigo', paqueteCodigos)

        if (tipo) countQuery = countQuery.ilike('tipo', `%${tipo}%`)
        if (codigo) countQuery = countQuery.ilike('codigo', `%${codigo}%`)

        let rowsQuery = supabase
            .from('proveedor_paquetes')
            .select('*')
            .in('codigo', paqueteCodigos)

        if (tipo) rowsQuery = rowsQuery.ilike('tipo', `%${tipo}%`)
        if (codigo) rowsQuery = rowsQuery.ilike('codigo', `%${codigo}%`)

        rowsQuery = rowsQuery
            .order(orderBy, { ascending: orderDir === 'asc' })
            .range(offset, offset + limit - 1)

        if (soloDisponibles) {
            const [
                { count, error: countError },
                { data: rows, error: rowsError }
            ] = await Promise.all([countQuery, rowsQuery])

            if (countError) throw countError
            if (rowsError) throw rowsError

            return { data: rows ?? [], count: count ?? 0 }
        } else {
            // Tabla general: muestra todos marcando cuáles están facturados
            const facturadosQuery = supabase
                .from('factura_detalle')
                .select('paquete_id')
                .in('paquete_id', paqueteCodigos)

            const [
                { count, error: countError },
                { data: rows, error: rowsError },
                { data: facturadosData }
            ] = await Promise.all([countQuery, rowsQuery, facturadosQuery])

            if (countError) throw countError
            if (rowsError) throw rowsError

            const codigosFacturados = new Set((facturadosData ?? []).map(item => item.paquete_id))

            const rowsConFacturado = (rows ?? []).map(row => ({
                ...row,
                facturado: codigosFacturados.has(row.codigo)
            }))

            return { data: rowsConFacturado, count: count ?? 0 }
        }
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
        orderBy,
        orderDir,
        count: data?.count || 0
    }
}
