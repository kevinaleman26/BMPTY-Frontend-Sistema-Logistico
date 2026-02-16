'use client'

import AdminDashboard from '@/components/Dashboard/AdminDashboard'
import ClienteDashboard from '@/components/Dashboard/ClienteDashboard'
import OperadorDashboard from '@/components/Dashboard/OperadorDashboard'
import SuperAdminDashboard from '@/components/Dashboard/SuperAdminDashboard'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useSession } from '@/hooks/useSession'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useMemo } from 'react'

export default function DashboardPage() {

    const {session: user, loading: userLoading} = useSession();

    const dashboard = useMemo(() => {
        if (user?.role?.id === 1) return <SuperAdminDashboard user={user} />
        if (user?.role?.id === 2) return <AdminDashboard user={user} />
        if (user?.role?.id === 3) return <OperadorDashboard user={user} />
        return <ClienteDashboard user={user} />
    }, [user])

    if (userLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <ProtectedRoute>
            {dashboard}
        </ProtectedRoute>
    )
}
