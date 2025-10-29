import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PUT(req) {
    try {
        // Obtener los datos del cliente a actualizar
        const {
            id,              // ID del usuario en Auth y tabla cliente
            email,
            password,
            full_name,
            sucursal_id,
            document_type,
            document,
            phone,
            tarifa
        } = await req.json()

        if (!id) {
            return new Response(JSON.stringify({ error: 'Falta el ID del usuario' }), { status: 400 })
        }

        // 1️⃣ Obtener datos actuales del usuario Auth (para rollback si algo falla)
        const { data: currentAuthData, error: fetchAuthError } = await supabaseAdmin.auth.admin.getUserById(id)
        if (fetchAuthError) {
            console.error('Error obteniendo usuario Auth:', fetchAuthError.message)
            return new Response(JSON.stringify({ error: fetchAuthError.message }), { status: 400 })
        }

        const originalEmail = currentAuthData.user.email

        // 2️⃣ Actualizar usuario en Auth (si cambian email o password)
        const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
            email: email || originalEmail,
            password: password || undefined, // si no se pasa, no se actualiza
        })

        if (authUpdateError) {
            console.error('Error actualizando Auth:', authUpdateError.message)
            return new Response(JSON.stringify({ error: authUpdateError.message }), { status: 400 })
        }

        // 3️⃣ Actualizar en la tabla cliente
        const { error: updateError } = await supabaseAdmin
            .from('cliente')
            .update({
                email,
                full_name,
                sucursal_id,
                document_type,
                document,
                phone,
                tarifa,
            })
            .eq('id', id)

        if (updateError) {
            console.error('Error actualizando cliente:', updateError.message)

            // 4️⃣ Rollback manual — restaurar email original en Auth
            await supabaseAdmin.auth.admin.updateUserById(id, { email: originalEmail })

            return new Response(JSON.stringify({ error: updateError.message }), { status: 500 })
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 })
    } catch (error) {
        console.error('Error general:', error)
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 })
    }
}
