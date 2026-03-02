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
        // ── Race condition guard ──────────────────────────────────────────────
        // Supabase sometimes fires SIGNED_OUT immediately before TOKEN_REFRESHED
        // during its background auto-refresh cycle. Without debouncing, the brief
        // SIGNED_OUT would clear the session → all queries become disabled →
        // infinite loading spinner until the user reloads.
        //
        // Fix: delay the session clear by 1.5 s. If TOKEN_REFRESHED arrives
        // within that window we cancel the clear and recover transparently.
        let signOutTimer = null
        let hadSignOut = false
        // ─────────────────────────────────────────────────────────────────────

        const { data: listener } = supabase.auth.onAuthStateChange(async (event, authSession) => {
            if (event === 'SIGNED_OUT') {
                hadSignOut = true
                // Defer — a TOKEN_REFRESHED may follow within milliseconds
                signOutTimer = setTimeout(() => {
                    if (hadSignOut) queryClient.setQueryData(['session'], null)
                }, 1500)

            } else if (
                (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') &&
                authSession?.user?.id
            ) {
                // Cancel any pending sign-out from the debounce above
                if (signOutTimer) {
                    clearTimeout(signOutTimer)
                    signOutTimer = null
                }
                const wasSignedOut = hadSignOut
                hadSignOut = false

                // Use userId from the event — avoids calling getSession() inside
                // the auth lock (which would deadlock on concurrent signOut calls)
                const userData = await buildUserData(authSession.user.id)
                queryClient.setQueryData(['session'], userData)

                // If we recovered from a SIGNED_OUT, force-refetch all data
                // queries so any that failed with an expired JWT get fresh data
                if (wasSignedOut) {
                    queryClient.invalidateQueries({
                        predicate: (q) => q.queryKey[0] !== 'session'
                    })
                }
            }
        })

        return () => {
            if (signOutTimer) clearTimeout(signOutTimer)
            listener.subscription.unsubscribe()
        }
    }, [queryClient])

    return { session: session ?? null, loading }
}
