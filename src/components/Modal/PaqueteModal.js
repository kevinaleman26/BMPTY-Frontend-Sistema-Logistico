'use client'

import { useMutatePaquete } from '@/hooks/useMutatePaquete'
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    TextField
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'

export default function PaqueteModal({ open, onClose, paquete }) {
    const { createPaquete, updatePaquete } = useMutatePaquete()

    const formik = useFormik({
        initialValues: {
            factura_id: paquete?.factura_id || '',
            tipo: paquete?.tipo || '',
            codigo: paquete?.codigo || '',
            largo: paquete?.largo || '',
            alto: paquete?.alto || '',
            ancho: paquete?.ancho || '',
            peso: paquete?.peso || '',
            volumen: paquete?.volumen || '',
            precio: paquete?.precio || ''
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            factura_id: Yup.string().required('Factura requerida'),
            tipo: Yup.string().required('Tipo requerido'),
            codigo: Yup.string().required('Código requerido'),
            largo: Yup.number().required('Largo requerido'),
            alto: Yup.number().required('Alto requerido'),
            ancho: Yup.number().required('Ancho requerido'),
            peso: Yup.number().required('Peso requerido'),
            volumen: Yup.number().required('Volumen requerido'),
            precio: Yup.number().required('Precio requerido')
        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                if (paquete) {
                    await updatePaquete.mutateAsync({ id: paquete.id, ...values })
                } else {
                    await createPaquete.mutateAsync(values)
                }
                onClose()
                resetForm()
            } catch (err) {
                console.error('Error al guardar paquete:', err)
            }
        }
    })

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{paquete ? 'Editar Paquete' : 'Crear Paquete'}</DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Factura ID" name="factura_id" value={formik.values.factura_id} onChange={formik.handleChange} fullWidth />
                    <TextField label="Tipo" name="tipo" value={formik.values.tipo} onChange={formik.handleChange} fullWidth />
                    <TextField label="Código" name="codigo" value={formik.values.codigo} onChange={formik.handleChange} fullWidth />
                    <TextField label="Largo" name="largo" type="number" value={formik.values.largo} onChange={formik.handleChange} fullWidth />
                    <TextField label="Alto" name="alto" type="number" value={formik.values.alto} onChange={formik.handleChange} fullWidth />
                    <TextField label="Ancho" name="ancho" type="number" value={formik.values.ancho} onChange={formik.handleChange} fullWidth />
                    <TextField label="Peso" name="peso" type="number" value={formik.values.peso} onChange={formik.handleChange} fullWidth />
                    <TextField label="Volumen" name="volumen" type="number" value={formik.values.volumen} onChange={formik.handleChange} fullWidth />
                    <TextField label="Precio" name="precio" type="number" value={formik.values.precio} onChange={formik.handleChange} fullWidth />

                    <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                        <Button onClick={onClose}>Cancelar</Button>
                        <Button type="submit" variant="contained">Guardar</Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    )
}
