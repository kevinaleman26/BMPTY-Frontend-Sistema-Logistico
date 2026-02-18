import { supabase } from '@/lib/supabase'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

const getClientInfo = async (id) => {
    const { data: cliente, error } = await supabase
        .from('cliente')
        .select("*")
        .eq('id', id)
        .single()

    if (error) return null

    return {
        ...cliente,
        role: {
            id: 4,
            name: 'Cliente'
        }
    }
}

const getOperadorInfo = async (id) => {
    const { data: operador, error } = await supabase
        .from('operador')
        .select("*, sucursal(id, name), role(id, name)")
        .eq('id', id)
        .single()

    if (error) return null

    return operador
}

// ⚡ Función para obtener la sesión completa con datos de usuario
const fetchSession = async () => {
    const { data } = await supabase.auth.getSession()

    if (!data?.session) {
        return null
    }

    const userId = data.session.user.id

    // Hacer ambas consultas en paralelo
    const [clienteResult, operadorResult] = await Promise.allSettled([
        getClientInfo(userId),
        getOperadorInfo(userId)
    ])

    // Retornar el resultado exitoso
    if (clienteResult.status === 'fulfilled' && clienteResult.value) {
        return clienteResult.value
    }

    if (operadorResult.status === 'fulfilled' && operadorResult.value) {
        return operadorResult.value
    }

    return null
}

// ⚡ Hook optimizado con React Query para deduplicación automática
export function useSession() {
    const queryClient = useQueryClient()

    // Query principal de sesión
    const { data: session, isLoading: loading } = useQuery({
        queryKey: ['session'],
        queryFn: fetchSession,
        staleTime: 5 * 60 * 1000, // Session es estable por 5 minutos
        cacheTime: 10 * 60 * 1000, // Mantener en cache 10 minutos
        refetchOnWindowFocus: false, // No refetch al cambiar de tab
        retry: 1, // Solo 1 retry
    })

    // ⚡ Listener de cambios de auth (invalida cache cuando cambia)
    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
                // Invalidar y refetch la sesión
                await queryClient.invalidateQueries({ queryKey: ['session'] })
            }
        })

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [queryClient])

    return { session: session ?? null, loading }
}
