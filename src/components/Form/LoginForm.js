'use client'

import { supabase } from '@/lib/supabase'
import { Button, TextField, Typography } from '@mui/material'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
            router.push('/dashboard') // redirige al home u otra página
        }

        setSubmitting(false)
    }

  return (
      <Formik
          initialValues={{ email: '', password: '' }}
          onSubmit={handleLogin}
      >
          {({ values, handleChange, isSubmitting }) => (
              <Form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <TextField
                      label="Correo electrónico"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      required
                      fullWidth
                  />

                  <TextField
                      label="Contraseña"
                      name="password"
                      type="password"
                      value={values.password}
                      onChange={handleChange}
                      required
                      fullWidth
                  />

                  <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      sx={{ py: 1.5 }}
                  >
                      Iniciar sesión
                  </Button>

                  {status?.success && (
                      <Typography sx={{ color: 'success.main' }}>
                          {status.success}
                      </Typography>
                  )}
                  {status?.error && (
                      <Typography color="error">
                          {status.error}
                      </Typography>
                  )}
              </Form>
          )}
      </Formik>
  )
}

export default LoginForm