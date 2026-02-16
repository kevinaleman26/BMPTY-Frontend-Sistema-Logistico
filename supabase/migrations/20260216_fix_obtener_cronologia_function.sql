-- ============================================================================
-- Fix obtener_cronologia_paquete function return type
-- El error "structure of query does not match function result type" ocurre
-- cuando los tipos en RETURNS TABLE no coinciden exactamente con el SELECT
-- ============================================================================

DROP FUNCTION IF EXISTS obtener_cronologia_paquete(TEXT);

CREATE OR REPLACE FUNCTION obtener_cronologia_paquete(p_paquete_id TEXT)
RETURNS TABLE (
    id BIGINT,
    evento_tipo VARCHAR(50),
    sucursal_id BIGINT,
    sucursal_name TEXT,
    operador_id UUID,
    operador_name TEXT,
    cliente_id UUID,
    cliente_name TEXT,
    transferencia_id BIGINT,
    factura_id BIGINT,
    detalles JSONB,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pe.id,
        pe.evento_tipo,
        pe.sucursal_id,
        s.name AS sucursal_name,
        pe.operador_id,
        o.full_name AS operador_name,
        pe.cliente_id,
        c.full_name AS cliente_name,
        pe.transferencia_id,
        pe.factura_id,
        pe.detalles,
        pe.created_at
    FROM paquete_evento pe
    LEFT JOIN sucursal s ON s.id = pe.sucursal_id
    LEFT JOIN operador o ON o.id = pe.operador_id
    LEFT JOIN cliente c ON c.id = pe.cliente_id
    WHERE pe.paquete_id = p_paquete_id
    ORDER BY pe.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION obtener_cronologia_paquete IS 'Returns complete chronological timeline for a package';

GRANT EXECUTE ON FUNCTION obtener_cronologia_paquete TO authenticated;
