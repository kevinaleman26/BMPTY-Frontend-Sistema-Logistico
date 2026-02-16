-- Migration: Add Package Timeline & Audit System
-- Created: 2026-02-16
-- Purpose: Complete tracking of package lifecycle from entry to delivery

-- ============================================================================
-- STEP 1: Add audit fields to existing tables
-- ============================================================================

-- Add timestamps and operator tracking to proveedor_paquetes
ALTER TABLE proveedor_paquetes 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS sucursal_origen_id BIGINT REFERENCES sucursal(id),
ADD COLUMN IF NOT EXISTS operador_registro_id UUID REFERENCES operador(id);

COMMENT ON COLUMN proveedor_paquetes.created_at IS 'Timestamp when package was registered in the system';
COMMENT ON COLUMN proveedor_paquetes.sucursal_origen_id IS 'Branch where package was first registered';
COMMENT ON COLUMN proveedor_paquetes.operador_registro_id IS 'Operator who registered the package';

-- Add operator tracking to transferencia_sucursal
ALTER TABLE transferencia_sucursal
ADD COLUMN IF NOT EXISTS operador_emisor_id UUID REFERENCES operador(id),
ADD COLUMN IF NOT EXISTS operador_receptor_id UUID REFERENCES operador(id),
ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ;

COMMENT ON COLUMN transferencia_sucursal.operador_emisor_id IS 'Operator who created/sent the transfer';
COMMENT ON COLUMN transferencia_sucursal.operador_receptor_id IS 'Operator who received the transfer';
COMMENT ON COLUMN transferencia_sucursal.received_at IS 'Timestamp when transfer was received';

-- Add operator tracking and delivery date to factura
ALTER TABLE factura
ADD COLUMN IF NOT EXISTS operador_factura_id UUID REFERENCES operador(id),
ADD COLUMN IF NOT EXISTS operador_entrega_id UUID REFERENCES operador(id),
ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMPTZ;

COMMENT ON COLUMN factura.operador_factura_id IS 'Operator who created the invoice';
COMMENT ON COLUMN factura.operador_entrega_id IS 'Operator who delivered the package to client';
COMMENT ON COLUMN factura.delivery_date IS 'Timestamp when package was delivered to client';

-- Add timestamp to solicitud_paquete
ALTER TABLE solicitud_paquete
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN solicitud_paquete.created_at IS 'Timestamp when package was added to transfer';

-- Add timestamp to factura_detalle
ALTER TABLE factura_detalle
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN factura_detalle.created_at IS 'Timestamp when package was added to invoice';

-- ============================================================================
-- STEP 2: Create paquete_evento table for centralized event tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS paquete_evento (
    id BIGSERIAL PRIMARY KEY,
    paquete_id TEXT NOT NULL,
    evento_tipo VARCHAR(50) NOT NULL,
    sucursal_id BIGINT REFERENCES sucursal(id),
    operador_id UUID,
    cliente_id UUID REFERENCES cliente(id),
    transferencia_id BIGINT REFERENCES transferencia_sucursal(id),
    factura_id BIGINT REFERENCES factura(id),
    detalles JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE paquete_evento IS 'Centralized audit log for all package lifecycle events';
COMMENT ON COLUMN paquete_evento.evento_tipo IS 'Event type: INGRESO, TRANSFERENCIA_ENVIADA, TRANSFERENCIA_RECIBIDA, FACTURADO, ENTREGADO, TRANSFERENCIA_CANCELADA';
COMMENT ON COLUMN paquete_evento.detalles IS 'Additional event details in JSON format';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_paquete_evento_paquete ON paquete_evento(paquete_id);
CREATE INDEX IF NOT EXISTS idx_paquete_evento_fecha ON paquete_evento(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_paquete_evento_tipo ON paquete_evento(evento_tipo);
CREATE INDEX IF NOT EXISTS idx_paquete_evento_sucursal ON paquete_evento(sucursal_id);

-- ============================================================================
-- STEP 3: Create function to register package events
-- ============================================================================

CREATE OR REPLACE FUNCTION registrar_evento_paquete(
    p_paquete_id TEXT,
    p_evento_tipo VARCHAR(50),
    p_sucursal_id BIGINT DEFAULT NULL,
    p_operador_id UUID DEFAULT NULL,
    p_cliente_id UUID DEFAULT NULL,
    p_transferencia_id BIGINT DEFAULT NULL,
    p_factura_id BIGINT DEFAULT NULL,
    p_detalles JSONB DEFAULT '{}'
)
RETURNS BIGINT AS $$
DECLARE
    v_evento_id BIGINT;
BEGIN
    INSERT INTO paquete_evento (
        paquete_id,
        evento_tipo,
        sucursal_id,
        operador_id,
        cliente_id,
        transferencia_id,
        factura_id,
        detalles
    ) VALUES (
        p_paquete_id,
        p_evento_tipo,
        p_sucursal_id,
        p_operador_id,
        p_cliente_id,
        p_transferencia_id,
        p_factura_id,
        p_detalles
    )
    RETURNING id INTO v_evento_id;

    RETURN v_evento_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION registrar_evento_paquete IS 'Registers a package lifecycle event in the audit log';

-- ============================================================================
-- STEP 4: Create triggers to auto-register events
-- ============================================================================

-- Trigger: Package registered (proveedor_paquetes INSERT)
CREATE OR REPLACE FUNCTION trigger_paquete_ingreso()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM registrar_evento_paquete(
        NEW.codigo,
        'INGRESO',
        NEW.sucursal_origen_id,
        NEW.operador_registro_id,
        NULL,
        NULL,
        NULL,
        jsonb_build_object(
            'tipo', NEW.tipo,
            'peso', NEW.peso,
            'precio', NEW.precio
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_paquete_ingreso ON proveedor_paquetes;
CREATE TRIGGER trg_paquete_ingreso
    AFTER INSERT ON proveedor_paquetes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_paquete_ingreso();

-- Trigger: Transfer created (solicitud_paquete INSERT)
CREATE OR REPLACE FUNCTION trigger_transferencia_enviada()
RETURNS TRIGGER AS $$
DECLARE
    v_transferencia RECORD;
BEGIN
    SELECT 
        emisor_sucursal_id,
        receptor_sucursal_id,
        operador_emisor_id
    INTO v_transferencia
    FROM transferencia_sucursal
    WHERE id = NEW.transferencia_id;

    PERFORM registrar_evento_paquete(
        NEW.paquete_id,
        'TRANSFERENCIA_ENVIADA',
        v_transferencia.emisor_sucursal_id,
        v_transferencia.operador_emisor_id,
        NULL,
        NEW.transferencia_id,
        NULL,
        jsonb_build_object(
            'sucursal_destino_id', v_transferencia.receptor_sucursal_id
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_transferencia_enviada ON solicitud_paquete;
CREATE TRIGGER trg_transferencia_enviada
    AFTER INSERT ON solicitud_paquete
    FOR EACH ROW
    EXECUTE FUNCTION trigger_transferencia_enviada();

-- Trigger: Transfer received (transferencia_sucursal UPDATE delivery_status)
CREATE OR REPLACE FUNCTION trigger_transferencia_recibida()
RETURNS TRIGGER AS $$
DECLARE
    v_paquete RECORD;
BEGIN
    -- Only fire when delivery_status changes from false to true
    IF NEW.delivery_status = true AND OLD.delivery_status = false THEN
        -- Register event for all packages in the transfer
        FOR v_paquete IN 
            SELECT paquete_id 
            FROM solicitud_paquete 
            WHERE transferencia_id = NEW.id
        LOOP
            PERFORM registrar_evento_paquete(
                v_paquete.paquete_id,
                'TRANSFERENCIA_RECIBIDA',
                NEW.receptor_sucursal_id,
                NEW.operador_receptor_id,
                NULL,
                NEW.id,
                NULL,
                jsonb_build_object(
                    'sucursal_origen_id', NEW.emisor_sucursal_id,
                    'delivery_date', NEW.delivery_date
                )
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_transferencia_recibida ON transferencia_sucursal;
CREATE TRIGGER trg_transferencia_recibida
    AFTER UPDATE OF delivery_status ON transferencia_sucursal
    FOR EACH ROW
    EXECUTE FUNCTION trigger_transferencia_recibida();

-- Trigger: Package invoiced (factura_detalle INSERT)
CREATE OR REPLACE FUNCTION trigger_paquete_facturado()
RETURNS TRIGGER AS $$
DECLARE
    v_factura RECORD;
BEGIN
    SELECT 
        cliente_id,
        sucursal_id,
        operador_factura_id
    INTO v_factura
    FROM factura
    WHERE id = NEW.factura_id;

    PERFORM registrar_evento_paquete(
        NEW.paquete_id,
        'FACTURADO',
        v_factura.sucursal_id,
        v_factura.operador_factura_id,
        v_factura.cliente_id,
        NULL,
        NEW.factura_id,
        jsonb_build_object(
            'factura_id', NEW.factura_id
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_paquete_facturado ON factura_detalle;
CREATE TRIGGER trg_paquete_facturado
    AFTER INSERT ON factura_detalle
    FOR EACH ROW
    EXECUTE FUNCTION trigger_paquete_facturado();

-- Trigger: Package delivered to client (factura UPDATE delivery_status)
CREATE OR REPLACE FUNCTION trigger_paquete_entregado()
RETURNS TRIGGER AS $$
DECLARE
    v_paquete RECORD;
BEGIN
    -- Only fire when delivery_status changes from false to true
    IF NEW.delivery_status = true AND OLD.delivery_status = false THEN
        -- Register event for all packages in the invoice
        FOR v_paquete IN 
            SELECT paquete_id 
            FROM factura_detalle 
            WHERE factura_id = NEW.id
        LOOP
            PERFORM registrar_evento_paquete(
                v_paquete.paquete_id,
                'ENTREGADO',
                NEW.sucursal_id,
                NEW.operador_entrega_id,
                NEW.cliente_id,
                NULL,
                NEW.id,
                jsonb_build_object(
                    'delivery_date', NEW.delivery_date
                )
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_paquete_entregado ON factura;
CREATE TRIGGER trg_paquete_entregado
    AFTER UPDATE OF delivery_status ON factura
    FOR EACH ROW
    EXECUTE FUNCTION trigger_paquete_entregado();

-- ============================================================================
-- STEP 5: Create RPC function to get package timeline
-- ============================================================================

CREATE OR REPLACE FUNCTION obtener_cronologia_paquete(p_paquete_id TEXT)
RETURNS TABLE (
    id BIGINT,
    evento_tipo VARCHAR(50),
    sucursal_id BIGINT,
    sucursal_name VARCHAR,
    operador_id UUID,
    operador_name VARCHAR,
    cliente_id UUID,
    cliente_name VARCHAR,
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

-- ============================================================================
-- STEP 6: Grant permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION registrar_evento_paquete TO authenticated;
GRANT EXECUTE ON FUNCTION obtener_cronologia_paquete TO authenticated;
GRANT SELECT ON paquete_evento TO authenticated;

-- ============================================================================
-- STEP 7: Backfill historical data (estimated)
-- ============================================================================

-- This will create estimated events for existing packages
-- Note: Timestamps will be approximated based on available data

-- Insert INGRESO events for existing packages (using created_at from related records)
INSERT INTO paquete_evento (paquete_id, evento_tipo, created_at)
SELECT DISTINCT 
    pp.codigo,
    'INGRESO',
    COALESCE(
        (SELECT MIN(ts.created_at) FROM solicitud_paquete sp 
         JOIN transferencia_sucursal ts ON ts.id = sp.transferencia_id 
         WHERE sp.paquete_id = pp.codigo),
        (SELECT MIN(f.created_at) FROM factura_detalle fd 
         JOIN factura f ON f.id = fd.factura_id 
         WHERE fd.paquete_id = pp.codigo),
        NOW()
    )
FROM proveedor_paquetes pp
WHERE NOT EXISTS (
    SELECT 1 FROM paquete_evento pe 
    WHERE pe.paquete_id = pp.codigo AND pe.evento_tipo = 'INGRESO'
);

-- ============================================================================
-- Migration completed successfully
-- ============================================================================
