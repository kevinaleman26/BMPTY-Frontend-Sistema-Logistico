-- ============================================================================
-- Migration: Update client code format to BM+sucursal_id+sequential
-- Date: 2026-02-20
-- Description: Changes client code format from SUC-0001 (e.g., PAN-0001)
--              to BM+sucursal_id+3-digit sequential (e.g., BM1001, BM2045)
--              Also removes sucursal.codigo column which is no longer needed.
-- ============================================================================

-- ======================
-- STEP 1: Update generar_codigo_cliente() function
-- ======================

CREATE OR REPLACE FUNCTION generar_codigo_cliente()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_siguiente INTEGER;
BEGIN
  -- Only generate if codigo is not already set
  IF NEW.codigo IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Get next sequential number for this branch
  v_siguiente := obtener_siguiente_codigo_cliente(NEW.sucursal_id);

  -- Assign values using new format: BM + sucursal_id + 3-digit sequential
  NEW.codigo_secuencial := v_siguiente;
  NEW.codigo := 'BM' || NEW.sucursal_id::TEXT || LPAD(v_siguiente::TEXT, 3, '0');

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION generar_codigo_cliente IS 'Automatically generates unique client code on INSERT. Format: BM{sucursal_id}{3-digit-sequential}';

-- ======================
-- STEP 2: Backfill existing clients to new format
-- ======================

UPDATE cliente
SET codigo = 'BM' || sucursal_id::TEXT || LPAD(codigo_secuencial::TEXT, 3, '0')
WHERE codigo_secuencial IS NOT NULL;

-- ======================
-- STEP 3: Remove sucursal.codigo column (no longer needed)
-- ======================

DROP INDEX IF EXISTS idx_sucursal_codigo;
ALTER TABLE sucursal DROP COLUMN IF EXISTS codigo;

-- ======================
-- VERIFICATION QUERIES (run manually to check)
-- ======================

-- Check clients with new format codes
-- SELECT id, codigo, codigo_secuencial, sucursal_id FROM cliente ORDER BY sucursal_id, codigo_secuencial;

-- Verify no clients remain with old format
-- SELECT id, codigo FROM cliente WHERE codigo LIKE '%-%';
