'use client'

import AdminMenu from '@/components/Menu/AdminMenu'
import ClienteMenu from '@/components/Menu/ClienteMenu'
import OperadorMenu from '@/components/Menu/OperadorMenu'
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
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const drawerWidth = 260

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

    const menudRoleHandler = () => {
        if (session?.role?.id === 1) return <SuperAdminMenu />
        if (session?.role?.id === 2) return <AdminMenu />
        if (session?.role?.id === 3) return <OperadorMenu />
        if (session?.role?.id === 4) return <ClienteMenu />
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
                                    {session?.email}
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
                        color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between', // empuja el último elemento hacia abajo
                        p: 2
                    }
                }}
            >
                <Box>
                    <Image
                        src={'/logo.png'}
                        width={238}
                        height={140}
                        alt="Bienvenido al Sistema Logístico"
                    />
                    {menudRoleHandler()}
                </Box>

                {/* Este queda abajo */}
                <Typography variant="body2" sx={{ mt: 'auto', textAlign: 'center', py: 2 }}>
                    {session?.full_name} - {session?.role?.name} - {session?.sucursal?.name}
                </Typography>
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
