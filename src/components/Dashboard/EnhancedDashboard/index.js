'use client'

import { memo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import InventoryIcon from '@mui/icons-material/Inventory'
import ReceiptIcon from '@mui/icons-material/Receipt'
import ShippingIcon from '@mui/icons-material/LocalShipping'
import PeopleIcon from '@mui/icons-material/People'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import HourglassIcon from '@mui/icons-material/HourglassEmpty'

import MetricCard from './MetricCard'
import QuickActionsCard from './QuickActionsCard'
import RecentActivityCard from './RecentActivityCard'
import DeudaSucursalesCard from '@/components/Dashboard/DeudaSucursalesCard'
import {
    WeeklyPackagesChart,
    PackageStatusChart,
    WeeklyRevenueChart,
    InvoiceStatusChart,
    WeeklyTransfersChart,
    RevenueBySucursalChart,
} from './ChartsSection'
import { useDashboardKPIs, useDashboardCharts, useDashboardActivity } from '@/hooks/useDashboardMetrics'

const formatCurrency = (val) =>
    new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ title, subtitle }) => (
    <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#444', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace' }}>
            {subtitle}
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
            {title}
        </Typography>
    </Box>
)

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Enhanced Dashboard — combined view for SuperAdmin and Admin roles.
 * Combines operational (vol/week), financial (revenue), and movement (transfers) charts.
 */
const EnhancedDashboard = memo(function EnhancedDashboard({ user }) {
    const isSuperAdmin = user?.role?.id === 1
    const isAdmin = user?.role?.id === 2

    const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs(user)
    const { data: charts, isLoading: chartsLoading } = useDashboardCharts(user)
    const { data: activities, isLoading: activityLoading } = useDashboardActivity(user)

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ maxWidth: '1600px', mx: 'auto', width: '100%' }}>

                {/* ── Header ──────────────────────────────────────────────── */}
                <Box sx={{ mb: { xs: 3, md: 4 } }}>
                    <Typography
                        variant="h2"
                        sx={{
                            color: '#fff',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                            mb: 0.5,
                        }}
                    >
                        Bienvenido, {user?.full_name}
                    </Typography>
                    <Typography sx={{ color: '#555', fontSize: '0.875rem', fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace' }}>
                        {user?.role?.name} · {user?.sucursal?.name || 'Sistema Global'}
                    </Typography>
                </Box>

                {/* ── KPI Cards ────────────────────────────────────────────── */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                        gap: { xs: 1.5, sm: 2, md: 2.5 },
                        mb: { xs: 2.5, md: 3.5 },
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
                    {isSuperAdmin ? (
                        <MetricCard
                            label="Clientes"
                            value={kpisLoading ? '—' : kpis?.clientes?.toLocaleString() || '0'}
                            icon={PeopleIcon}
                            color="#4caf50"
                            loading={kpisLoading}
                            delay={0.15}
                        />
                    ) : (
                        <MetricCard
                            label="Ingresado"
                            value={kpisLoading ? '—' : formatCurrency(kpis?.ingresoPagado || 0)}
                            icon={AttachMoneyIcon}
                            color="#4caf50"
                            loading={kpisLoading}
                            delay={0.15}
                        />
                    )}
                    <MetricCard
                        label={isSuperAdmin ? 'Transferencias' : 'Por cobrar'}
                        value={kpisLoading
                            ? '—'
                            : isSuperAdmin
                                ? kpis?.transferencias?.toLocaleString() || '0'
                                : formatCurrency(kpis?.ingresoPendiente || 0)
                        }
                        icon={isSuperAdmin ? ShippingIcon : HourglassIcon}
                        color={isSuperAdmin ? '#9c27b0' : '#e67e22'}
                        loading={kpisLoading}
                        delay={0.2}
                    />
                </Box>

                {/* ── Debt Card (SuperAdmin & Admin) ───────────────────────── */}
                {(isSuperAdmin || isAdmin) && (
                    <Box sx={{ mb: { xs: 2.5, md: 3.5 } }}>
                        <DeudaSucursalesCard />
                    </Box>
                )}

                {/* ── Row 2: Operational Volume ────────────────────────────── */}
                <Box sx={{ mb: { xs: 2, md: 3 } }}>
                    <SectionHeader title="Volumen Operacional" subtitle="Paquetes · 8 semanas" />
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                            gap: { xs: 1.5, md: 2 },
                        }}
                    >
                        <WeeklyPackagesChart data={charts?.paquetesPorSemana || []} isLoading={chartsLoading} />
                        <PackageStatusChart data={charts?.estadoPaquetes || []} isLoading={chartsLoading} />
                    </Box>
                </Box>

                {/* ── Row 3: Financial ────────────────────────────────────── */}
                <Box sx={{ mb: { xs: 2, md: 3 } }}>
                    <SectionHeader title="Rendimiento Financiero" subtitle="Ingresos · 8 semanas" />
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                            gap: { xs: 1.5, md: 2 },
                        }}
                    >
                        <WeeklyRevenueChart data={charts?.ingresosPorSemana || []} isLoading={chartsLoading} />
                        <InvoiceStatusChart data={charts?.facturasPorEstado || []} isLoading={chartsLoading} />
                    </Box>
                </Box>

                {/* ── Row 4: Movement / Transfers ─────────────────────────── */}
                <Box sx={{ mb: { xs: 2, md: 3 } }}>
                    <SectionHeader title="Movimiento de Transferencias" subtitle="Transferencias · 8 semanas" />
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: isSuperAdmin ? '1fr 1fr' : '1fr' },
                            gap: { xs: 1.5, md: 2 },
                        }}
                    >
                        <WeeklyTransfersChart data={charts?.transferenciasPorSemana || []} isLoading={chartsLoading} />
                        {isSuperAdmin && (
                            <RevenueBySucursalChart data={charts?.ingresosPorSucursal || []} isLoading={chartsLoading} />
                        )}
                    </Box>
                </Box>

                {/* ── Row 5: Actions + Activity ────────────────────────────── */}
                <Box sx={{ mb: { xs: 2, md: 3 } }}>
                    <SectionHeader title="Actividad y Acciones" subtitle="Tiempo real" />
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
        </Box>
    )
})

export default EnhancedDashboard
