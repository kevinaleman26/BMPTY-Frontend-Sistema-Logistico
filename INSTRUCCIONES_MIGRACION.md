# Instrucciones para Aplicar la Migración de Cronología

## Paso 1: Aplicar la Migración en Supabase

### Opción A: Desde el Dashboard de Supabase (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido completo del archivo:
   ```
   supabase/migrations/20260216_add_package_timeline.sql
   ```
5. Haz clic en **Run** (ejecutar)
6. Verifica que la migración se ejecutó correctamente (debe mostrar "Success")

### Opción B: Desde Supabase CLI (Si tienes el proyecto linkeado)

```bash
# Desde la raíz del proyecto
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
```

---

## Paso 2: Verificar la Migración

Ejecuta esta query en el SQL Editor para verificar:

```sql
-- Verificar que la tabla existe
SELECT COUNT(*) as eventos FROM paquete_evento;

-- Verificar que los campos fueron agregados
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'proveedor_paquetes' 
AND column_name IN ('created_at', 'sucursal_origen_id', 'operador_registro_id');

-- Verificar que los triggers existen
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name LIKE 'trg_paquete%';
```

Deberías ver:
- Tabla `paquete_evento` creada
- Nuevas columnas en las tablas
- 5 triggers activos

---

## Paso 3: Probar la Funcionalidad

### 1. Crear una nueva transferencia:
- Ve al módulo de Transferencias
- Crea una nueva transferencia
- El sistema automáticamente registrará:
  - Evento `TRANSFERENCIA_ENVIADA` para cada paquete
  - `operador_emisor_id` con tu usuario actual

### 2. Marcar transferencia como recibida:
- Edita una transferencia
- Marca "Estado de Entrega" como "Entregado"
- El sistema automáticamente registrará:
  - Evento `TRANSFERENCIA_RECIBIDA`
  - `operador_receptor_id` con tu usuario actual
  - `received_at` con la fecha actual

### 3. Crear una factura:
- Ve al módulo de Facturación
- Crea una nueva factura
- El sistema automáticamente registrará:
  - Evento `FACTURADO` para cada paquete
  - `operador_factura_id` con tu usuario actual

### 4. Marcar factura como entregada:
- Edita una factura
- Marca "Estado de entrega" como activo
- El sistema automáticamente registrará:
  - Evento `ENTREGADO`
  - `operador_entrega_id` con tu usuario actual
  - `delivery_date` con la fecha actual

### 5. Ver la cronología:
- Ve al módulo de Clientes
- Haz clic en "Ver detalle" (ícono de ojo) de cualquier cliente
- En el accordion "Paquetes" → Tabla de paquetes
- Haz clic en el ícono de timeline (📈) junto al código del paquete
- Verás el modal con la cronología completa

---

## Paso 4: Datos Históricos

La migración incluye un backfill que crea eventos estimados para paquetes existentes:
- Todos los paquetes existentes recibirán un evento `INGRESO`
- Las fechas se estiman basándose en la primera transferencia o factura relacionada
- Los operadores no se pueden recuperar (no había tracking antes)

Si quieres limpiar estos eventos estimados y empezar desde cero:

```sql
-- CUIDADO: Esto eliminará TODOS los eventos
TRUNCATE TABLE paquete_evento RESTART IDENTITY CASCADE;
```

---

## Troubleshooting

### Error: "relation paquete_evento already exists"
La tabla ya existe. Puedes:
1. Eliminar la tabla manualmente:
   ```sql
   DROP TABLE IF EXISTS paquete_evento CASCADE;
   ```
2. Re-ejecutar la migración

### Error: "column already exists"
Algunas columnas ya fueron agregadas. Puedes:
1. Comentar las líneas de `ALTER TABLE ADD COLUMN` que ya existen
2. Ejecutar solo las partes que faltan

### No se registran eventos automáticamente
Verifica que los triggers estén activos:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name LIKE 'trg_%';
```

Si no aparecen, re-ejecuta la sección de triggers de la migración.

---

## Rollback (Si necesitas revertir)

```sql
-- 1. Eliminar triggers
DROP TRIGGER IF EXISTS trg_paquete_ingreso ON proveedor_paquetes;
DROP TRIGGER IF EXISTS trg_transferencia_enviada ON solicitud_paquete;
DROP TRIGGER IF EXISTS trg_transferencia_recibida ON transferencia_sucursal;
DROP TRIGGER IF EXISTS trg_paquete_facturado ON factura_detalle;
DROP TRIGGER IF EXISTS trg_paquete_entregado ON factura;

-- 2. Eliminar funciones
DROP FUNCTION IF EXISTS trigger_paquete_ingreso CASCADE;
DROP FUNCTION IF EXISTS trigger_transferencia_enviada CASCADE;
DROP FUNCTION IF EXISTS trigger_transferencia_recibida CASCADE;
DROP FUNCTION IF EXISTS trigger_paquete_facturado CASCADE;
DROP FUNCTION IF EXISTS trigger_paquete_entregado CASCADE;
DROP FUNCTION IF EXISTS registrar_evento_paquete CASCADE;
DROP FUNCTION IF EXISTS obtener_cronologia_paquete CASCADE;

-- 3. Eliminar tabla de eventos
DROP TABLE IF EXISTS paquete_evento CASCADE;

-- 4. Eliminar columnas agregadas (opcional)
ALTER TABLE proveedor_paquetes DROP COLUMN IF EXISTS created_at;
ALTER TABLE proveedor_paquetes DROP COLUMN IF EXISTS sucursal_origen_id;
ALTER TABLE proveedor_paquetes DROP COLUMN IF EXISTS operador_registro_id;
-- ... (resto de columnas)
```

---

## Soporte

Si encuentras algún problema:
1. Revisa los logs de Supabase en Dashboard → Logs
2. Verifica que tu rol tenga permisos EXECUTE en las funciones RPC
3. Asegúrate de que la sesión actual tenga `session.id` disponible
