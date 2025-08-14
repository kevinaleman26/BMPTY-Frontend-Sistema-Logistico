'use client'

import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {

  const currentYear = new Date().getFullYear()
  const version = 'v1.0.0'

  return (
    <>
      {/* Navbar */}
      <AppBar position="static" style={{ backgroundColor: '#111' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo a la izquierda */}
          <Image src={'/logo.png'} width={150} height={90} alt=" Bienvenido al Sistema Logístico"  />
          {/* Botones a la derecha */}
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
      <Box sx={{
        flex: 1, // ocupa todo el alto disponible dentro de <main>
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        px: 2 }}>
        <Image src={'/logo.png'} width={500} height={400} alt=" Bienvenido al Sistema Logístico"/>
      </Box>
      {/* Footer */ }
      <Box component="footer" sx={{ textAlign: 'center', py: 2, borderTop: '1px solid #222' }}>
        <Typography variant="body2" color="gray">
          © {currentYear} - Versión {version}
        </Typography>
      </Box>
    </>
  )
}
