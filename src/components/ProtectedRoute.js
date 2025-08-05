'use client'

import { useSession } from '@/hooks/useSession'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedRoute({ children }) {
    const { session, loading } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !session) {
            router.push('/login') // redirige si no hay sesión
        }
    }, [loading, session, router])

    if (loading || !session) return null // o un loader

    return children
}
