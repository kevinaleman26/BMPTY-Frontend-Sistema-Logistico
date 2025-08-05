import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req) {

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
        id:auth_user_id,
        phone,
        tarifa
    })

    console.log(insertError)


    if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
}
