'use client'

import ClientRegisterForm from '@/components/Form/ClientRegisterForm'
import { Typography } from '@mui/material'

export default function RegistroPage() {
    return (
        <>
            <Typography variant="h4" gutterBottom sx={{ marginBottom: 3 }}>
                Registro de Usuario
            </Typography>
            <ClientRegisterForm />
        </>
    )
}
