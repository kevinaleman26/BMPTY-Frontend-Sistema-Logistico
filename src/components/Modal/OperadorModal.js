'use client'

import RoleDropdow from '@/components/Dropdown/RoleDropdow'
import SucursalDropdown from '@/components/Dropdown/SucursalDropdown'
import { useMutateOperador } from '@/hooks/useMutateOperador'
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    TextField
} from '@mui/material'
import { useFormik } from 'formik'

export default function OperadorModal({ open, onClose, operador }) {
    const { createOperador, updateOperador } = useMutateOperador()

    const formik = useFormik({
        initialValues: {
            full_name: operador?.full_name || '',
            email: operador?.email || '',
            role_id: operador?.role_id || '',
            sucursal_id: operador?.sucursal_id || '',
            password: '',
            confirmPassword: '',
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (operador?.id) {
                delete values.password
                delete values.confirmPassword
                await updateOperador.mutateAsync({ id: operador.id, ...values })
            } else {
                await createOperador.mutateAsync(values)
            }
            onClose()
        }
    })


    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{operador ? 'Editar Operador' : 'Crear Operador'}</DialogTitle>
            <DialogContent>
                <Box
                    component="form"
                    onSubmit={formik.handleSubmit}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        mt: 1,
                        py: 1
                    }}
                >
                    <SucursalDropdown
                        name="sucursal_id"
                        value={formik.values.sucursal_id}
                        onChange={formik.handleChange}
                    />

                    <RoleDropdow
                        value={formik.values.role_id}
                        onChange={(val) => formik.setFieldValue('role_id', val)}
                        filter={[4]}
                    />

                    <TextField
                        label="Nombre completo"
                        name="full_name"
                        value={formik.values.full_name}
                        onChange={formik.handleChange}
                        fullWidth
                        required
                    />

                    <TextField
                        label="Correo electrónico"
                        name="email"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        fullWidth
                        required
                    />

                    {
                        !operador?.id && (
                            <>
                                <TextField
                                    label="Contraseña"
                                    name="password"
                                    type="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    fullWidth
                                />

                                <TextField
                                    label="Confirmar Contraseña"
                                    name="confirmPassword"
                                    type="password"
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                    fullWidth
                                />
                            </>
                        )
                    }

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
