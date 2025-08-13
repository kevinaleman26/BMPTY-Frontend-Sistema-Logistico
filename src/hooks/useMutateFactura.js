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
            trackingCodes = []
        }) => {
            const { data: cab, error: cabErr } = await supabase
                .from('factura')
                .insert([{ sucursal_id, cliente_id, metodo_pago_id, subtotal, descuento, otros, impuestos, total }])
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
        }
    })

    const updateFactura = useMutation({
        mutationFn: async ({ id, ...changes }) => {
            // 1) Obtener valores actuales para detectar cambios de status
            const { data: current, error: fetchErr } = await supabase
                .from('factura')
                .select('delivery_status, payment_status')
                .eq('id', id)
                .single()
            if (fetchErr) throw fetchErr

            const payload = { ...changes }
            const nowIso = new Date().toISOString()

            // 2) Si viene delivery_status y cambió, setear delivery_date
            if (typeof changes.delivery_status === 'boolean' && changes.delivery_status !== current.delivery_status) {
                payload.delivery_date = changes.delivery_status ? nowIso : null
            }

            // 3) Si viene payment_status y cambió, setear payment_date
            if (typeof changes.payment_status === 'boolean' && changes.payment_status !== current.payment_status) {
                payload.payment_date = changes.payment_status ? nowIso : null
            }

            // 4) Update
            const { error: updErr } = await supabase.from('factura').update(payload).eq('id', id)
            if (updErr) throw updErr
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['facturas'] })
        }
    })

    return { createFactura, updateFactura }
}
