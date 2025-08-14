'use client'

import AdminDashboard from '@/components/Dashboard/AdminDashboard'
import ClienteDashboard from '@/components/Dashboard/ClienteDashboard'
import OperadorDashboard from '@/components/Dashboard/OperadorDashboard'
import SuperAdminDashboard from '@/components/Dashboard/SuperAdminDashboard'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useSession } from '@/hooks/useSession'
import { Box, CircularProgress } from '@mui/material'



export default function DashboardPage() {

    const {session: user, loading: userLoading} = useSession();

    if ( userLoading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        )
    }

    const dashboardRoleHandler = () => {
        if (user?.role?.id === 1) return <SuperAdminDashboard user={user} />
        if (user?.role?.id === 2) return <AdminDashboard user={user} />
        if (user?.role?.id === 3) return <OperadorDashboard user={user} />
        return <ClienteDashboard user={user} />
    }

    return (
        <ProtectedRoute>
            {
                dashboardRoleHandler()
            }
        </ProtectedRoute>
    )
}
