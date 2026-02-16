'use client'

import AdminMenu from '@/components/Menu/AdminMenu'
import ClienteMenu from '@/components/Menu/ClienteMenu'
import OperadorMenu from '@/components/Menu/OperadorMenu'
import SuperAdminMenu from '@/components/Menu/SuperAdminMenu'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useSession } from '@/hooks/useSession'
import { supabase } from '@/lib/supabase'
import AccountCircle from '@mui/icons-material/AccountCircle'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useMemo } from 'react'

const drawerWidth = 260

export default function PrivadoLayout({ children }) {
    const { session } = useSession()
    const router = useRouter()
    const [anchorEl, setAnchorEl] = useState(null)

    const handleLogout = useCallback(async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }, [router])

    const handleMenuOpen = useCallback((event) => {
        setAnchorEl(event.currentTarget)
    }, [])

    const handleMenuClose = useCallback(() => {
        setAnchorEl(null)
    }, [])

    const roleMenu = useMemo(() => {
        if (session?.role?.id === 1) return <SuperAdminMenu />
        if (session?.role?.id === 2) return <AdminMenu />
        if (session?.role?.id === 3) return <OperadorMenu />
        if (session?.role?.id === 4) return <ClienteMenu />
        return null
    }, [session?.role?.id])

    return (
        <ProtectedRoute>
            <CssBaseline />

            {/* Navbar */}
            <AppBar
                position="fixed"
                elevation={0}
                className="slide-down"
                sx={{
                    width: `calc(100% - ${drawerWidth}px)`,
                    ml: `${drawerWidth}px`,
                    backgroundColor: 'surface.elevated',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backdropFilter: 'blur(8px)',
                    // Subtle background texture
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
                }}
            >
                <Toolbar sx={{ justifyContent: 'flex-end', minHeight: '64px !important' }}>
                    <Box>
                        <IconButton
                            color="inherit"
                            onClick={handleMenuOpen}
                            sx={{
                                transition: 'all 200ms ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(244, 178, 35, 0.12)',
                                    transform: 'scale(1.05)',
                                    '& svg': {
                                        filter: 'drop-shadow(0 0 8px rgba(244, 178, 35, 0.4))',
                                    }
                                }
                            }}
                        >
                            <AccountCircle />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            TransitionProps={{
                                timeout: 200,
                            }}
                            PaperProps={{
                                sx: {
                                    backgroundColor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    mt: 1,
                                    minWidth: 220,
                                    borderRadius: '8px',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                                    overflow: 'hidden',
                                    // Top accent bar
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '3px',
                                        background: 'linear-gradient(90deg, #f4b223 0%, #d69b1e 100%)',
                                    },
                                    '& .MuiMenuItem-root': {
                                        py: 1.5,
                                        px: 2,
                                        transition: 'all 150ms ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(244, 178, 35, 0.08)',
                                            paddingLeft: '20px',
                                        },
                                        '&.Mui-disabled': {
                                            opacity: 1,
                                            backgroundColor: 'surface.elevated',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            mb: 0.5,
                                        }
                                    }
                                }
                            }}
                        >
                            <MenuItem disabled>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        fontSize: '0.8rem',
                                        fontFamily: '"JetBrains Mono", monospace',
                                    }}
                                >
                                    {session?.email}
                                </Typography>
                            </MenuItem>
                            <MenuItem component={Link} href="/perfil" onClick={handleMenuClose}>
                                Perfil de Usuario
                            </MenuItem>
                            <MenuItem
                                onClick={handleLogout}
                                sx={{
                                    color: 'error.main !important',
                                    fontWeight: 500,
                                }}
                            >
                                Cerrar sesión
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
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
                        // Subtle background texture
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
                            // Logo glow on hover
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
                            src={'/logo.png'}
                            width={238}
                            height={140}
                            alt="Bienvenido al Sistema Logístico"
                        />
                    </Box>
                    <Box sx={{ animationDelay: '0.2s' }}>
                        {roleMenu}
                    </Box>
                </Box>

                {/* User Info Card with improved styling */}
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
                        // Accent gradient bar on left
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
                            {session?.sucursal?.name}
                        </Typography>
                    )}
                </Box>
            </Drawer>


            {/* Contenido */}
            <Box
                component="main"
                className="fade-in"
                sx={{
                    flexGrow: 1,
                    bgcolor: 'background.default',
                    p: 4,
                    ml: `${drawerWidth}px`,
                    mt: 8,
                    minHeight: '90vh',
                    animationDelay: '0.15s',
                    opacity: 0,
                    animationFillMode: 'forwards',
                }}
            >
                {children}
            </Box>
        </ProtectedRoute>
    )
}
