import { Alert, Button, Divider, Snackbar, TextField } from '@mui/material'
import { Form, Formik } from 'formik'
import { useState } from 'react'
import * as Yup from 'yup'

import DocumentTypeDropdown from '@/components/Dropdown/DocumentTypeDropdown'
import SucursalDropdown from '@/components/Dropdown/SucursalDropdown'
import { useSignup } from '@/hooks/useSignup'

import { useSearchParams } from 'next/navigation'

const validationSchema = Yup.object({
    nombre: Yup.string().required('Nombre obligatorio'),
    telefono: Yup.string().required('Teléfono obligatorio'),
    email: Yup.string().email('Correo inválido').required('Correo obligatorio'),
    password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Contraseña obligatoria'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
        .required('Confirma tu contraseña'),
    document_type: Yup.string().required('Tipo de documento obligatorio'),
    document: Yup.string().required('Número de documento obligatorio')
})

const ClientRegisterForm = () => {

    const searchParams = useSearchParams()
    const sucursalIdParam = searchParams.get('sucursal') // <- lee el query param

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
              initialValues={{
                  nombre: '',
                  telefono: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  tipo: 'cliente',
                  document_type: '',
                  document: '',
                  sucursal_id: sucursalIdParam || ''
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
          >
              {({ values, handleChange, touched, errors, isSubmitting }) => (
                  <Form style={{ display: 'flex', flexDirection: 'column', gap: '1rem'  }}>

                      <SucursalDropdown
                          name="sucursal_id"
                          value={values.sucursal_id}
                          onChange={handleChange}
                          disabled={!!sucursalIdParam}
                      />


                      <TextField
                          label="Nombre completo"
                          name="nombre"
                          value={values.nombre}
                          onChange={handleChange}
                          error={touched.nombre && Boolean(errors.nombre)}
                          helperText={touched.nombre && errors.nombre}
                          required
                          fullWidth
                          InputLabelProps={{ style: { color: '#ccc' } }}
                          InputProps={{ style: { color: '#fff' } }}
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
                          InputLabelProps={{ style: { color: '#ccc' } }}
                          InputProps={{ style: { color: '#fff' } }}
                      />

                      

                      <DocumentTypeDropdown
                          name="document_type"
                          value={values.document_type}
                          onChange={handleChange}
                          error={touched.document_type && errors.document_type}
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
                          InputLabelProps={{ style: { color: '#ccc' } }}
                          InputProps={{ style: { color: '#fff' } }}
                      />

                      <Divider />

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
                          InputLabelProps={{ style: { color: '#ccc' } }}
                          InputProps={{ style: { color: '#fff' } }}
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
                          InputLabelProps={{ style: { color: '#ccc' } }}
                          InputProps={{ style: { color: '#fff' } }}
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
                          InputLabelProps={{ style: { color: '#ccc' } }}
                          InputProps={{ style: { color: '#fff' } }}
                      />

                      <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                          Registrarse
                      </Button>
                  </Form>
              )}
          </Formik>

          <Snackbar
              open={alert.open}
              autoHideDuration={6000}
              onClose={() => setAlert({ ...alert, open: false })}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
              <Alert
                  onClose={() => setAlert({ ...alert, open: false })}
                  severity={alert.severity}
                  variant="filled"
              >
                  {alert.message}
              </Alert>
          </Snackbar>
    </>
  )
}

export default ClientRegisterForm