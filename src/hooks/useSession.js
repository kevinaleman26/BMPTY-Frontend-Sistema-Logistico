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
        role: { id: 4, name: 'Cliente' }
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

// Fetches user profile from our tables given a userId
const buildUserData = async (userId) => {
    const [clienteResult, operadorResult] = await Promise.allSettled([
        getClientInfo(userId),
        getOperadorInfo(userId)
    ])

    if (clienteResult.status === 'fulfilled' && clienteResult.value) {
        return clienteResult.value
    }
    if (operadorResult.status === 'fulfilled' && operadorResult.value) {
        return operadorResult.value
    }
    return null
}

// Called once on initial page load to hydrate the cache.
// Does NOT run inside any auth lock, so getSession() is safe here.
const fetchSession = async () => {
    const { data } = await supabase.auth.getSession()
    if (!data?.session) return null
    return await buildUserData(data.session.user.id)
}

export function useSession() {
    const queryClient = useQueryClient()

    const { data: session, isLoading: loading } = useQuery({
        queryKey: ['session'],
        queryFn: fetchSession,
        staleTime: Infinity,          // Cache never goes stale — onAuthStateChange drives all updates
        gcTime: 24 * 60 * 60 * 1000, // Keep in memory for 24h
        refetchOnWindowFocus: false,
        retry: 1,
    })

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange(async (event, authSession) => {
            if (event === 'SIGNED_OUT') {
                // Set null directly — synchronous, no getSession() call, no lock contention
                queryClient.setQueryData(['session'], null)
            } else if (
                (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') &&
                authSession?.user?.id
            ) {
                // Use userId from the event — avoids calling getSession() inside the auth lock
                const userData = await buildUserData(authSession.user.id)
                queryClient.setQueryData(['session'], userData)
            }
        })

        return () => listener.subscription.unsubscribe()
    }, [queryClient])

    return { session: session ?? null, loading }
}
