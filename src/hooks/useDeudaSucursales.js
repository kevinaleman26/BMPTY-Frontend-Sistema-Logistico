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
        try {
            // Validate supabase client
            if (!supabase || typeof supabase.rpc !== 'function') {
                throw new Error('Supabase client not initialized correctly')
            }

            // Call Supabase RPC function
            const { data, error } = await supabase.rpc('obtener_deudas_sucursales')

            if (error) {
                console.error('Error fetching deudas:', error)
                throw error
            }

            return data || []
        } catch (err) {
            console.error('Error in useDeudaSucursales:', err)
            throw err
        }
    }

    const { data, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn,
        staleTime: 60000, // Cache for 1 minute
        refetchOnWindowFocus: true,
        retry: 2,
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
 */
export const useTransferenciasPendientes = (receptorSucursalId = null) => {
    const queryKey = ['transferencias-pendientes', receptorSucursalId]

    const queryFn = async () => {
        const { data, error } = await supabase.rpc('obtener_transferencias_pendientes', {
            p_receptor_sucursal_id: receptorSucursalId
        })

        if (error) throw error
        return data || []
    }

    const { data, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn,
        staleTime: 30000,
        enabled: receptorSucursalId !== undefined,
    })

    return {
        transferencias: data || [],
        isLoading,
        isError,
        error,
    }
}

/**
 * Hook to fetch pending invoice debts grouped by sucursal
 */
export const useDeudaFacturasSucursales = () => {
    const queryKey = ['deuda-facturas-sucursales']

    const queryFn = async () => {
        const { data, error } = await supabase.rpc('obtener_deudas_facturas_sucursales')
        if (error) throw error
        return data || []
    }

    const { data, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn,
        staleTime: 60000,
        refetchOnWindowFocus: true,
    })

    const totalGeneral = (data || []).reduce(
        (sum, d) => sum + parseFloat(d.total_adeudado || 0),
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
 * Hook to fetch pending invoices detail, optionally filtered by sucursal
 */
export const useFacturasPendientes = (sucursalId = null) => {
    const queryKey = ['facturas-pendientes', sucursalId]

    const queryFn = async () => {
        const { data, error } = await supabase.rpc('obtener_facturas_pendientes', {
            p_sucursal_id: sucursalId
        })
        if (error) throw error
        return data || []
    }

    const { data, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn,
        staleTime: 30000,
        enabled: sucursalId !== undefined,
    })

    return {
        facturas: data || [],
        isLoading,
        isError,
        error,
    }
}
