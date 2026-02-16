-- ============================================================================
-- Script de Verificación de Migración de Cronología
-- Ejecuta estas queries en el SQL Editor de Supabase
-- ============================================================================

-- 1. VERIFICAR TABLA PAQUETE_EVENTO
-- Debe retornar una tabla con el conteo de eventos
SELECT 
    'paquete_evento' as tabla,
    COUNT(*) as total_eventos
FROM paquete_evento;

-- ============================================================================

-- 2. VERIFICAR COLUMNAS AGREGADAS A PROVEEDOR_PAQUETES
-- Debe retornar 3 filas con los nombres de las columnas nuevas
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'proveedor_paquetes' 
AND column_name IN ('created_at', 'sucursal_origen_id', 'operador_registro_id')
ORDER BY column_name;

-- ============================================================================

-- 3. VERIFICAR COLUMNAS AGREGADAS A TRANSFERENCIA_SUCURSAL
-- Debe retornar 3 filas
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'transferencia_sucursal' 
AND column_name IN ('operador_emisor_id', 'operador_receptor_id', 'received_at')
ORDER BY column_name;

-- ============================================================================

-- 4. VERIFICAR COLUMNAS AGREGADAS A FACTURA
-- Debe retornar 3 filas
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'factura' 
AND column_name IN ('operador_factura_id', 'operador_entrega_id', 'delivery_date')
ORDER BY column_name;

-- ============================================================================

-- 5. VERIFICAR COLUMNAS AGREGADAS A SOLICITUD_PAQUETE
-- Debe retornar 1 fila
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'solicitud_paquete' 
AND column_name = 'created_at';

-- ============================================================================

-- 6. VERIFICAR COLUMNAS AGREGADAS A FACTURA_DETALLE
-- Debe retornar 1 fila
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'factura_detalle' 
AND column_name = 'created_at';

-- ============================================================================

-- 7. VERIFICAR TRIGGERS CREADOS
-- Debe retornar 5 triggers
SELECT 
    trigger_name,
    event_object_table as tabla,
    action_timing as cuando,
    event_manipulation as evento
FROM information_schema.triggers 
WHERE trigger_name LIKE 'trg_paquete%'
   OR trigger_name LIKE 'trg_transferencia%'
ORDER BY trigger_name;

-- ============================================================================

-- 8. VERIFICAR FUNCIÓN RPC obtener_cronologia_paquete
-- Debe retornar 1 fila con el nombre de la función
SELECT 
    routine_name,
    routine_type,
    data_type as tipo_retorno
FROM information_schema.routines
WHERE routine_name = 'obtener_cronologia_paquete';

-- ============================================================================

-- 9. VERIFICAR FUNCIÓN registrar_evento_paquete
-- Debe retornar 1 fila
SELECT 
    routine_name,
    routine_type,
    data_type as tipo_retorno
FROM information_schema.routines
WHERE routine_name = 'registrar_evento_paquete';

-- ============================================================================

-- 10. VERIFICAR ÍNDICES CREADOS EN PAQUETE_EVENTO
-- Debe retornar 4 índices
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'paquete_evento'
AND indexname LIKE 'idx_paquete_evento%'
ORDER BY indexname;

-- ============================================================================

-- 11. CONTAR EVENTOS HISTÓRICOS (BACKFILL)
-- Muestra cuántos eventos fueron creados automáticamente
SELECT 
    evento_tipo,
    COUNT(*) as cantidad
FROM paquete_evento
GROUP BY evento_tipo
ORDER BY cantidad DESC;

-- ============================================================================

-- 12. VERIFICAR PERMISOS EN LA TABLA
-- Debe mostrar los permisos de authenticated
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'paquete_evento'
AND grantee = 'authenticated';

-- ============================================================================

-- 13. VERIFICAR PERMISOS EN LAS FUNCIONES RPC
-- Debe mostrar permisos EXECUTE
SELECT 
    routine_name,
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_name IN ('obtener_cronologia_paquete', 'registrar_evento_paquete')
AND grantee = 'authenticated'
ORDER BY routine_name;

-- ============================================================================

-- 14. PRUEBA FUNCIONAL: Llamar a la función RPC
-- Debe ejecutarse sin errores (puede retornar vacío si el paquete no existe)
SELECT * FROM obtener_cronologia_paquete('TEST');

-- ============================================================================

-- RESUMEN DE VERIFICACIÓN
-- Esta query debe retornar todo OK
SELECT 
    'Tabla paquete_evento' as componente,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'paquete_evento') 
        THEN '✅ OK' ELSE '❌ FALTA' END as estado
UNION ALL
SELECT 
    'Triggers',
    CASE WHEN (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name LIKE 'trg_paquete%' OR trigger_name LIKE 'trg_transferencia%') = 5
        THEN '✅ OK (5)' ELSE '❌ FALTAN' END
UNION ALL
SELECT 
    'Función RPC obtener_cronologia_paquete',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'obtener_cronologia_paquete')
        THEN '✅ OK' ELSE '❌ FALTA' END
UNION ALL
SELECT 
    'Función registrar_evento_paquete',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'registrar_evento_paquete')
        THEN '✅ OK' ELSE '❌ FALTA' END
UNION ALL
SELECT 
    'Columnas en proveedor_paquetes',
    CASE WHEN (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'proveedor_paquetes' AND column_name IN ('created_at', 'sucursal_origen_id', 'operador_registro_id')) = 3
        THEN '✅ OK (3)' ELSE '❌ FALTAN' END
UNION ALL
SELECT 
    'Columnas en transferencia_sucursal',
    CASE WHEN (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'transferencia_sucursal' AND column_name IN ('operador_emisor_id', 'operador_receptor_id', 'received_at')) = 3
        THEN '✅ OK (3)' ELSE '❌ FALTAN' END
UNION ALL
SELECT 
    'Columnas en factura',
    CASE WHEN (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'factura' AND column_name IN ('operador_factura_id', 'operador_entrega_id', 'delivery_date')) = 3
        THEN '✅ OK (3)' ELSE '❌ FALTAN' END
UNION ALL
SELECT 
    'Índices en paquete_evento',
    CASE WHEN (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'paquete_evento' AND indexname LIKE 'idx_paquete_evento%') >= 4
        THEN '✅ OK (4+)' ELSE '❌ FALTAN' END;

-- ============================================================================
