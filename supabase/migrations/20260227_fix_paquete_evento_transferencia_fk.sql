-- Fix FK constraint on paquete_evento.transferencia_id
-- Default RESTRICT was preventing deletion of transferencia_sucursal records
-- when paquete_evento rows still referenced them (e.g. after cancel)
-- ON DELETE SET NULL preserves event audit trail while allowing transfer deletion

ALTER TABLE paquete_evento
DROP CONSTRAINT IF EXISTS paquete_evento_transferencia_id_fkey,
ADD CONSTRAINT paquete_evento_transferencia_id_fkey
    FOREIGN KEY (transferencia_id)
    REFERENCES transferencia_sucursal(id)
    ON DELETE SET NULL;
