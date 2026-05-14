'use client'

import { supabase } from '@/lib/supabase'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import { alpha } from '@mui/system'
import { Form, Formik } from 'formik'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`

const fieldStyles = {
    '& .MuiOutlinedInput-root': {
        backgroundColor: '#2f2c24',
        backgroundImage: noiseTexture,
        borderRadius: '8px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: 'IBM Plex Sans, sans-serif',
        '& fieldset': {
            borderColor: '#3a3730',
            borderWidth: '1px'
        },
        '&:hover fieldset': {
            borderColor: '#4a453c'
        },
        '&.Mui-focused fieldset': {
            borderColor: '#f4b223',
            borderWidth: '2px',
            boxShadow: '0 0 0 3px rgba(244, 178, 35, 0.1)'
        },
        '& input': {
            color: '#e8e6e0',
            fontSize: '1rem',
            fontFamily: 'IBM Plex Sans, sans-serif'
        }
    },
    '& .MuiInputLabel-root': {
        color: '#a8a399',
        fontSize: '1rem',
        fontFamily: 'IBM Plex Sans, sans-serif',
        '&.Mui-focused': {
            color: '#f4b223'
        }
    }
}

const LoginForm = () => {
    const router = useRouter()
    const [status, setStatus] = useState(null)

    const handleLogin = async (values, { setSubmitting }) => {
        setStatus(null)

        const { email, password } = values

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            setStatus({ error: error.message })
        } else {
            setStatus({ success: 'Login exitoso' })
            router.push('/dashboard')
        }

        setSubmitting(false)
    }

    return (
        <Formik
            initialValues={{ email: '', password: '' }}
            onSubmit={handleLogin}
        >
            {({ values, handleChange, isSubmitting }) => (
                <Form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Form Fields Container */}
                    <Box
                        className="fade-in"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            opacity: 0,
                            animationFillMode: 'forwards',
                            animationDelay: '0.2s'
                        }}
                    >
                        <TextField
                            label="Correo electrónico"
                            name="email"
                            type="email"
                            value={values.email}
                            onChange={handleChange}
                            required
                            fullWidth
                            sx={fieldStyles}
                        />

                        <TextField
                            label="Contraseña"
                            name="password"
                            type="password"
                            value={values.password}
                            onChange={handleChange}
                            required
                            fullWidth
                            sx={fieldStyles}
                        />
                    </Box>

                    {/* Status Messages */}
                    {status?.success && (
                        <Alert
                            severity="success"
                            sx={{
                                backgroundColor: alpha('#4CAF50', 0.15),
                                backgroundImage: noiseTexture,
                                color: '#81C784',
                                border: '1px solid',
                                borderColor: alpha('#4CAF50', 0.3),
                                borderRadius: '8px',
                                fontFamily: 'IBM Plex Sans, sans-serif',
                                '& .MuiAlert-icon': {
                                    color: '#81C784'
                                }
                            }}
                        >
                            {status.success}
                        </Alert>
                    )}
                    {status?.error && (
                        <Alert
                            severity="error"
                            sx={{
                                backgroundColor: alpha('#f44336', 0.15),
                                backgroundImage: noiseTexture,
                                color: '#EF5350',
                                border: '1px solid',
                                borderColor: alpha('#f44336', 0.3),
                                borderRadius: '8px',
                                fontFamily: 'IBM Plex Sans, sans-serif',
                                '& .MuiAlert-icon': {
                                    color: '#EF5350'
                                }
                            }}
                        >
                            {status.error}
                        </Alert>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        fullWidth
                        sx={{
                            backgroundColor: '#f4b223',
                            color: '#1a1815',
                            fontSize: '1rem',
                            fontWeight: 600,
                            fontFamily: 'IBM Plex Sans, sans-serif',
                            letterSpacing: '0.02em',
                            py: 1.5,
                            borderRadius: '8px',
                            textTransform: 'none',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(244, 178, 35, 0.2)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                backgroundColor: '#f7c14a',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(244, 178, 35, 0.3)'
                            },
                            '&:active': {
                                transform: 'translateY(0)',
                                backgroundColor: '#d69b1e'
                            },
                            '&.Mui-disabled': {
                                backgroundColor: '#3a3730',
                                color: '#6d685f'
                            }
                        }}
                    >
                        {isSubmitting ? (
                            <CircularProgress size={24} sx={{ color: '#1a1815' }} />
                        ) : (
                            'Iniciar sesión'
                        )}
                    </Button>

                    {/* Footer Link */}
                    <Box
                        sx={{
                            textAlign: 'center',
                            pt: 2,
                            borderTop: '1px solid',
                            borderColor: '#2d2a25'
                        }}
                    >
                        <Box
                            component="span"
                            sx={{
                                color: '#a8a399',
                                fontSize: '0.9375rem',
                                fontFamily: 'IBM Plex Sans, sans-serif'
                            }}
                        >
                            ¿No tienes cuenta?{' '}
                        </Box>
                        <Link
                            href="/registro"
                            style={{
                                color: '#f4b223',
                                textDecoration: 'none',
                                fontSize: '0.9375rem',
                                fontWeight: 500,
                                fontFamily: 'IBM Plex Sans, sans-serif',
                                transition: 'color 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onMouseEnter={(e) => (e.target.style.color = '#f7c14a')}
                            onMouseLeave={(e) => (e.target.style.color = '#f4b223')}
                        >
                            Regístrate aquí
                        </Link>
                    </Box>
                </Form>
            )}
        </Formik>
    )
}

export default LoginForm
