import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req) {

    try {
        // Obtener los datos del nuevo cliente
        const {
            email,
            password,
            full_name,
            sucursal_id,
            document_type,
            document,
            phone,
            tarifa
        } = await req.json()

        // Crear el usuario autenticable en Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        })

        const auth_user_id = authData.user.id

        // Insertar en la tabla cliente
        const { error: insertError } = await supabaseAdmin.from('cliente').insert({
            email,
            full_name,
            sucursal_id,
            document_type,
            document,
            id: auth_user_id,
            phone,
            tarifa
        })

        if (insertError) {
            console.error('Error insertando cliente, rollback:', insertError.message)

            // 3️⃣ Rollback manual — eliminar usuario Auth
            await supabaseAdmin.auth.admin.deleteUser(auth_user_id)

            return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 })
    } catch (error) {
        console.error('Error general:', error)
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 })
    }
}
