// hooks/useMutateTransferencia.js
'use client'

import { supabase } from '@/lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useMutateTransferencia() {
    const queryClient = useQueryClient()

    const createTransferencia = useMutation({
        mutationFn: async (data) => {
            console.log(data)

            const transferensia = data;
            const listaPaquetes = data.paqueteList.map(item => item.codigo);

            delete transferensia.paqueteList

            // Step 1: Calculate total using RPC function
            const { data: totalCalculado, error: totalError } = await supabase
                .rpc('calcular_total_transferencia', {
                    p_paquete_codigos: listaPaquetes
                })

            if (totalError) {
                console.error('Error calculating total:', totalError)
                throw new Error('Failed to calculate transfer total')
            }

            // Step 2: Insert transferencia with calculated total and operator tracking
            const { data: transferencia, error } = await supabase
                .from('transferencia_sucursal')
                .insert({
                    ...transferensia,
                    total: totalCalculado || 0,
                    created_at: new Date()
                })
                .select()
                .single()

            if (error) throw error

            // Step 3: Update solicitud_paquete with transferencia_id
            const { data: dt, error: solicitudError } = await supabase
                .from('solicitud_paquete')
                .update({ transferencia_id: transferencia.id })
                .in('paquete_id', listaPaquetes)
                .select('*');

            if (solicitudError) {
                // Rollback: delete the created transfer if package assignment fails
                await supabase
                    .from('transferencia_sucursal')
                    .delete()
                    .eq('id', transferencia.id)

                throw new Error('Failed to assign packages to transfer')
            }

            return transferencia
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['transferencias'])
            queryClient.invalidateQueries(['deuda-sucursales'])
        },
        onError: (err) => {
            console.error('Error creating transferencia:', err)
        }
    })

    const updateTransferencia = useMutation({
        mutationFn: async ({ id, ...rest }) => {
            delete rest.paqueteList

            // Note: We don't allow updating the total field
            // Total is preserved from creation time for historical accuracy
            delete rest.total

            // Get current values to detect status changes
            const { data: current, error: fetchErr } = await supabase
                .from('transferencia_sucursal')
                .select('delivery_status')
                .eq('id', id)
                .single()

            if (fetchErr) throw fetchErr

            const payload = { ...rest }

            // If delivery_status changed to true, set received_at and operator
            if (typeof rest.delivery_status === 'boolean' &&
                rest.delivery_status !== current.delivery_status &&
                rest.delivery_status === true) {
                payload.received_at = new Date().toISOString()
                // operador_receptor_id should be passed from the modal
            }

            const { error } = await supabase
                .from('transferencia_sucursal')
                .update(payload)
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['transferencias'])
            queryClient.invalidateQueries(['deuda-sucursales'])
        }
    })

    const cancelTransferencia = useMutation({
        mutationFn: async ({ id, emisorSucursalId, operadorId }) => {
            // Step 1: Get packages linked to this transfer
            const { data: solicitudes, error: spFetchErr } = await supabase
                .from('solicitud_paquete')
                .select('paquete_id')
                .eq('transferencia_id', id)

            if (spFetchErr) throw spFetchErr

            const paqueteCodigos = (solicitudes ?? []).map(s => s.paquete_id)

            // Step 2: Log TRANSFERENCIA_CANCELADA event for each package
            if (paqueteCodigos.length > 0) {
                await Promise.all(
                    paqueteCodigos.map(codigo =>
                        supabase.rpc('registrar_evento_paquete', {
                            p_paquete_id: codigo,
                            p_evento_tipo: 'TRANSFERENCIA_CANCELADA',
                            p_sucursal_id: emisorSucursalId,
                            p_operador_id: operadorId,
                            p_cliente_id: null,
                            p_transferencia_id: id,
                            p_factura_id: null,
                            p_detalles: null
                        })
                    )
                )
            }

            // Step 3: Free packages by removing their transfer link
            const { error: delSpErr } = await supabase
                .from('solicitud_paquete')
                .delete()
                .eq('transferencia_id', id)

            if (delSpErr) throw delSpErr

            // Step 4: Delete the transfer record
            const { error: delTsErr } = await supabase
                .from('transferencia_sucursal')
                .delete()
                .eq('id', id)

            if (delTsErr) throw delTsErr
        },

        // Optimistic: remove the row from cache immediately
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: ['transferencias'] })
            const previousQueries = queryClient.getQueriesData({ queryKey: ['transferencias'] })

            queryClient.setQueriesData({ queryKey: ['transferencias'] }, (old) => {
                if (!old?.data) return old
                return {
                    ...old,
                    data: old.data.filter(t => t.id !== id),
                    count: Math.max((old.count ?? 1) - 1, 0)
                }
            })

            return { previousQueries }
        },

        onError: (_err, _vars, context) => {
            context?.previousQueries?.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data)
            })
        },

        onSettled: () => {
            queryClient.invalidateQueries(['transferencias'])
            queryClient.invalidateQueries(['deuda-sucursales'])
            queryClient.invalidateQueries(['paquetes'])
        }
    })

    const bulkUpdateTransferencias = useMutation({
        mutationFn: async ({ ids, delivery_status, payment_status }) => {
            const updates = {}
            if (delivery_status !== undefined) updates.delivery_status = delivery_status
            if (payment_status !== undefined) updates.payment_status = payment_status
            const { error } = await supabase
                .from('transferencia_sucursal')
                .update(updates)
                .in('id', ids)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transferencias'] })
            queryClient.invalidateQueries({ queryKey: ['deuda-sucursales'] })
        }
    })

    return { createTransferencia, updateTransferencia, cancelTransferencia, bulkUpdateTransferencias }
}
