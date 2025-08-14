'use client'

import { AppBar, Box, Button, Toolbar } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'


export default function PublicLayout({ children }) {
    return (
        <>
            <AppBar position="static" style={{ backgroundColor: '#111' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Image src={'/logo.png'} width={150} height={90} alt=" Bienvenido al Sistema Logístico"  />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button component={Link} href="/registro" color="inherit">
                            Registro
                        </Button>
                        <Button component={Link} href="/login" color="inherit">
                            Iniciar sesión
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
                <Box sx={{ width: '25%', p: 4, backgroundColor: '#111', color: '#fff' }}>
                    {children}
                </Box>
                <Box
                    sx={{
                        width: '75%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#000',
                        color: '#fff',
                    }}
                >
                    <Image src={'/logo.png'} width={500} height={400} alt=" Bienvenido al Sistema Logístico"  />
                </Box>
            </Box>
        </>
    )
}