-- Migration: Add total field and RPC functions for transferencias
-- Created: 2026-02-05
-- Purpose: Add total amount field to preserve historical values and create RPC functions for debt calculation

-- ============================================================================
-- STEP 1: Add total column to transferencia_sucursal
-- ============================================================================

-- Add total column with default 0
ALTER TABLE transferencia_sucursal
ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Add comment to document the column
COMMENT ON COLUMN transferencia_sucursal.total IS 'Total amount of the transfer (sum of all package prices). Preserved for historical purposes.';

-- ============================================================================
-- STEP 2: Create function to calculate total for a single transfer
-- ============================================================================

CREATE OR REPLACE FUNCTION calcular_total_transferencia(
    p_paquete_codigos TEXT[]
)
RETURNS DECIMAL AS $$
DECLARE
    v_total DECIMAL;
BEGIN
    -- Sum prices of all packages in the array
    SELECT COALESCE(SUM(precio), 0)
    INTO v_total
    FROM proveedor_paquetes
    WHERE codigo = ANY(p_paquete_codigos);

    RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION calcular_total_transferencia(TEXT[]) IS 'Calculates the total amount for a transfer based on package codes.';

-- ============================================================================
-- STEP 3: Create RPC function to get debts by sucursal
-- ============================================================================

CREATE OR REPLACE FUNCTION obtener_deudas_sucursales()
RETURNS TABLE (
    sucursal_id BIGINT,
    sucursal_name VARCHAR,
    sucursal_ruc TEXT,
    transferencias_pendientes BIGINT,
    paquetes_totales BIGINT,
    total_adeudado DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ts.receptor_sucursal_id AS sucursal_id,
        s.name AS sucursal_name,
        s.ruc AS sucursal_ruc,
        COUNT(DISTINCT ts.id)::BIGINT AS transferencias_pendientes,
        COUNT(sp.paquete_id)::BIGINT AS paquetes_totales,
        COALESCE(SUM(ts.total), 0)::DECIMAL AS total_adeudado
    FROM transferencia_sucursal ts
    INNER JOIN sucursal s ON s.id = ts.receptor_sucursal_id
    LEFT JOIN solicitud_paquete sp ON sp.transferencia_id = ts.id
    WHERE ts.payment_status = false
    GROUP BY ts.receptor_sucursal_id, s.name, s.ruc
    HAVING SUM(ts.total) > 0
    ORDER BY total_adeudado DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION obtener_deudas_sucursales() IS 'Returns pending debts grouped by receptor sucursal with totals preserved from creation time.';

-- ============================================================================
-- STEP 4: Create RPC function to get detailed transfers for a sucursal
-- ============================================================================

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
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ts.id AS transferencia_id,
        ts.emisor_sucursal_id,
        se.name AS emisor_sucursal_name,
        ts.receptor_sucursal_id,
        sr.name AS receptor_sucursal_name,
        ts.metodo_pago_id,
        mp.name AS metodo_pago_name,
        ts.total,
        COUNT(sp.paquete_id)::BIGINT AS cantidad_paquetes,
        ts.delivery_status,
        ts.payment_status,
        ts.created_at
    FROM transferencia_sucursal ts
    INNER JOIN sucursal se ON se.id = ts.emisor_sucursal_id
    INNER JOIN sucursal sr ON sr.id = ts.receptor_sucursal_id
    LEFT JOIN metodo_pago mp ON mp.id = ts.metodo_pago_id
    LEFT JOIN solicitud_paquete sp ON sp.transferencia_id = ts.id
    WHERE
        ts.payment_status = false
        AND (p_receptor_sucursal_id IS NULL OR ts.receptor_sucursal_id = p_receptor_sucursal_id)
    GROUP BY
        ts.id, ts.emisor_sucursal_id, se.name, ts.receptor_sucursal_id,
        sr.name, ts.metodo_pago_id, mp.name, ts.total,
        ts.delivery_status, ts.payment_status, ts.created_at
    ORDER BY ts.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION obtener_transferencias_pendientes(INTEGER) IS 'Returns detailed pending transfers, optionally filtered by receptor sucursal.';

-- ============================================================================
-- STEP 5: Backfill existing records with calculated totals
-- ============================================================================

-- Update existing transfers that don't have a total calculated
UPDATE transferencia_sucursal ts
SET total = (
    SELECT COALESCE(SUM(pp.precio), 0)
    FROM solicitud_paquete sp
    INNER JOIN proveedor_paquetes pp ON pp.codigo = sp.paquete_id
    WHERE sp.transferencia_id = ts.id
)
WHERE total = 0;

-- ============================================================================
-- STEP 6: Create trigger to prevent manual total changes (optional)
-- ============================================================================

-- Create function to validate total changes
CREATE OR REPLACE FUNCTION validate_transferencia_total()
RETURNS TRIGGER AS $$
BEGIN
    -- If trying to update total manually (not from application), reject
    IF OLD.total IS DISTINCT FROM NEW.total AND
       current_setting('app.allow_manual_total_update', true) != 'true' THEN
        RAISE EXCEPTION 'Cannot manually update total. Total is calculated automatically.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_validate_transferencia_total ON transferencia_sucursal;
CREATE TRIGGER trg_validate_transferencia_total
    BEFORE UPDATE OF total ON transferencia_sucursal
    FOR EACH ROW
    EXECUTE FUNCTION validate_transferencia_total();

-- Add comment
COMMENT ON TRIGGER trg_validate_transferencia_total ON transferencia_sucursal IS 'Prevents manual updates to total field. Total should only be set during creation.';

-- ============================================================================
-- STEP 7: Grant necessary permissions
-- ============================================================================

-- Grant execute permissions on RPC functions to authenticated users
GRANT EXECUTE ON FUNCTION calcular_total_transferencia(TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION obtener_deudas_sucursales() TO authenticated;
GRANT EXECUTE ON FUNCTION obtener_transferencias_pendientes(BIGINT) TO authenticated;

-- ============================================================================
-- Migration completed successfully
-- ============================================================================

-- Verification query (optional - comment out in production)
-- SELECT 'Migration completed' AS status,
--        COUNT(*) AS transfers_with_total
-- FROM transferencia_sucursal
-- WHERE total > 0;
