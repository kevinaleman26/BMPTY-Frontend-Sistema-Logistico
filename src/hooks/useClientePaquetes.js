'use client'

import { supabase } from '@/lib/supabase'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

/**
 * Paginated packages for a specific client.
 * Queries factura_detalle with !inner join to factura to filter by cliente_id and delivery_status.
 * Returns flattened rows ready for the DataGrid.
 */
export const useClientePaquetes = (clienteId, { page, pageSize, deliveryStatus }) => {
    const from = page * pageSize
    const to = from + pageSize - 1

    return useQuery({
        queryKey: ['cliente-paquetes', clienteId, page, pageSize, deliveryStatus],
        queryFn: async () => {
            const { data, count, error } = await supabase
                .from('factura_detalle')
                .select(`
                    id,
                    factura_id,
                    paquete_id,
                    proveedor_paquetes:paquete_id (codigo, tipo, peso, precio, largo, alto, ancho),
                    factura:factura_id!inner (delivery_status, cliente_id, sucursal:sucursal_id (name))
                `, { count: 'exact' })
                .eq('factura.cliente_id', clienteId)
                .eq('factura.delivery_status', deliveryStatus)
                .range(from, to)

            if (error) throw error

            const rows = (data || []).map(d => ({
                id: d.id,
                factura_id: d.factura_id,
                sucursal: d.factura?.sucursal?.name || '—',
                delivery_status: d.factura?.delivery_status,
                codigo: d.proveedor_paquetes?.codigo,
                tipo: d.proveedor_paquetes?.tipo,
                peso: d.proveedor_paquetes?.peso,
                precio: d.proveedor_paquetes?.precio,
                largo: d.proveedor_paquetes?.largo,
                alto: d.proveedor_paquetes?.alto,
                ancho: d.proveedor_paquetes?.ancho,
            }))

            return { rows, total: count || 0 }
        },
        enabled: !!clienteId,
        placeholderData: keepPreviousData,
    })
}
