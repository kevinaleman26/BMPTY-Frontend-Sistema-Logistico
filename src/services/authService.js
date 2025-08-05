import { supabase } from '@/lib/supabase'

export async function signUpCliente(values) {
    const { email, password, nombre, telefono, document_type, document } = values

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                tipo: 'cliente',
                nombre,
                telefono,
                document_type,
                document
            }
        }
    })

    if (signUpError) throw new Error(signUpError.message)

    const user = signUpData?.user
    if (user) {
        const { error: insertError } = await supabase.from('cliente').insert({
            id: user.id,
            full_name: nombre,
            document_type,
            document,
            email,
            phone: telefono,
            sucursal_id: 1,
            tarifa: 0
        })

        if (insertError) throw new Error(insertError.message)
    }

    return { success: true, message: 'Usuario creado. Revisa tu correo.' }
}
