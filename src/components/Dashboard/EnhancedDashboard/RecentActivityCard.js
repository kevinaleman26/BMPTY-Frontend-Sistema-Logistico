'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import ShippingIcon from '@mui/icons-material/LocalShipping'
import ReceiptIcon from '@mui/icons-material/Receipt'
import InventoryIcon from '@mui/icons-material/Inventory'
import { memo } from 'react'

const TYPE_ICONS = {
    transfer: ShippingIcon,
    invoice: ReceiptIcon,
    package: InventoryIcon,
}

const ActivityItem = ({ activity }) => {
    const IconComponent = TYPE_ICONS[activity.type] || InventoryIcon

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 1.5,
                p: 1.5,
                borderRadius: '10px',
                backgroundColor: '#111',
                border: '1px solid #1a1a1a',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, background-color 0.2s ease',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0, top: 0, bottom: 0,
                    width: '3px',
                    backgroundColor: activity.color,
                },
                '&:hover': {
                    backgroundColor: '#151515',
                    transform: 'translateX(3px)',
                },
            }}
        >
            <Box
                sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    backgroundColor: `${activity.color}15`,
                    border: `1px solid ${activity.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <IconComponent sx={{ color: activity.color, fontSize: 18 }} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    sx={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#fff',
                        mb: 0.25,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {activity.title}
                </Typography>
                {activity.description && (
                    <Typography
                        sx={{
                            fontSize: '0.75rem',
                            color: '#666',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {activity.description}
                    </Typography>
                )}
                {activity.packageCode && (
                    <Typography
                        sx={{
                            fontSize: '0.7rem',
                            color: '#444',
                            fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace',
                            mt: 0.25,
                        }}
                    >
                        {activity.packageCode}
                    </Typography>
                )}
            </Box>

            <Typography
                sx={{
                    fontSize: '0.7rem',
                    color: '#555',
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace',
                    alignSelf: 'flex-start',
                    pt: 0.25,
                }}
            >
                {activity.time}
            </Typography>
        </Box>
    )
}

/**
 * Renders recent activity feed.
 * Accepts `activities` from useDashboardActivity hook (real data).
 * Falls back to empty state if no activities.
 */
const RecentActivityCard = memo(function RecentActivityCard({ activities = [], isLoading = false }) {
    return (
        <Box
            sx={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: '12px',
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
                    Actividad Reciente
                </Typography>
                <Chip
                    label="En vivo"
                    size="small"
                    sx={{
                        backgroundColor: '#4caf5015',
                        border: '1px solid #4caf5030',
                        color: '#4caf50',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        height: 22,
                    }}
                />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, overflow: 'auto' }}>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} variant="rectangular" height={60} sx={{ bgcolor: '#151515', borderRadius: 2 }} />
                    ))
                ) : activities.length === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                        <Typography sx={{ fontSize: '0.875rem', color: '#444' }}>Sin actividad reciente</Typography>
                    </Box>
                ) : (
                    activities.map((activity, index) => (
                        <ActivityItem key={index} activity={activity} />
                    ))
                )}
            </Box>
        </Box>
    )
})

export default RecentActivityCard
