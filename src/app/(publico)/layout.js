'use client'

import { AppBar, Box, Button, Toolbar } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'


export default function PublicLayout({ children }) {
    return (
        <>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    backgroundColor: 'surface.elevated',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Image src={'/logo.png'} width={150} height={90} alt="Bienvenido al Sistema Logístico" />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            component={Link}
                            href="/registro"
                            sx={{
                                color: 'text.primary',
                                '&:hover': {
                                    backgroundColor: 'rgba(244, 178, 35, 0.08)'
                                }
                            }}
                        >
                            Registro
                        </Button>
                        <Button
                            component={Link}
                            href="/login"
                            variant="contained"
                        >
                            Iniciar sesión
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
                <Box
                    sx={{
                        width: '25%',
                        p: 4,
                        backgroundColor: 'surface.card',
                        borderRight: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    {children}
                </Box>
                <Box
                    sx={{
                        width: '75%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'background.default'
                    }}
                >
                    <Image src={'/logo.png'} width={500} height={400} alt="Bienvenido al Sistema Logístico" />
                </Box>
            </Box>
        </>
    )
}