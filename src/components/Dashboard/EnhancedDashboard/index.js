// components/Dashboard/EnhancedDashboard/index.js
'use client'

import { Box, Grid, Typography } from '@mui/material'
import {
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
} from '@mui/icons-material'
import { memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import MetricCard from './MetricCard'
import QuickActionsCard from './QuickActionsCard'
import RecentActivityCard from './RecentActivityCard'
import DeudaSucursalesCard from '@/components/Dashboard/DeudaSucursalesCard'

/**
 * Enhanced Dashboard with Industrial Logistics aesthetic
 * Features: Modern design, animated metrics, quick actions, debt tracking
 */
const EnhancedDashboard = memo(function EnhancedDashboard({ user }) {
  // Fetch dashboard metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_counts')
      if (error) throw error
      return data
    },
    staleTime: 30 * 1000, // 30 seconds
  })

  // Transform metrics data
  const metricsMap = metrics?.reduce((acc, item) => {
    acc[item.tipo] = item.cantidad
    return acc
  }, {}) || {}

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: '1600px',
          mx: 'auto',
          width: '100%',
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography
            variant="h2"
            sx={{
              color: '#fff',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
              mb: 1,
            }}
          >
            Bienvenido, {user?.full_name}
          </Typography>
          <Typography
            sx={{
              color: '#888',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontFamily: '"Roboto Mono", monospace',
            }}
          >
            {user?.role?.name} • {user?.sucursal?.name || 'Sistema Global'}
          </Typography>
        </Box>

        {/* Key Metrics - Grid Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: { xs: 2, sm: 2.5, md: 3 },
            mb: { xs: 3, md: 4 },
          }}
        >
          <MetricCard
            label="Total Clientes"
            value={metricsMap.clientes || 0}
            icon={PeopleIcon}
            color="#95e1d3"
            loading={isLoading}
            delay={0.1}
          />
          <MetricCard
            label="Operadores"
            value={metricsMap.operadores || 0}
            icon={PeopleIcon}
            color="#4ecdc4"
            loading={isLoading}
            delay={0.2}
          />
          <MetricCard
            label="Sucursales"
            value={metricsMap.sucursal || 0}
            icon={BusinessIcon}
            color="#f7dc6f"
            loading={isLoading}
            delay={0.3}
          />
          <MetricCard
            label="Total Paquetes"
            value={metricsMap.paquetes || 0}
            icon={InventoryIcon}
            color="#ff6b35"
            loading={isLoading}
            delay={0.4}
          />
        </Box>

        {/* Debt Card Section - Full Width */}
        {(user?.role?.id === 1 || user?.role?.id === 2) && (
          <Box
            className="slide-up"
            sx={{
              opacity: 0,
              animationFillMode: 'forwards',
              animationDelay: '0.5s',
              mb: { xs: 3, md: 4 },
            }}
          >
            <DeudaSucursalesCard />
          </Box>
        )}

        {/* Quick Actions and Recent Activity - Side by Side */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: { xs: 2, sm: 2.5, md: 3 },
          }}
        >
          <QuickActionsCard userRole={user?.role?.id} />
          <RecentActivityCard />
        </Box>
      </Box>
    </Box>
  )
})

export default EnhancedDashboard
