import ListItemLink from '@/components/List/Item/ListItemLink'
import List from '@mui/material/List'

const SuperAdminMenu = () => {
  return (
    <List>
      <ListItemLink href="/dashboard" primary="Dashboard" />
      <ListItemLink href="/sucursal?page=1&limit=10" primary="Sucursales" />
      <ListItemLink href="/operador?page=1&limit=10" primary="Operadores" />
      <ListItemLink href="/cliente?page=1&limit=10" primary="Clientes" />
      <ListItemLink href="/transferencia-sucursal?page=1&limit=10" primary="Transferencias a Sucursal" />
      <ListItemLink href="/deudas-sucursales" primary="Deudas Sucursales" />
      <ListItemLink href="/facturacion?page=1&limit=10" primary="Facturacion" />
      <ListItemLink href="/paquetes?page=1&limit=10" primary="Paquetes" />
    </List>
  )
}

export default SuperAdminMenu