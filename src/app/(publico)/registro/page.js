import ClientRegisterForm from '@/components/Form/ClientRegisterForm'
import { Typography } from '@mui/material'

export default function RegistroPage({ searchParams }) {
    const sucursalIdParam = searchParams?.sucursal ?? ''
    return (
        <>
            <Typography variant="h4" sx={{ marginY: 2, marginX: 'auto' }}>Registro de Usuario</Typography>
            <ClientRegisterForm sucursalIdParam={sucursalIdParam} />
        </>
    )
}
