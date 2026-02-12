// components/Dashboard/EnhancedDashboard/RecentActivityCard.js
'use client'

import { Box, Typography, Chip } from '@mui/material'
import {
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
  PersonAdd as PersonAddIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material'
import { memo } from 'react'

const RecentActivityCard = memo(function RecentActivityCard({ activities = [] }) {
  const activityIcons = {
    transfer: ShippingIcon,
    invoice: ReceiptIcon,
    client: PersonAddIcon,
    package: InventoryIcon,
  }

  const activityColors = {
    transfer: '#4ecdc4',
    invoice: '#f7dc6f',
    client: '#95e1d3',
    package: '#ff6b35',
  }

  // Mock data if no activities provided
  const mockActivities = [
    {
      type: 'package',
      title: 'Nuevo paquete registrado',
      description: 'Paquete #BMP-2024-001 agregado al sistema',
      time: 'Hace 2 horas',
    },
    {
      type: 'transfer',
      title: 'Transferencia completada',
      description: 'Century Tower → Plaza Cantabria',
      time: 'Hace 4 horas',
    },
    {
      type: 'invoice',
      title: 'Factura generada',
      description: 'Factura #FAC-2024-045 - $1,250.00',
      time: 'Hace 6 horas',
    },
    {
      type: 'client',
      title: 'Cliente registrado',
      description: 'Juan Pérez - Century Tower',
      time: 'Hace 8 horas',
    },
  ]

  const displayActivities = activities.length > 0 ? activities : mockActivities

  return (
    <Box
      className="slide-up"
      sx={{
        backgroundColor: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: '12px',
        p: 3,
        opacity: 0,
        animationFillMode: 'forwards',
        animationDelay: '0.5s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          sx={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#fff',
            letterSpacing: '-0.01em',
          }}
        >
          Actividad Reciente
        </Typography>
        <Chip
          label="Últimas 24h"
          size="small"
          sx={{
            backgroundColor: '#ff6b3515',
            border: '1px solid #ff6b3530',
            color: '#ff6b35',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflow: 'auto' }}>
        {displayActivities.slice(0, 4).map((activity, index) => {
          const IconComponent = activityIcons[activity.type] || InventoryIcon
          const color = activityColors[activity.type] || '#666'

          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 2,
                p: 2,
                borderRadius: '10px',
                backgroundColor: '#111',
                border: '1px solid #1a1a1a',
                transition: 'transform 0.3s ease, background-color 0.3s ease, border-color 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '3px',
                  backgroundColor: color,
                },
                '&:hover': {
                  backgroundColor: '#151515',
                  borderColor: '#222',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  backgroundColor: `${color}15`,
                  border: `1px solid ${color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconComponent sx={{ color, fontSize: 20 }} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    color: '#fff',
                    mb: 0.5,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {activity.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.8125rem',
                    color: '#888',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {activity.description}
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: '#666',
                  whiteSpace: 'nowrap',
                  fontFamily: '"Roboto Mono", monospace',
                }}
              >
                {activity.time}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
})

export default RecentActivityCard
