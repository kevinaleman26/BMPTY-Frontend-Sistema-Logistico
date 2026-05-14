'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InventoryIcon from '@mui/icons-material/Inventory'
import ReceiptIcon from '@mui/icons-material/Receipt'
import PeopleIcon from '@mui/icons-material/People'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import MetricCard from '@/components/Dashboard/EnhancedDashboard/MetricCard'
import RecentActivityCard from '@/components/Dashboard/EnhancedDashboard/RecentActivityCard'
import QuickActionsCard from '@/components/Dashboard/EnhancedDashboard/QuickActionsCard'
import {
    WeeklyPackagesChart,
    PackageStatusChart,
} from '@/components/Dashboard/EnhancedDashboard/ChartsSection'
import { useDashboardKPIs, useDashboardCharts, useDashboardActivity } from '@/hooks/useDashboardMetrics'

/**
 * Dashboard for Operador role.
 * Shows branch-scoped metrics: packages, invoices, clients, package status.
 */
const OperadorDashboard = ({ user }) => {
    const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs(user)
    const { data: charts, isLoading: chartsLoading } = useDashboardCharts(user)
    const { data: activities, isLoading: activityLoading } = useDashboardActivity(user)

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ maxWidth: '1400px', mx: 'auto', width: '100%' }}>

                {/* Header */}
                <Box sx={{ mb: { xs: 3, md: 4 } }}>
                    <Typography
                        variant="h2"
                        sx={{
                            color: '#fff',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
                            mb: 0.5,
                        }}
                    >
                        Bienvenido, {user?.full_name}
                    </Typography>
                    <Typography sx={{ color: '#555', fontSize: '0.875rem', fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace' }}>
                        Operador · {user?.sucursal?.name}
                    </Typography>
                </Box>

                {/* KPI Cards */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
                        gap: { xs: 1.5, md: 2 },
                        mb: { xs: 2.5, md: 3 },
                    }}
                >
                    <MetricCard
                        label="Paquetes"
                        value={kpisLoading ? '—' : kpis?.paquetes?.toLocaleString() || '0'}
                        icon={InventoryIcon}
                        color="#f4b223"
                        loading={kpisLoading}
                        delay={0.05}
                    />
                    <MetricCard
                        label="Facturas"
                        value={kpisLoading ? '—' : kpis?.facturas?.toLocaleString() || '0'}
                        icon={ReceiptIcon}
                        color="#2196f3"
                        loading={kpisLoading}
                        delay={0.1}
                    />
                    <MetricCard
                        label="Clientes"
                        value={kpisLoading ? '—' : kpis?.clientes?.toLocaleString() || '0'}
                        icon={PeopleIcon}
                        color="#4caf50"
                        loading={kpisLoading}
                        delay={0.15}
                    />
                    <MetricCard
                        label="Entregados"
                        value={kpisLoading ? '—' : (charts?.estadoPaquetes?.[0]?.value?.toLocaleString() || '0')}
                        icon={CheckCircleIcon}
                        color="#9c27b0"
                        loading={kpisLoading || chartsLoading}
                        delay={0.2}
                    />
                </Box>

                {/* Charts Row */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                        gap: { xs: 1.5, md: 2 },
                        mb: { xs: 2.5, md: 3 },
                    }}
                >
                    <WeeklyPackagesChart data={charts?.paquetesPorSemana || []} isLoading={chartsLoading} />
                    <PackageStatusChart data={charts?.estadoPaquetes || []} isLoading={chartsLoading} />
                </Box>

                {/* Actions + Activity */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                        gap: { xs: 1.5, md: 2 },
                    }}
                >
                    <QuickActionsCard userRole={user?.role?.id} />
                    <RecentActivityCard activities={activities || []} isLoading={activityLoading} />
                </Box>

            </Box>
        </Box>
    )
}

export default OperadorDashboard
