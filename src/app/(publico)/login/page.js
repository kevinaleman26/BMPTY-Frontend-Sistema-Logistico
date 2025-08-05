'use client'

import LoginForm from '@/components/Form/LoginForm'
import { Typography } from '@mui/material'

export default function LoginPage() {
    return (
        <>
            <Typography variant="h4" gutterBottom sx={{ marginBottom: 3 }}>
                Iniciar sesión
            </Typography>
            <LoginForm />  
        </>
    )
}
