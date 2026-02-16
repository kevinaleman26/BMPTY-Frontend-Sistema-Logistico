# Configurar Supabase CLI

## Paso 1: Login

```bash
npx supabase login
```

Esto abrirá tu navegador para autenticarte. Una vez autenticado, obtendrás un access token.

## Paso 2: Link del Proyecto

```bash
npx supabase link --project-ref iidnphzcihsdjplgcnqo
```

Te pedirá la contraseña de tu base de datos (la que configuraste cuando creaste el proyecto).

## Paso 3: Aplicar Migraciones

```bash
npx supabase db push
```

Esto aplicará todas las migraciones pendientes.

---

## Alternativa: Variable de Entorno

Si prefieres no hacer login interactivo, puedes usar un access token:

1. Ve a https://supabase.com/dashboard/account/tokens
2. Crea un nuevo token
3. Agrégalo a tu `.env.local`:

```bash
SUPABASE_ACCESS_TOKEN=tu_token_aqui
```

4. Luego ejecuta:

```bash
npx supabase link --project-ref iidnphzcihsdjplgcnqo
npx supabase db push
```
