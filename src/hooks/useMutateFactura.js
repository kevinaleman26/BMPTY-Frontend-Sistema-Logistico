// src/hooks/useMutateFactura.js
'use client'

import { supabase } from '@/lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useMutateFactura() {
    const qc = useQueryClient()

    const createFactura = useMutation({
        mutationFn: async ({
            sucursal_id,
            cliente_id,
            metodo_pago_id,
            subtotal,
            descuento,
            otros,
            impuestos,
            total,
            trackingCodes = [],
            operador_factura_id = null
        }) => {
            const { data: cab, error: cabErr } = await supabase
                .from('factura')
                .insert([{
                    sucursal_id,
                    cliente_id,
                    metodo_pago_id,
                    subtotal,
                    descuento,
                    otros,
                    impuestos,
                    total,
                    operador_factura_id
                }])
                .select('id')
                .single()
            if (cabErr) throw cabErr

            const facturaId = cab.id

            if (trackingCodes.length) {
                const rows = trackingCodes.map(code => ({ factura_id: facturaId, paquete_id: code }))
                const { error: detErr } = await supabase.from('factura_detalle').insert(rows)
                if (detErr) throw detErr
            }

            return facturaId
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['facturas'] })
            qc.invalidateQueries({ queryKey: ['paquetes'] })
        }
    })

    const updateFactura = useMutation({
        mutationFn: async ({
            id,
            prevDeliveryStatus,
            prevPaymentStatus,
            trackingCodes,   // optional: new package list when editing packages
            ...changes
        }) => {
            const payload = { ...changes }
            const nowIso = new Date().toISOString()

            // Set delivery_date when delivery_status transitions to true
            if (typeof changes.delivery_status === 'boolean') {
                const wasDelivered = prevDeliveryStatus ?? false
                if (changes.delivery_status !== wasDelivered) {
                    payload.delivery_date = changes.delivery_status ? nowIso : null
                }
            }

            // Set payment_date when payment_status transitions to true
            if (typeof changes.payment_status === 'boolean') {
                const wasPaid = prevPaymentStatus ?? false
                if (changes.payment_status !== wasPaid) {
                    payload.payment_date = changes.payment_status ? nowIso : null
                }
            }

            const { error } = await supabase.from('factura').update(payload).eq('id', id)
            if (error) throw error

            // ── Update package list (diff-based to avoid duplicate FACTURADO events) ──
            if (trackingCodes !== undefined) {
                const { data: currentDetails } = await supabase
                    .from('factura_detalle')
                    .select('paquete_id')
                    .eq('factura_id', id)

                const currentCodes = new Set((currentDetails ?? []).map(d => d.paquete_id))
                const newCodes = new Set(trackingCodes)

                const toRemove = [...currentCodes].filter(c => !newCodes.has(c))
                const toAdd = [...newCodes].filter(c => !currentCodes.has(c))

                if (toRemove.length > 0) {
                    const { error: delErr } = await supabase
                        .from('factura_detalle')
                        .delete()
                        .eq('factura_id', id)
                        .in('paquete_id', toRemove)
                    if (delErr) throw delErr
                }

                if (toAdd.length > 0) {
                    const rows = toAdd.map(code => ({ factura_id: id, paquete_id: code }))
                    const { error: insErr } = await supabase.from('factura_detalle').insert(rows)
                    if (insErr) throw insErr
                }
            }
        },

        // ─── Optimistic Update ───────────────────────────────────────────────────
        onMutate: async ({ id, prevDeliveryStatus, prevPaymentStatus, ...changes }) => {
            // Cancel any ongoing refetches to avoid overwriting the optimistic update
            await qc.cancelQueries({ queryKey: ['facturas'] })

            // Snapshot all current facturas cache entries for rollback
            const previousQueries = qc.getQueriesData({ queryKey: ['facturas'] })

            // Immediately update every matching cache entry
            qc.setQueriesData({ queryKey: ['facturas'] }, (old) => {
                if (!old?.data) return old
                return {
                    ...old,
                    data: old.data.map(f =>
                        f.id === id ? { ...f, ...changes } : f
                    )
                }
            })

            return { previousQueries }
        },

        // Roll back on server error
        onError: (_err, _vars, context) => {
            context?.previousQueries?.forEach(([queryKey, data]) => {
                qc.setQueryData(queryKey, data)
            })
        },

        // Always sync with server after mutation (success or failure)
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ['facturas'] })
            qc.invalidateQueries({ queryKey: ['paquetes'] })
            // Force-refresh the initial package selection cache so removed packages
            // don't reappear when the modal is reopened within the 60s staleTime window.
            qc.invalidateQueries({ queryKey: ['proveedor_paquetesInitSel'] })
        }
    })

    const bulkUpdateFacturas = useMutation({
        mutationFn: async ({ ids, delivery_status, payment_status }) => {
            const payload = {}
            const nowIso = new Date().toISOString()
            if (delivery_status !== undefined) {
                payload.delivery_status = delivery_status
                payload.delivery_date = delivery_status ? nowIso : null
            }
            if (payment_status !== undefined) {
                payload.payment_status = payment_status
                payload.payment_date = payment_status ? nowIso : null
            }
            const { error } = await supabase.from('factura').update(payload).in('id', ids)
            if (error) throw error
        },
        onMutate: async ({ ids, delivery_status, payment_status }) => {
            await qc.cancelQueries({ queryKey: ['facturas'] })
            const previousQueries = qc.getQueriesData({ queryKey: ['facturas'] })
            qc.setQueriesData({ queryKey: ['facturas'] }, (old) => {
                if (!old?.data) return old
                return {
                    ...old,
                    data: old.data.map(f => {
                        if (!ids.includes(f.id)) return f
                        const updated = { ...f }
                        if (delivery_status !== undefined) updated.delivery_status = delivery_status
                        if (payment_status !== undefined) updated.payment_status = payment_status
                        return updated
                    })
                }
            })
            return { previousQueries }
        },
        onError: (_err, _vars, context) => {
            context?.previousQueries?.forEach(([queryKey, data]) => {
                qc.setQueryData(queryKey, data)
            })
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ['facturas'] })
        }
    })

    return { createFactura, updateFactura, bulkUpdateFacturas }
}
