'use client'

import AdminMenu from '@/components/Menu/AdminMenu'
import ClienteMenu from '@/components/Menu/ClienteMenu'
import OperadorMenu from '@/components/Menu/OperadorMenu'
import SuperAdminMenu from '@/components/Menu/SuperAdminMenu'
import { useSession } from '@/hooks/useSession'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useMemo } from 'react'

const drawerWidth = 260

// ⚡ Client Component - Solo la parte interactiva del Sidebar
export default function SidebarClient() {
    const { session } = useSession()

    const roleMenu = useMemo(() => {
        if (!session?.role?.id) return null

        switch (session.role.id) {
            case 1: return <SuperAdminMenu />
            case 2: return <AdminMenu />
            case 3: return <OperadorMenu />
            case 4: return <ClienteMenu />
            default: return null
        }
    }, [session?.role?.id])

    return (
        <Drawer
            variant="permanent"
            className="slide-in-left"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    backgroundColor: 'surface.elevated',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 2,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
                }
            }}
        >
            <Box>
                <Box
                    className="fade-in"
                    sx={{
                        px: 1,
                        mb: 4,
                        position: 'relative',
                        animationDelay: '0.1s',
                        opacity: 0,
                        animationFillMode: 'forwards',
                        '&:hover': {
                            '& img': {
                                filter: 'drop-shadow(0 0 12px rgba(244, 178, 35, 0.3))',
                            },
                        },
                        '& img': {
                            transition: 'filter 300ms ease',
                        }
                    }}
                >
                    <Image
                        src="/logo.png"
                        width={238}
                        height={140}
                        alt="Bienvenido al Sistema Logístico"
                        priority
                        quality={90}
                    />
                </Box>
                <Box sx={{ animationDelay: '0.2s' }}>
                    {roleMenu}
                </Box>
            </Box>

            {/* User Info Card */}
            <Box
                className="slide-up"
                sx={{
                    mt: 'auto',
                    p: 2.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'surface.base',
                    borderRadius: '8px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 200ms ease',
                    animationDelay: '0.3s',
                    opacity: 0,
                    animationFillMode: 'forwards',
                    '&:hover': {
                        backgroundColor: 'surface.card',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '3px',
                        background: 'linear-gradient(180deg, #f4b223 0%, #d69b1e 100%)',
                    }
                }}
            >
                {/* Role Badge */}
                <Box
                    sx={{
                        display: 'inline-block',
                        px: 1.5,
                        py: 0.5,
                        mb: 1,
                        borderRadius: '4px',
                        backgroundColor: 'rgba(244, 178, 35, 0.15)',
                        border: '1px solid rgba(244, 178, 35, 0.3)',
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}
                    >
                        {session?.role?.name}
                    </Typography>
                </Box>

                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        color: 'text.emphasis',
                        fontSize: '0.9rem',
                    }}
                >
                    {session?.full_name}
                </Typography>

                {session?.sucursal?.name && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.75rem',
                        }}
                    >
                        <Box
                            component="span"
                            sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: 'success.main',
                                display: 'inline-block',
                                mr: 1,
                                boxShadow: '0 0 8px rgba(76, 175, 80, 0.5)',
                            }}
                        />
                        {session.sucursal.name}
                    </Typography>
                )}
            </Box>
        </Drawer>
    )
}
