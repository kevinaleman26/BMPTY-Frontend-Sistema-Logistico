'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InventoryIcon from '@mui/icons-material/Inventory'
import ReceiptIcon from '@mui/icons-material/Receipt'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import HourglassIcon from '@mui/icons-material/HourglassEmpty'
import MetricCard from '@/components/Dashboard/EnhancedDashboard/MetricCard'
import RecentActivityCard from '@/components/Dashboard/EnhancedDashboard/RecentActivityCard'
import {
    PackageStatusChart,
    InvoiceStatusChart,
} from '@/components/Dashboard/EnhancedDashboard/ChartsSection'
import { useDashboardKPIs, useDashboardCharts, useDashboardActivity } from '@/hooks/useDashboardMetrics'

const formatCurrency = (val) =>
    new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

/**
 * Dashboard for Cliente role.
 * Shows only their own packages, invoices, and recent activity.
 */
const ClienteDashboard = ({ user }) => {
    const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs(user)
    const { data: charts, isLoading: chartsLoading } = useDashboardCharts(user)
    const { data: activities, isLoading: activityLoading } = useDashboardActivity(user)

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}>

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
                        Hola, {user?.full_name}
                    </Typography>
                    <Typography sx={{ color: '#555', fontSize: '0.875rem', fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace' }}>
                        Resumen de tu cuenta · {user?.sucursal?.name}
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
                        label="Mis paquetes"
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
                        label="Total pagado"
                        value={kpisLoading ? '—' : formatCurrency(kpis?.ingresoPagado || 0)}
                        icon={AttachMoneyIcon}
                        color="#4caf50"
                        loading={kpisLoading}
                        delay={0.15}
                    />
                    <MetricCard
                        label="Por pagar"
                        value={kpisLoading ? '—' : formatCurrency(kpis?.ingresoPendiente || 0)}
                        icon={HourglassIcon}
                        color="#e67e22"
                        loading={kpisLoading}
                        delay={0.2}
                    />
                </Box>

                {/* Status Charts */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                        gap: { xs: 1.5, md: 2 },
                        mb: { xs: 2.5, md: 3 },
                    }}
                >
                    <PackageStatusChart data={charts?.estadoPaquetes || []} isLoading={chartsLoading} />
                    <InvoiceStatusChart data={charts?.facturasPorEstado || []} isLoading={chartsLoading} />
                </Box>

                {/* Recent Activity */}
                <RecentActivityCard activities={activities || []} isLoading={activityLoading} />

            </Box>
        </Box>
    )
}

export default ClienteDashboard
