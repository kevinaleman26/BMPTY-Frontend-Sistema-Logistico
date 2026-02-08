'use client'

import { Alert, Box, Button, CircularProgress, Snackbar, TextField, Typography, alpha } from '@mui/material'
import { Form, Formik } from 'formik'
import Link from 'next/link'
import { useState } from 'react'
import * as Yup from 'yup'

import DocumentTypeDropdown from '@/components/Dropdown/DocumentTypeDropdown'
import SucursalDropdown from '@/components/Dropdown/SucursalDropdown'
import { useSignup } from '@/hooks/useSignup'

const validationSchema = Yup.object({
    nombre: Yup.string().required('Nombre obligatorio'),
    telefono: Yup.string().required('Teléfono obligatorio'),
    email: Yup.string().email('Correo inválido').required('Correo obligatorio'),
    password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Contraseña obligatoria'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
        .required('Confirma tu contraseña'),
    document_type: Yup.string().required('Tipo de documento obligatorio'),
    document: Yup.string().required('Número de documento obligatorio'),
})

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
        },
        '& .MuiSelect-select': {
            color: '#e8e6e0',
            fontSize: '1rem',
            fontFamily: 'IBM Plex Sans, sans-serif'
        },
        '& .MuiSelect-icon': {
            color: '#a8a399'
        }
    },
    '& .MuiInputLabel-root': {
        color: '#a8a399',
        fontSize: '1rem',
        fontFamily: 'IBM Plex Sans, sans-serif',
        '&.Mui-focused': {
            color: '#f4b223'
        }
    },
    '& .MuiFormHelperText-root': {
        color: '#EF5350',
        fontSize: '0.875rem',
        fontFamily: 'IBM Plex Sans, sans-serif'
    }
}

export default function ClientRegisterForm({ sucursalIdParam = '' }) {
    const signUpMutation = useSignup()
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' })

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            await signUpMutation.mutateAsync(values)
            setAlert({ open: true, message: 'Usuario creado. Revisa tu correo.', severity: 'success' })
            resetForm()
        } catch (error) {
            setAlert({ open: true, message: error.message, severity: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <Formik
                enableReinitialize
                initialValues={{
                    nombre: '',
                    telefono: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    tipo: 'cliente',
                    document_type: '',
                    document: '',
                    sucursal_id: sucursalIdParam || '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, handleChange, touched, errors, isSubmitting }) => (
                    <Form style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* Section 1: Información de Sucursal */}
                        <Box
                            className="fade-in"
                            sx={{
                                opacity: 0,
                                animationFillMode: 'forwards',
                                animationDelay: '0.15s'
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    mb: 2.5
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '3px',
                                        height: '20px',
                                        backgroundColor: '#f4b223',
                                        borderRadius: '2px'
                                    }}
                                />
                                <Typography
                                    sx={{
                                        color: '#e8e6e0',
                                        fontSize: '0.8125rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                        fontFamily: 'JetBrains Mono, monospace'
                                    }}
                                >
                                    Sección 1 — Sucursal
                                </Typography>
                            </Box>
                            <SucursalDropdown
                                name="sucursal_id"
                                value={values.sucursal_id}
                                onChange={handleChange}
                                disabled={!!sucursalIdParam}
                                sx={fieldStyles}
                            />
                        </Box>

                        {/* Section 2: Información Personal */}
                        <Box
                            className="fade-in"
                            sx={{
                                opacity: 0,
                                animationFillMode: 'forwards',
                                animationDelay: '0.2s'
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    mb: 2.5
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '3px',
                                        height: '20px',
                                        backgroundColor: '#f4b223',
                                        borderRadius: '2px'
                                    }}
                                />
                                <Typography
                                    sx={{
                                        color: '#e8e6e0',
                                        fontSize: '0.8125rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                        fontFamily: 'JetBrains Mono, monospace'
                                    }}
                                >
                                    Sección 2 — Datos Personales
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <TextField
                                    label="Nombre completo"
                                    name="nombre"
                                    value={values.nombre}
                                    onChange={handleChange}
                                    error={touched.nombre && Boolean(errors.nombre)}
                                    helperText={touched.nombre && errors.nombre}
                                    required
                                    fullWidth
                                    sx={fieldStyles}
                                />

                                <TextField
                                    label="Teléfono"
                                    name="telefono"
                                    value={values.telefono}
                                    onChange={handleChange}
                                    error={touched.telefono && Boolean(errors.telefono)}
                                    helperText={touched.telefono && errors.telefono}
                                    fullWidth
                                    required
                                    sx={fieldStyles}
                                />
                            </Box>
                        </Box>

                        {/* Section 3: Información de Documento */}
                        <Box
                            className="fade-in"
                            sx={{
                                opacity: 0,
                                animationFillMode: 'forwards',
                                animationDelay: '0.25s'
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    mb: 2.5
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '3px',
                                        height: '20px',
                                        backgroundColor: '#f4b223',
                                        borderRadius: '2px'
                                    }}
                                />
                                <Typography
                                    sx={{
                                        color: '#e8e6e0',
                                        fontSize: '0.8125rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                        fontFamily: 'JetBrains Mono, monospace'
                                    }}
                                >
                                    Sección 3 — Identificación
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <DocumentTypeDropdown
                                    name="document_type"
                                    value={values.document_type}
                                    onChange={handleChange}
                                    error={touched.document_type && errors.document_type}
                                    sx={fieldStyles}
                                />

                                <TextField
                                    label="Número de documento"
                                    name="document"
                                    required
                                    value={values.document}
                                    onChange={handleChange}
                                    error={touched.document && Boolean(errors.document)}
                                    helperText={touched.document && errors.document}
                                    fullWidth
                                    sx={fieldStyles}
                                />
                            </Box>
                        </Box>

                        {/* Section 4: Credenciales */}
                        <Box
                            className="fade-in"
                            sx={{
                                opacity: 0,
                                animationFillMode: 'forwards',
                                animationDelay: '0.3s'
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    mb: 2.5
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '3px',
                                        height: '20px',
                                        backgroundColor: '#f4b223',
                                        borderRadius: '2px'
                                    }}
                                />
                                <Typography
                                    sx={{
                                        color: '#e8e6e0',
                                        fontSize: '0.8125rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                        fontFamily: 'JetBrains Mono, monospace'
                                    }}
                                >
                                    Sección 4 — Credenciales de Acceso
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <TextField
                                    label="Correo electrónico"
                                    name="email"
                                    type="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    error={touched.email && Boolean(errors.email)}
                                    helperText={touched.email && errors.email}
                                    fullWidth
                                    required
                                    sx={fieldStyles}
                                />

                                <TextField
                                    label="Contraseña"
                                    name="password"
                                    type="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    error={touched.password && Boolean(errors.password)}
                                    helperText={touched.password && errors.password}
                                    fullWidth
                                    required
                                    sx={fieldStyles}
                                />

                                <TextField
                                    label="Confirmar contraseña"
                                    name="confirmPassword"
                                    type="password"
                                    value={values.confirmPassword}
                                    onChange={handleChange}
                                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                                    helperText={touched.confirmPassword && errors.confirmPassword}
                                    fullWidth
                                    required
                                    sx={fieldStyles}
                                />
                            </Box>
                        </Box>

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
                                mt: 1,
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
                                'Registrarse'
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
                                ¿Ya tienes cuenta?{' '}
                            </Box>
                            <Link
                                href="/login"
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
                                Inicia sesión aquí
                            </Link>
                        </Box>
                    </Form>
                )}
            </Formik>

            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={() => setAlert({ ...alert, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setAlert({ ...alert, open: false })}
                    severity={alert.severity}
                    variant="filled"
                    sx={{
                        backgroundColor: alert.severity === 'success'
                            ? alpha('#4CAF50', 0.95)
                            : alpha('#f44336', 0.95),
                        backgroundImage: noiseTexture,
                        color: '#fff',
                        borderRadius: '8px',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        '& .MuiAlert-icon': {
                            color: '#fff'
                        }
                    }}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </>
    )
}
