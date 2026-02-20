'use client'

import { useSession } from '@/hooks/useSession'
import { supabase } from '@/lib/supabase'
import AccountCircle from '@mui/icons-material/AccountCircle'
import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useState, useCallback } from 'react'

const drawerWidth = 260

// ⚡ Client Component - Solo la parte interactiva del Navbar
export default function NavbarClient() {
    const { session } = useSession()
    const [anchorEl, setAnchorEl] = useState(null)

    const handleLogout = useCallback(async () => {
        setAnchorEl(null)
        try {
            await supabase.auth.signOut()
        } finally {
            window.location.href = '/login'
        }
    }, [])

    const handleMenuOpen = useCallback((event) => {
        setAnchorEl(event.currentTarget)
    }, [])

    const handleMenuClose = useCallback(() => {
        setAnchorEl(null)
    }, [])

    return (
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
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
            }}
        >
            <Toolbar sx={{ justifyContent: 'flex-end', minHeight: '64px !important' }}>
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
                    TransitionProps={{ timeout: 200 }}
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
            </Toolbar>
        </AppBar>
    )
}
