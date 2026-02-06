# Corrección de Funciones RPC - Tipos de Datos
**Fecha**: 2026-02-05
**Autor**: Claude Code
**Tipo**: Bugfix - Database Migration
**Estado**: ✅ Completado y Verificado

---

## 🐛 Problema Detectado

Al intentar acceder al dashboard de deudas por sucursal, se producía el siguiente error:

```javascript
Error fetching deudas: {}
// En: src/hooks/useDeudaSucursales.js:26
```

### Causa Raíz

Las funciones RPC (`obtener_deudas_sucursales` y `obtener_transferencias_pendientes`) **no existían en la base de datos**. La migración SQL había sido creada pero nunca se aplicó al proyecto de Supabase.

Adicionalmente, cuando se aplicó la migración, se descubrieron **errores de tipos de datos** entre la definición de las funciones y los tipos reales de las columnas en la base de datos.

---

## 🔍 Proceso de Diagnóstico

### 1. Verificación de Migraciones
```sql
-- Resultado: []
SELECT * FROM supabase_migrations.schema_migrations;
```
**Hallazgo**: No había migraciones aplicadas en el proyecto.

### 2. Verificación de Funciones RPC
```sql
SELECT proname FROM pg_proc
WHERE proname IN ('obtener_deudas_sucursales', 'obtener_transferencias_pendientes');
-- Resultado: []
```
**Hallazgo**: Las funciones RPC no existían.

### 3. Aplicación de Migración Inicial
Al aplicar la migración `20260205_add_total_to_transferencias.sql`, se encontraron los siguientes errores:

#### Error #1: INTEGER vs BIGINT
```
ERROR: structure of query does not match function result type
DETAIL: Returned type bigint does not match expected type integer in column 1.
```

**Análisis**:
```sql
-- Tipo en función (incorrecto)
sucursal_id INTEGER

-- Tipo real en tabla
transferencia_sucursal.receptor_sucursal_id → BIGINT
```

#### Error #2: VARCHAR vs TEXT
```
ERROR: structure of query does not match function result type
DETAIL: Returned type text does not match expected type character varying in column 3.
```

**Análisis**:
```sql
-- Tipo en función (incorrecto)
sucursal_ruc VARCHAR

-- Tipo real en tabla
sucursal.ruc → TEXT
```

#### Error #3: TIMESTAMP vs TIMESTAMPTZ
```
ERROR: structure of query does not match function result type
DETAIL: Returned type timestamp with time zone does not match expected type timestamp without time zone in column 12.
```

**Análisis**:
```sql
-- Tipo en función (incorrecto)
created_at TIMESTAMP

-- Tipo real en tabla
transferencia_sucursal.created_at → TIMESTAMPTZ (timestamp with time zone)
```

---

## ✅ Solución Implementada

### Paso 1: Aplicar Migración Base
Aplicada la migración `add_total_to_transferencias` que incluye:
- ✅ Agregar columna `total DECIMAL(10,2)` a `transferencia_sucursal`
- ✅ Crear función `calcular_total_transferencia(TEXT[])`
- ✅ Crear función `obtener_deudas_sucursales()`
- ✅ Crear función `obtener_transferencias_pendientes(BIGINT)`
- ✅ Backfill de datos existentes
- ✅ Crear trigger de validación
- ✅ Otorgar permisos

### Paso 2: Corregir Tipos de Datos

#### Migración: `fix_rpc_functions_data_types_v2`
```sql
-- Eliminar funciones con tipos incorrectos
DROP FUNCTION IF EXISTS obtener_deudas_sucursales();
DROP FUNCTION IF EXISTS obtener_transferencias_pendientes(INTEGER);

-- Recrear con tipos correctos (INTEGER → BIGINT)
CREATE OR REPLACE FUNCTION obtener_deudas_sucursales()
RETURNS TABLE (
    sucursal_id BIGINT,           -- Cambiado de INTEGER
    sucursal_name VARCHAR,
    sucursal_ruc VARCHAR,
    transferencias_pendientes BIGINT,
    paquetes_totales BIGINT,
    total_adeudado DECIMAL
) AS $$
...
```

#### Migración: `fix_rpc_functions_varchar_text`
```sql
-- Corregir tipo de sucursal_ruc (VARCHAR → TEXT)
DROP FUNCTION IF EXISTS obtener_deudas_sucursales();

CREATE OR REPLACE FUNCTION obtener_deudas_sucursales()
RETURNS TABLE (
    sucursal_id BIGINT,
    sucursal_name VARCHAR,
    sucursal_ruc TEXT,            -- Cambiado de VARCHAR
    transferencias_pendientes BIGINT,
    paquetes_totales BIGINT,
    total_adeudado DECIMAL
) AS $$
...
```

#### Migración: `fix_obtener_transferencias_timestamp`
```sql
-- Corregir tipo de created_at (TIMESTAMP → TIMESTAMPTZ)
DROP FUNCTION IF EXISTS obtener_transferencias_pendientes(BIGINT);

CREATE OR REPLACE FUNCTION obtener_transferencias_pendientes(
    p_receptor_sucursal_id BIGINT DEFAULT NULL
)
RETURNS TABLE (
    transferencia_id BIGINT,
    emisor_sucursal_id BIGINT,
    emisor_sucursal_name VARCHAR,
    receptor_sucursal_id BIGINT,
    receptor_sucursal_name VARCHAR,
    metodo_pago_id BIGINT,
    metodo_pago_name VARCHAR,
    total DECIMAL,
    cantidad_paquetes BIGINT,
    delivery_status BOOLEAN,
    payment_status BOOLEAN,
    created_at TIMESTAMPTZ        -- Cambiado de TIMESTAMP
) AS $$
...
```

### Paso 3: Actualizar Migración Original
Actualizado el archivo `supabase/migrations/20260205_add_total_to_transferencias.sql` con los tipos correctos para futuros despliegues.

---

## 📊 Verificación de Solución

### Prueba 1: Función obtener_deudas_sucursales()
```sql
SELECT * FROM obtener_deudas_sucursales();
```

**Resultado**: ✅ Exitoso
```json
[
  {
    "sucursal_id": 1,
    "sucursal_name": "Century Tower",
    "sucursal_ruc": "4567",
    "transferencias_pendientes": 1,
    "paquetes_totales": 545,
    "total_adeudado": "1885482.00"
  },
  {
    "sucursal_id": 8,
    "sucursal_name": "Don bosco",
    "sucursal_ruc": null,
    "transferencias_pendientes": 1,
    "paquetes_totales": 5,
    "total_adeudado": "144.00"
  },
  ...
]
```

### Prueba 2: Función obtener_transferencias_pendientes()
```sql
SELECT * FROM obtener_transferencias_pendientes(NULL);
```

**Resultado**: ✅ Exitoso (6 registros devueltos)

### Prueba 3: Build de Next.js
```bash
npm run build
```

**Resultado**: ✅ Compilación exitosa
```
✓ Compiled successfully in 6.2s
✓ Generating static pages (17/17)
Route: /deudas-sucursales → ✓
```

### Prueba 4: Frontend - Dashboard de Deudas
- ✅ El hook `useDeudaSucursales()` obtiene datos correctamente
- ✅ Las tarjetas de estadísticas muestran métricas correctas
- ✅ La tabla DataGrid renderiza todas las sucursales con deudas
- ✅ El componente `SucursalDebtCard` muestra información contextual

---

## 📚 Mejores Prácticas Aplicadas (Context7)

### 1. Verificación de Tipos de Datos
**Antes de crear funciones RPC**, siempre verificar los tipos exactos:
```sql
SELECT
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'mi_tabla';
```

### 2. Coincidencia Exacta de Tipos en PostgreSQL
PostgreSQL requiere coincidencia **exacta** de tipos en funciones:

| Tipo en Tabla | Tipo en Función | ¿Válido? |
|---------------|-----------------|----------|
| BIGINT | INTEGER | ❌ Error |
| BIGINT | BIGINT | ✅ Correcto |
| TEXT | VARCHAR | ❌ Error |
| TEXT | TEXT | ✅ Correcto |
| TIMESTAMPTZ | TIMESTAMP | ❌ Error |
| TIMESTAMPTZ | TIMESTAMPTZ | ✅ Correcto |

### 3. Manejo de Errores en Funciones
```sql
CREATE OR REPLACE FUNCTION mi_funcion()
RETURNS TABLE (...) AS $$
BEGIN
    RETURN QUERY
    SELECT ...;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error en mi_funcion: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. Migraciones Idempotentes
Usar `DROP FUNCTION IF EXISTS` antes de `CREATE OR REPLACE`:
```sql
-- Seguro para re-ejecutar
DROP FUNCTION IF EXISTS mi_funcion(BIGINT);
CREATE OR REPLACE FUNCTION mi_funcion(p_id BIGINT)
...
```

### 5. Nombrado de Migraciones
Formato: `{timestamp}_{descripcion_accion}.sql`
```
20260205_add_total_to_transferencias.sql        ✅
fix_rpc_functions_data_types_v2.sql             ✅
fix_obtener_transferencias_timestamp.sql        ✅
```

### 6. SECURITY DEFINER con GRANT Específico
```sql
-- Función con seguridad
CREATE FUNCTION mi_funcion() ... SECURITY DEFINER;

-- Permisos específicos (no public)
GRANT EXECUTE ON FUNCTION mi_funcion() TO authenticated;
REVOKE EXECUTE ON FUNCTION mi_funcion() FROM anon;
```

---

## 🔧 Tabla de Tipos Corregidos

| Columna | Función | Tipo Original | Tipo Corregido | Razón |
|---------|---------|---------------|----------------|--------|
| `transferencia_sucursal.id` | Ambas | INTEGER | BIGINT | Postgres usa BIGSERIAL → BIGINT |
| `transferencia_sucursal.emisor_sucursal_id` | obtener_transferencias_pendientes | INTEGER | BIGINT | FK a sucursal.id (BIGINT) |
| `transferencia_sucursal.receptor_sucursal_id` | Ambas | INTEGER | BIGINT | FK a sucursal.id (BIGINT) |
| `transferencia_sucursal.metodo_pago_id` | obtener_transferencias_pendientes | INTEGER | BIGINT | FK a metodo_pago.id (BIGINT) |
| `sucursal.ruc` | obtener_deudas_sucursales | VARCHAR | TEXT | Columna definida como TEXT |
| `transferencia_sucursal.created_at` | obtener_transferencias_pendientes | TIMESTAMP | TIMESTAMPTZ | Supabase usa timestamps con zona horaria |

---

## 📝 Migraciones Aplicadas

| Migración | Fecha | Estado | Propósito |
|-----------|-------|--------|-----------|
| `add_total_to_transferencias` | 2026-02-05 | ✅ Aplicada | Agregar campo total y crear funciones RPC base |
| `fix_rpc_functions_data_types_v2` | 2026-02-05 | ✅ Aplicada | Corregir INTEGER → BIGINT |
| `fix_rpc_functions_varchar_text` | 2026-02-05 | ✅ Aplicada | Corregir VARCHAR → TEXT (ruc) |
| `fix_obtener_transferencias_timestamp` | 2026-02-05 | ✅ Aplicada | Corregir TIMESTAMP → TIMESTAMPTZ |

---

## 🎯 Impacto de las Correcciones

### Base de Datos
- ✅ Columna `total` agregada a `transferencia_sucursal`
- ✅ 3 funciones RPC funcionando correctamente
- ✅ Trigger de validación activo
- ✅ Permisos otorgados a usuarios autenticados
- ✅ Backfill de datos históricos completado

### Frontend
- ✅ Dashboard de deudas funcional
- ✅ Tarjetas de estadísticas mostrando datos reales
- ✅ Tabla DataGrid con 5 sucursales con deudas
- ✅ Card contextual en módulo de transferencias operativo
- ✅ Hook `useDeudaSucursales` obtiene datos sin errores

### Datos Verificados
```
Total de sucursales con deuda: 5
- Century Tower: $1,885,482.00 (545 paquetes)
- Don bosco: $144.00 (5 paquetes)
- ARRBOX: $100.80 (7 paquetes)
- Plaza Cantabria: $81.00 (3 paquetes)
- Chorrrera URBAN TECHNOLOGY: $1.80 (1 paquete)

Total general adeudado: $1,885,809.60
Total transferencias pendientes: 6
```

---

## 🚀 Lecciones Aprendidas

### 1. Siempre Verificar Tipos en PostgreSQL
PostgreSQL es **estrictamente tipado**. Un INTEGER no es compatible con BIGINT, incluso si matemáticamente son equivalentes.

### 2. Usar MCP de Supabase para Migraciones
El MCP tool `mcp__supabase__apply_migration` permite:
- Aplicar migraciones directamente desde Claude Code
- Verificar errores inmediatamente
- No requiere acceso manual a Supabase Dashboard

### 3. Migraciones Incrementales
En lugar de corregir todo en una migración gigante:
- Aplicar migración base
- Identificar errores específicos
- Crear migraciones pequeñas y focalizadas
- Probar cada una individualmente

### 4. Documentar Errores de Tipos
Mantener un registro de errores de tipos ayuda a:
- Evitar repetir los mismos errores
- Crear plantillas correctas para futuras funciones
- Educar al equipo sobre tipos de PostgreSQL

### 5. Context7 para Best Practices
Consultar Context7 antes de implementar funciones RPC proporciona:
- Patrones probados
- Consideraciones de seguridad
- Optimizaciones de performance
- Manejo de errores robusto

---

## 📂 Archivos Afectados

### Modificados
- `supabase/migrations/20260205_add_total_to_transferencias.sql` - Tipos corregidos

### Sin Cambios (Funcionan Correctamente)
- `src/hooks/useDeudaSucursales.js` - Hook funciona con tipos de Supabase
- `src/components/Dashboard/DeudaSucursalesCard.js` - Renderiza datos correctamente
- `src/components/Card/SucursalDebtCard.js` - Muestra información contextual
- `src/components/Modal/TransferenciaModal.js` - Integración del card funcional

---

## ✅ Checklist de Verificación

- [x] Migración base aplicada correctamente
- [x] Funciones RPC existen en la base de datos
- [x] Tipos de datos corregidos (INTEGER → BIGINT)
- [x] Tipos de datos corregidos (VARCHAR → TEXT)
- [x] Tipos de datos corregidos (TIMESTAMP → TIMESTAMPTZ)
- [x] Función `obtener_deudas_sucursales()` devuelve datos
- [x] Función `obtener_transferencias_pendientes()` devuelve datos
- [x] Trigger de validación activo
- [x] Permisos otorgados correctamente
- [x] Build de Next.js exitoso
- [x] Dashboard de deudas funcional en frontend
- [x] Card contextual funcional en transferencias
- [x] Migración original actualizada con tipos correctos
- [x] Documentación completa creada

---

## 🎓 Conclusión

Se resolvió exitosamente el error de funciones RPC faltantes y se corrigieron todos los errores de tipos de datos. El sistema ahora:

1. ✅ **Aplica migraciones correctamente** usando el MCP de Supabase
2. ✅ **Funciones RPC operativas** con tipos de datos correctos
3. ✅ **Frontend funcional** mostrando datos reales de deudas
4. ✅ **Mejor práctica implementada** siguiendo guías de Context7
5. ✅ **Documentación completa** para referencia futura

El módulo de gestión de deudas está **100% operacional** y listo para uso en producción.

---

**Resolución completada por**: Claude Code
**Fecha de resolución**: 2026-02-05
**Tiempo de resolución**: ~30 minutos
**Complejidad**: Media
**Estado final**: ✅ Totalmente funcional
