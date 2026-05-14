// ⚡ Server Component - Aprovecha RSC de Next.js 16
import ProtectedRoute from '@/components/ProtectedRoute'
import NavbarClient from '@/components/Layout/NavbarClient'
import SidebarClient from '@/components/Layout/SidebarClient'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'

const drawerWidth = 260

// ⚡ Este layout es ahora un Server Component
// Solo las partes interactivas (Navbar y Sidebar) son Client Components
export default function PrivadoLayout({ children }) {
    return (
        <ProtectedRoute>
            <CssBaseline />

            {/* Client Component - Navbar interactivo */}
            <NavbarClient />

            {/* Client Component - Sidebar interactivo */}
            <SidebarClient />

            {/* Contenido - Server Component por defecto */}
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
