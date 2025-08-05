import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req) {
    
    const { email, full_name, role_id, sucursal_id, password } = await req.json()

    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    })

    const userId = authData.user.id

    // 2. Insertar en tabla operador
    const { error: insertError } = await supabaseAdmin.from('operador').insert({
        email,
        full_name,
        role_id,
        sucursal_id,
        creado_en: new Date(),
        id: userId
    })

    if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
}
