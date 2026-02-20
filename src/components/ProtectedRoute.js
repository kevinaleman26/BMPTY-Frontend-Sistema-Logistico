'use client'

import { useSession } from '@/hooks/useSession'
import { useIdleTimeout } from '@/hooks/useIdleTimeout'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import IdleWarningModal from '@/components/Modal/IdleWarningModal'

export default function ProtectedRoute({ children }) {
    const { session, loading } = useSession()
    const [mounted, setMounted] = useState(false)
    const [showWarning, setShowWarning] = useState(false)

    // Ensure server and client both render null on the first pass.
    // Without this, SPA navigations cause a hydration mismatch because
    // React Query has the session cached on the client but not on the server.
    useEffect(() => {
        setMounted(true)
    }, [])

    // Redirigir si no hay sesión (expiración natural, cierre externo, etc.)
    useEffect(() => {
        if (mounted && !loading && !session) {
            window.location.replace('/login')
        }
    }, [mounted, loading, session])

    const handleLogout = useCallback(async () => {
        setShowWarning(false)
        try {
            await supabase.auth.signOut()
        } finally {
            window.location.href = '/login'
        }
    }, [])

    const handleWarn = useCallback(() => {
        setShowWarning(true)
    }, [])

    const handleStay = useCallback(() => {
        setShowWarning(false)
        // resetTimers se llama automáticamente porque enabled vuelve a true
    }, [])

    // Solo activo cuando hay sesión y el modal NO está visible
    useIdleTimeout({
        onWarn: handleWarn,
        onLogout: handleLogout,
        enabled: !!session && !showWarning,
    })

    if (!mounted || loading || !session) return null

    return (
        <>
            {children}
            <IdleWarningModal
                open={showWarning}
                onStay={handleStay}
                onLogout={handleLogout}
            />
        </>
    )
}
