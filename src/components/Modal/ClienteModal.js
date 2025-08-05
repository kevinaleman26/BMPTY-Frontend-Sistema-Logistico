'use client'

import { useMutateCliente } from '@/hooks/useMutateCliente'
import { useSucursal } from '@/hooks/useSucursal'
import { useTipoDocumento } from '@/hooks/useTipoDocumento'
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'

export default function ClienteModal({ open, onClose, cliente }) {
    const { createCliente, updateCliente } = useMutateCliente()
    const { data: tiposDoc } = useTipoDocumento()
    const { data: sucursales } = useSucursal()

    

    const formik = useFormik({
        initialValues: {
            full_name: cliente?.full_name || '',
            email: cliente?.email || '',
            document: cliente?.document || '',
            phone: cliente?.phone || '',
            password: '',
            confirmPassword: '',
            document_type: cliente?.document_type || '',
            sucursal_id: cliente?.sucursal_id || ''
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            full_name: Yup.string().required('Nombre requerido'),
            email: Yup.string().email('Email inválido').required('Email requerido'),
            document: Yup.string().required('Número de documento requerido'),
            phone: Yup.string().required('Teléfono requerido'),
            password: cliente ? Yup.string() : Yup.string().required('Contraseña requerida'),
            confirmPassword: cliente
                ? Yup.string()
                : Yup.string()
                    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
                    .required('Confirmación requerida'),
            document_type: Yup.string().required('Tipo de documento requerido'),
            sucursal_id: Yup.string().required('Sucursal requerida')
        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                if (cliente) {
                    delete values.confirmPassword
                    delete values.password
                    values["tarifa"] = tarifa
                    await updateCliente.mutateAsync({ id: cliente.id, ...values })
                } else {
                    values["tarifa"] = tarifa
                    await createCliente.mutateAsync(values)
                }
                onClose()
                resetForm()
            } catch (error) {
                console.error('Error al guardar cliente:', error)
            }
        }
    })

    const selectedSucursal = sucursales?.find(s => s.id === formik?.values?.sucursal_id)
    const tarifa = selectedSucursal?.tasa || ''

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{cliente ? 'Editar Cliente' : 'Crear Cliente'}</DialogTitle>
            <DialogContent>
                <Box
                    component="form"
                    onSubmit={formik.handleSubmit}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, py: 1 }}
                >
                    <TextField
                        select
                        label="Sucursal"
                        name="sucursal_id"
                        value={formik.values.sucursal_id}
                        onChange={formik.handleChange}
                        error={formik.touched.sucursal_id && Boolean(formik.errors.sucursal_id)}
                        helperText={formik.touched.sucursal_id && formik.errors.sucursal_id}
                        fullWidth
                    >
                        {sucursales?.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Nombre completo"
                        name="full_name"
                        value={formik.values.full_name}
                        onChange={formik.handleChange}
                        error={formik.touched.full_name && Boolean(formik.errors.full_name)}
                        helperText={formik.touched.full_name && formik.errors.full_name}
                        fullWidth
                    />

                    <TextField
                        select
                        label="Tipo de documento"
                        name="document_type"
                        value={formik.values.document_type}
                        onChange={formik.handleChange}
                        error={formik.touched.document_type && Boolean(formik.errors.document_type)}
                        helperText={formik.touched.document_type && formik.errors.document_type}
                        fullWidth
                    >
                        {tiposDoc?.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Número de documento"
                        name="document"
                        value={formik.values.document}
                        onChange={formik.handleChange}
                        error={formik.touched.document && Boolean(formik.errors.document)}
                        helperText={formik.touched.document && formik.errors.document}
                        fullWidth
                    />

                    <TextField
                        label="Teléfono"
                        name="phone"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={formik.touched.phone && formik.errors.phone}
                        fullWidth
                    />

                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                        fullWidth
                    />

                    {!cliente && (
                        <>
                            <TextField
                                label="Contraseña"
                                name="password"
                                type="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
                                fullWidth
                            />
                            <TextField
                                label="Confirmar contraseña"
                                name="confirmPassword"
                                type="password"
                                value={formik.values.confirmPassword}
                                onChange={formik.handleChange}
                                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                                fullWidth
                            />
                        </>
                    )}

                    <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                        <Button variant="outlined" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained">
                            Guardar
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    )
}
