// components/Dashboard/EnhancedDashboard/QuickActionsCard.js
'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import ShippingIcon from '@mui/icons-material/LocalShipping'
import ReceiptIcon from '@mui/icons-material/Receipt'
import PeopleIcon from '@mui/icons-material/People'
import { useRouter } from 'next/navigation'
import { memo } from 'react'

const QuickActionsCard = memo(function QuickActionsCard({ userRole }) {
  const router = useRouter()

  const actions = [
    {
      label: 'Nuevo Paquete',
      icon: AddIcon,
      color: '#ff6b35',
      href: '/paquetes?page=1&limit=10',
      roles: [1, 2, 3], // SuperAdmin, Admin, Operador
    },
    {
      label: 'Nueva Transferencia',
      icon: ShippingIcon,
      color: '#4ecdc4',
      href: '/transferencia-sucursal?page=1&limit=10',
      roles: [1], // Solo SuperAdmin
    },
    {
      label: 'Nueva Factura',
      icon: ReceiptIcon,
      color: '#f7dc6f',
      href: '/facturacion?page=1&limit=10',
      roles: [1, 2], // SuperAdmin y Admin
    },
    {
      label: 'Nuevo Cliente',
      icon: PeopleIcon,
      color: '#95e1d3',
      href: '/cliente?page=1&limit=10',
      roles: [1, 2], // SuperAdmin y Admin
    },
  ]

  const availableActions = actions.filter(action => action.roles.includes(userRole))

  if (availableActions.length === 0) return null

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
        animationDelay: '0.4s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        sx={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: '#fff',
          mb: 3,
          letterSpacing: '-0.01em',
        }}
      >
        Acciones Rápidas
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {availableActions.map((action, index) => (
          <Button
            key={action.label}
            onClick={() => router.push(action.href)}
            aria-label={action.label}
            sx={{
              justifyContent: 'flex-start',
              textAlign: 'left',
              p: 2,
              borderRadius: '10px',
              backgroundColor: '#111',
              border: `1px solid #222`,
              color: '#fff',
              textTransform: 'none',
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
                backgroundColor: action.color,
                transform: 'scaleY(0)',
                transition: 'transform 0.3s ease',
              },
              '&:hover': {
                backgroundColor: '#151515',
                borderColor: action.color,
                transform: 'translateX(4px)',
                '&::before': {
                  transform: 'scaleY(1)',
                },
                '& .action-icon': {
                  transform: 'rotate(5deg) scale(1.1)',
                  backgroundColor: `${action.color}25`,
                },
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Box
                className="action-icon"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  backgroundColor: `${action.color}15`,
                  border: `1px solid ${action.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }}
              >
                <action.icon sx={{ color: action.color, fontSize: 20 }} />
              </Box>
              <Typography
                sx={{
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  flex: 1,
                }}
              >
                {action.label}
              </Typography>
            </Box>
          </Button>
        ))}
      </Box>
    </Box>
  )
})

export default QuickActionsCard
