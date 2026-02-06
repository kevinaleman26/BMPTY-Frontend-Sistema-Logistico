// hooks/useDeudaSucursales.js
'use client'

import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

/**
 * Hook to fetch debt information grouped by receptor sucursal
 * Uses RPC function 'obtener_deudas_sucursales' for optimal performance
 *
 * @returns {Object} Object containing:
 *   - deudas: Array of debt objects per sucursal
 *   - totalGeneral: Sum of all debts
 *   - isLoading: Loading state
 *   - isError: Error state
 *   - error: Error object if any
 */
export const useDeudaSucursales = () => {
    const queryKey = ['deuda-sucursales']

    const queryFn = async () => {
        // Call Supabase RPC function
        const { data, error } = await supabase.rpc('obtener_deudas_sucursales')

        if (error) {
            console.error('Error fetching deudas:', error)
            throw error
        }

        return data || []
    }

    const { data, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn,
        staleTime: 60000, // Cache for 1 minute
        refetchOnWindowFocus: true,
    })

    // Calculate total general (sum of all debts)
    const totalGeneral = (data || []).reduce(
        (sum, deuda) => sum + parseFloat(deuda.total_adeudado || 0),
        0
    )

    return {
        deudas: data || [],
        totalGeneral,
        isLoading,
        isError,
        error,
    }
}

/**
 * Hook to fetch detailed pending transfers
 * Optionally filtered by receptor sucursal
 *
 * @param {number|null} receptorSucursalId - Optional receptor sucursal ID to filter
 * @returns {Object} Object containing pending transfers data
 */
export const useTransferenciasPendientes = (receptorSucursalId = null) => {
    const queryKey = ['transferencias-pendientes', receptorSucursalId]

    const queryFn = async () => {
        const { data, error } = await supabase.rpc('obtener_transferencias_pendientes', {
            p_receptor_sucursal_id: receptorSucursalId
        })

        if (error) {
            console.error('Error fetching transferencias pendientes:', error)
            throw error
        }

        return data || []
    }

    const { data, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn,
        staleTime: 30000, // Cache for 30 seconds
        enabled: true, // Always enabled, filter is optional
    })

    return {
        transferencias: data || [],
        isLoading,
        isError,
        error,
    }
}
