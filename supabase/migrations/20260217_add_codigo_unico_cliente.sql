-- ============================================================================
-- Migration: Add unique client codes (sucursal code + sequential number)
-- Date: 2026-02-17
-- Description: Implements unique client identification system
--              Format: SUC-0001 (e.g., PAN-0001, COL-0123)
-- ============================================================================

-- ======================
-- STEP 1: Add columns
-- ======================

-- Add codigo to sucursal table (3-4 letter code)
ALTER TABLE sucursal ADD COLUMN IF NOT EXISTS codigo VARCHAR(10) UNIQUE;

-- Add codigo fields to cliente table
ALTER TABLE cliente ADD COLUMN IF NOT EXISTS codigo VARCHAR(20) UNIQUE;
ALTER TABLE cliente ADD COLUMN IF NOT EXISTS codigo_secuencial INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN sucursal.codigo IS 'Unique branch code (3-4 letters, e.g., PAN, COL, DAV)';
COMMENT ON COLUMN cliente.codigo IS 'Unique client code: sucursal_codigo + sequential number (e.g., PAN-0001)';
COMMENT ON COLUMN cliente.codigo_secuencial IS 'Sequential number per branch (resets for each branch)';

-- ======================
-- STEP 2: Add constraints
-- ======================

-- Ensure codigo_secuencial is unique per sucursal
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_sucursal_secuencial'
  ) THEN
    ALTER TABLE cliente ADD CONSTRAINT unique_sucursal_secuencial
      UNIQUE (sucursal_id, codigo_secuencial);
  END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_cliente_codigo ON cliente(codigo);
CREATE INDEX IF NOT EXISTS idx_sucursal_codigo ON sucursal(codigo);

-- ======================
-- STEP 3: Helper function to get next sequential number
-- ======================

CREATE OR REPLACE FUNCTION obtener_siguiente_codigo_cliente(p_sucursal_id BIGINT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_siguiente INTEGER;
BEGIN
  -- Get the next sequential number for this branch
  SELECT COALESCE(MAX(codigo_secuencial), 0) + 1
  INTO v_siguiente
  FROM cliente
  WHERE sucursal_id = p_sucursal_id;

  RETURN v_siguiente;
END;
$$;

COMMENT ON FUNCTION obtener_siguiente_codigo_cliente IS 'Returns the next sequential client number for a given branch';

-- ======================
-- STEP 4: Function to generate full client code
-- ======================

CREATE OR REPLACE FUNCTION generar_codigo_cliente()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_codigo_sucursal VARCHAR(10);
  v_siguiente INTEGER;
BEGIN
  -- Only generate if codigo is not already set
  IF NEW.codigo IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Get sucursal code
  SELECT codigo INTO v_codigo_sucursal
  FROM sucursal
  WHERE id = NEW.sucursal_id;

  -- Validate that sucursal has a code
  IF v_codigo_sucursal IS NULL OR v_codigo_sucursal = '' THEN
    RAISE EXCEPTION 'La sucursal % no tiene un código asignado. Asigne un código primero.', NEW.sucursal_id;
  END IF;

  -- Get next sequential number
  v_siguiente := obtener_siguiente_codigo_cliente(NEW.sucursal_id);

  -- Assign values
  NEW.codigo_secuencial := v_siguiente;
  NEW.codigo := v_codigo_sucursal || '-' || LPAD(v_siguiente::TEXT, 4, '0');

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION generar_codigo_cliente IS 'Automatically generates unique client code on INSERT';

-- ======================
-- STEP 5: Create trigger
-- ======================

DROP TRIGGER IF EXISTS trg_generar_codigo_cliente ON cliente;

CREATE TRIGGER trg_generar_codigo_cliente
  BEFORE INSERT ON cliente
  FOR EACH ROW
  EXECUTE FUNCTION generar_codigo_cliente();

COMMENT ON TRIGGER trg_generar_codigo_cliente ON cliente IS 'Generates unique client code before insert';

-- ======================
-- STEP 6: Grant permissions
-- ======================

-- Allow authenticated users to call the function
GRANT EXECUTE ON FUNCTION obtener_siguiente_codigo_cliente TO authenticated;
GRANT EXECUTE ON FUNCTION generar_codigo_cliente TO authenticated;

-- ======================
-- STEP 7: Backfill existing clients (OPTIONAL - Run manually if needed)
-- ======================

-- This script assigns codes to existing clients
-- Run this AFTER assigning codes to sucursales

/*
DO $$
DECLARE
  cliente_row RECORD;
  v_codigo_sucursal VARCHAR(10);
  v_siguiente INTEGER;
  v_codigo_completo VARCHAR(20);
BEGIN
  RAISE NOTICE 'Starting backfill of existing clients...';

  -- Loop through all clients without codes, ordered by creation date
  FOR cliente_row IN
    SELECT id, sucursal_id, full_name, created_at
    FROM cliente
    WHERE codigo IS NULL
    ORDER BY sucursal_id, created_at
  LOOP
    -- Get sucursal code
    SELECT codigo INTO v_codigo_sucursal
    FROM sucursal
    WHERE id = cliente_row.sucursal_id;

    -- Skip if sucursal has no code
    IF v_codigo_sucursal IS NULL OR v_codigo_sucursal = '' THEN
      RAISE NOTICE 'Skipping client % - sucursal % has no code', cliente_row.id, cliente_row.sucursal_id;
      CONTINUE;
    END IF;

    -- Get next sequential number for this sucursal
    SELECT COALESCE(MAX(codigo_secuencial), 0) + 1
    INTO v_siguiente
    FROM cliente
    WHERE sucursal_id = cliente_row.sucursal_id
      AND codigo IS NOT NULL;

    -- Generate full code
    v_codigo_completo := v_codigo_sucursal || '-' || LPAD(v_siguiente::TEXT, 4, '0');

    -- Update client
    UPDATE cliente
    SET codigo_secuencial = v_siguiente,
        codigo = v_codigo_completo
    WHERE id = cliente_row.id;

    RAISE NOTICE 'Assigned code % to client % (%)', v_codigo_completo, cliente_row.id, cliente_row.full_name;
  END LOOP;

  RAISE NOTICE 'Backfill completed successfully!';
END $$;
*/

-- ======================
-- VERIFICATION QUERIES
-- ======================

-- Check sucursales without codes
-- SELECT id, name, codigo FROM sucursal WHERE codigo IS NULL;

-- Check clients with codes
-- SELECT c.codigo, c.full_name, s.codigo as sucursal_codigo, s.name as sucursal_name
-- FROM cliente c
-- JOIN sucursal s ON c.sucursal_id = s.id
-- ORDER BY s.codigo, c.codigo_secuencial;

-- Count clients per sucursal
-- SELECT s.codigo as sucursal, COUNT(c.id) as total_clientes
-- FROM sucursal s
-- LEFT JOIN cliente c ON s.id = c.sucursal_id
-- GROUP BY s.codigo
-- ORDER BY s.codigo;
