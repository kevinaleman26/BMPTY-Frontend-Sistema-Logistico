'use client'

import SuperAdminMenu from '@/components/Menu/SuperAdminMenu'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useSession } from '@/hooks/useSession'
import { supabase } from '@/lib/supabase'
import AccountCircle from '@mui/icons-material/AccountCircle'
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Typography
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const drawerWidth = 240

export default function PrivadoLayout({ children }) {
    const { session } = useSession()
    const router = useRouter()
    const [anchorEl, setAnchorEl] = useState(null)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    return (
        <ProtectedRoute>
            <CssBaseline />

            {/* Navbar */}
            <AppBar
                position="fixed"
                sx={{
                    width: `calc(100% - ${drawerWidth}px)`,
                    ml: `${drawerWidth}px`,
                    backgroundColor: '#111'
                }}
            >
                <Toolbar sx={{ justifyContent: 'flex-end' }}>
                    <Box>
                        <IconButton color="inherit" onClick={handleMenuOpen}>
                            <AccountCircle />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: {
                                    backgroundColor: '#222',
                                    color: '#fff'
                                }
                            }}
                        >
                            <MenuItem disabled>
                                <Typography variant="body2">
                                    {session?.user?.email}
                                </Typography>
                            </MenuItem>
                            <MenuItem component={Link} href="/perfil" onClick={handleMenuClose}>
                                Perfil de Usuario
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundColor: '#111',
                        color: '#fff'
                    }
                }}
            >
                <Typography variant="h6" sx={{ m: 3 }}>
                    Panel Logístico
                </Typography>
                <SuperAdminMenu />
            </Drawer>

            {/* Contenido */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: '#000',
                    color: '#fff',
                    p: 3,
                    ml: `${drawerWidth}px`,
                    mt: 8,
                    minHeight: '90vh'
                }}
            >
                {children}
            </Box>
        </ProtectedRoute>
    )
}
