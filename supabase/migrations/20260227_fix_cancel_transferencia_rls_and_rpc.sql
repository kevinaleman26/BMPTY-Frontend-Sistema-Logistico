-- Fix 1: Add DELETE policy to transferencia_sucursal
-- (RLS is enabled but no DELETE policy existed, blocking cancellation)
CREATE POLICY "Enable delete for authenticated users"
ON transferencia_sucursal
FOR DELETE
TO authenticated
USING (true);

-- Fix 2: Make registrar_evento_paquete SECURITY DEFINER
-- paquete_evento has RLS enabled with 0 policies, so SECURITY INVOKER
-- (the default) blocks INSERTs from authenticated role.
-- SECURITY DEFINER makes it run as the function owner (postgres),
-- which bypasses RLS just like the event triggers do.
ALTER FUNCTION registrar_evento_paquete(TEXT, VARCHAR, BIGINT, UUID, UUID, BIGINT, BIGINT, JSONB)
    SECURITY DEFINER;
