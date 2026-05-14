'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const get8WeeksAgo = () => {
    const d = new Date()
    d.setDate(d.getDate() - 56)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
}

const buildWeekBuckets = (n = 8) => {
    const now = new Date()
    return Array.from({ length: n }, (_, i) => {
        const weekEnd = new Date(now)
        weekEnd.setDate(weekEnd.getDate() - (n - 1 - i) * 7)
        weekEnd.setHours(23, 59, 59, 999)
        const weekStart = new Date(weekEnd)
        weekStart.setDate(weekStart.getDate() - 6)
        weekStart.setHours(0, 0, 0, 0)
        return {
            label: weekStart.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
            start: weekStart,
            end: weekEnd,
        }
    })
}

const assignToWeek = (items, dateField, weeks) => {
    const buckets = weeks.map(w => ({ ...w, count: 0, total: 0 }))
    items.forEach(item => {
        const date = new Date(item[dateField])
        const idx = buckets.findIndex(b => date >= b.start && date <= b.end)
        if (idx !== -1) {
            buckets[idx].count++
            if (item.total) buckets[idx].total += item.total || 0
        }
    })
    return buckets
}

export const getTimeAgo = (dateStr) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins}m`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `Hace ${diffHours}h`
    const diffDays = Math.floor(diffHours / 24)
    return `Hace ${diffDays}d`
}

// ─── Hook: KPIs ──────────────────────────────────────────────────────────────

/**
 * Fetches high-level counts and totals for the dashboard header cards.
 * Automatically scoped by role: SuperAdmin sees all, Admin/Operador see their branch,
 * Cliente sees only their own data.
 */
export const useDashboardKPIs = (user) => {
    const isSuperAdmin = user?.role?.id === 1
    const isCliente = user?.role?.id === 4
    const sucursalId = (!isSuperAdmin && !isCliente) ? user?.sucursal?.id : null
    const clienteId = isCliente ? user?.id : null

    return useQuery({
        queryKey: ['dashboard-kpis', user?.role?.id, sucursalId, clienteId],
        queryFn: async () => {
            const [paquetesRes, facturasRes, clientesRes, transferenciasRes] = await Promise.all([
                // Paquetes count
                (() => {
                    let q = supabase.from('proveedor_paquetes').select('id', { count: 'exact', head: true })
                    if (sucursalId) q = q.eq('sucursal_origen_id', sucursalId)
                    return q
                })(),
                // Facturas with totals (for revenue KPIs)
                (() => {
                    let q = supabase.from('factura').select('total, payment_status')
                    if (sucursalId) q = q.eq('sucursal_id', sucursalId)
                    if (clienteId) q = q.eq('cliente_id', clienteId)
                    return q
                })(),
                // Clientes count (not for cliente role)
                isCliente
                    ? Promise.resolve({ count: 0, error: null })
                    : (() => {
                        let q = supabase.from('cliente').select('id', { count: 'exact', head: true })
                        if (sucursalId) q = q.eq('sucursal_id', sucursalId)
                        return q
                    })(),
                // Transferencias count (not for cliente role)
                isCliente
                    ? Promise.resolve({ count: 0, error: null })
                    : (() => {
                        let q = supabase.from('transferencia_sucursal').select('id', { count: 'exact', head: true })
                        if (sucursalId) q = q.or(`emisor_sucursal_id.eq.${sucursalId},receptor_sucursal_id.eq.${sucursalId}`)
                        return q
                    })(),
            ])

            if (paquetesRes.error) throw paquetesRes.error
            if (facturasRes.error) throw facturasRes.error

            const facturas = facturasRes.data || []
            const ingresoPagado = facturas
                .filter(f => f.payment_status)
                .reduce((s, f) => s + (f.total || 0), 0)
            const ingresoPendiente = facturas
                .filter(f => !f.payment_status)
                .reduce((s, f) => s + (f.total || 0), 0)

            return {
                paquetes: paquetesRes.count || 0,
                facturas: facturas.length,
                clientes: clientesRes?.count || 0,
                transferencias: transferenciasRes?.count || 0,
                ingresoPagado: Math.round(ingresoPagado * 100) / 100,
                ingresoPendiente: Math.round(ingresoPendiente * 100) / 100,
            }
        },
        enabled: !!user?.id,
        staleTime: 2 * 60 * 1000,
    })
}

// ─── Hook: Chart Data ────────────────────────────────────────────────────────

/**
 * Fetches time-series and distribution data for all charts.
 * Returns last 8 weeks of data, grouped by week.
 */
export const useDashboardCharts = (user) => {
    const isSuperAdmin = user?.role?.id === 1
    const isCliente = user?.role?.id === 4
    const sucursalId = (!isSuperAdmin && !isCliente) ? user?.sucursal?.id : null
    const clienteId = isCliente ? user?.id : null
    const since = get8WeeksAgo()

    return useQuery({
        queryKey: ['dashboard-charts', user?.role?.id, sucursalId, clienteId],
        queryFn: async () => {
            const weeks = buildWeekBuckets(8)

            const [paquetesRes, facturasRes, transferenciaRes, branchRevenueRes] = await Promise.all([
                // Packages time-series
                isCliente
                    ? Promise.resolve({ data: [], error: null })
                    : (() => {
                        let q = supabase
                            .from('proveedor_paquetes')
                            .select('created_at')
                            .gte('created_at', since)
                        if (sucursalId) q = q.eq('sucursal_origen_id', sucursalId)
                        return q
                    })(),
                // Invoices time-series (all + paid breakdown)
                (() => {
                    let q = supabase
                        .from('factura')
                        .select('total, payment_status, delivery_status, created_at')
                        .gte('created_at', since)
                    if (sucursalId) q = q.eq('sucursal_id', sucursalId)
                    if (clienteId) q = q.eq('cliente_id', clienteId)
                    return q
                })(),
                // Transfers time-series
                isCliente
                    ? Promise.resolve({ data: [], error: null })
                    : (() => {
                        let q = supabase
                            .from('transferencia_sucursal')
                            .select('created_at, delivery_status')
                            .gte('created_at', since)
                        if (sucursalId) q = q.or(
                            `emisor_sucursal_id.eq.${sucursalId},receptor_sucursal_id.eq.${sucursalId}`
                        )
                        return q
                    })(),
                // Revenue by branch (SuperAdmin only — all time, top branches)
                isSuperAdmin
                    ? supabase
                        .from('factura')
                        .select('total, sucursal:sucursal_id(name)')
                        .eq('payment_status', true)
                    : Promise.resolve({ data: [], error: null }),
            ])

            if (facturasRes.error) throw facturasRes.error

            // Packages per week
            const paquetesWeeks = assignToWeek(paquetesRes.data || [], 'created_at', weeks)
            const paquetesPorSemana = paquetesWeeks.map(w => ({ semana: w.label, paquetes: w.count }))

            // Revenue per week (only paid invoices)
            const paidFacturas = (facturasRes.data || []).filter(f => f.payment_status)
            const revenueWeeks = assignToWeek(paidFacturas, 'created_at', weeks)
            const ingresosPorSemana = revenueWeeks.map(w => ({
                semana: w.label,
                ingresos: Math.round(w.total * 100) / 100,
            }))

            // Package status (from all invoiced packages delivery_status)
            const allFacturas = facturasRes.data || []
            const entregadas = allFacturas.filter(f => f.delivery_status).length
            const pendientesEntrega = allFacturas.filter(f => !f.delivery_status).length
            const estadoPaquetes = [
                { id: 'Entregado', value: entregadas, color: '#4caf50' },
                { id: 'Pendiente', value: pendientesEntrega, color: '#f4b223' },
            ]

            // Invoice payment status
            const pagadas = allFacturas.filter(f => f.payment_status).length
            const noPagadas = allFacturas.filter(f => !f.payment_status).length
            const facturasPorEstado = [
                { id: 'Pagadas', value: pagadas, color: '#4caf50' },
                { id: 'Pendientes', value: noPagadas, color: '#d32f2f' },
            ]

            // Transfers per week
            const transWeeks = assignToWeek(transferenciaRes.data || [], 'created_at', weeks)
            const transferenciasPorSemana = transWeeks.map(w => ({
                semana: w.label,
                transferencias: w.count,
            }))

            // Revenue by branch (SuperAdmin only)
            let ingresosPorSucursal = []
            if (isSuperAdmin && branchRevenueRes.data?.length) {
                const branchMap = {}
                branchRevenueRes.data.forEach(f => {
                    const name = f.sucursal?.name || 'Sin sucursal'
                    branchMap[name] = (branchMap[name] || 0) + (f.total || 0)
                })
                ingresosPorSucursal = Object.entries(branchMap)
                    .map(([sucursal, total]) => ({ sucursal, total: Math.round(total * 100) / 100 }))
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 8)
            }

            // Week labels for x-axis
            const weekLabels = weeks.map(w => w.label)

            return {
                weekLabels,
                paquetesPorSemana,
                ingresosPorSemana,
                estadoPaquetes,
                facturasPorEstado,
                transferenciasPorSemana,
                ingresosPorSucursal,
            }
        },
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000,
    })
}

// ─── Hook: Recent Activity ───────────────────────────────────────────────────

/**
 * Fetches the 8 most recent events from paquete_evento, scoped by role.
 * Maps raw event types to human-readable labels and colors.
 */
export const useDashboardActivity = (user) => {
    const isSuperAdmin = user?.role?.id === 1
    const isCliente = user?.role?.id === 4
    const sucursalId = (!isSuperAdmin && !isCliente) ? user?.sucursal?.id : null
    const clienteId = isCliente ? user?.id : null

    return useQuery({
        queryKey: ['dashboard-activity', user?.role?.id, sucursalId, clienteId],
        queryFn: async () => {
            // NOTE: operador_id has no FK to operador table, so we cannot use the
            // embedded join syntax. We select raw operador_id and do a separate
            // lookup for operator names to enrich the activity feed.
            let q = supabase
                .from('paquete_evento')
                .select(`
                    id, evento_tipo, created_at, paquete_id,
                    operador_id,
                    sucursal:sucursal_id (name),
                    cliente:cliente_id (full_name)
                `)
                .order('created_at', { ascending: false })
                .limit(8)

            if (sucursalId) q = q.eq('sucursal_id', sucursalId)
            if (clienteId) q = q.eq('cliente_id', clienteId)

            const { data, error } = await q
            if (error) throw error

            // Fetch operator names separately (no FK defined on paquete_evento.operador_id)
            const operadorIds = [...new Set(
                (data || []).map(e => e.operador_id).filter(Boolean)
            )]
            let operadorMap = {}
            if (operadorIds.length > 0) {
                const { data: operadores } = await supabase
                    .from('operador')
                    .select('id, full_name')
                    .in('id', operadorIds)
                if (operadores) {
                    operadorMap = Object.fromEntries(operadores.map(o => [o.id, o.full_name]))
                }
            }

            const EVENT_META = {
                INGRESO: { title: 'Paquete ingresado', type: 'package', color: '#4caf50' },
                TRANSFERENCIA_ENVIADA: { title: 'Transferencia enviada', type: 'transfer', color: '#2196f3' },
                TRANSFERENCIA_RECIBIDA: { title: 'Transferencia recibida', type: 'transfer', color: '#4caf50' },
                FACTURADO: { title: 'Factura generada', type: 'invoice', color: '#f4b223' },
                ENTREGADO: { title: 'Paquete entregado', type: 'package', color: '#9c27b0' },
                TRANSFERENCIA_CANCELADA: { title: 'Transferencia cancelada', type: 'transfer', color: '#d32f2f' },
            }

            return (data || []).map(event => {
                const meta = EVENT_META[event.evento_tipo] || { title: event.evento_tipo, type: 'package', color: '#888' }
                const who = operadorMap[event.operador_id] || event.cliente?.full_name || ''
                const where = event.sucursal?.name || ''
                return {
                    type: meta.type,
                    title: meta.title,
                    color: meta.color,
                    description: [who, where].filter(Boolean).join(' · '),
                    time: getTimeAgo(event.created_at),
                    packageCode: event.paquete_id,
                }
            })
        },
        enabled: !!user?.id,
        staleTime: 60 * 1000,
    })
}
