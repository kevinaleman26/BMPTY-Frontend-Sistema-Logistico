'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export function useSession() {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getSession = async () => {
            const { data, error } = await supabase.auth.getSession()
            setSession(data?.session ?? null)
            setLoading(false)
        }

        getSession()

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    return { session, loading }
}
