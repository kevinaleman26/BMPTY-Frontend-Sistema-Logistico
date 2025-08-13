import ListItemLink from '@/components/List/Item/ListItemLink'
import { List } from '@mui/material'

const SuperAdminMenu = () => {
  return (
      <List sx={{ mx: 1 }}>
          <ListItemLink href="/dashboard" primary="Dashboard" />
          <ListItemLink href="/sucursal?page=1&limit=10" primary="Sucursales" />
          <ListItemLink href="/operador?page=1&limit=10" primary="Operadores" />
          <ListItemLink href="/cliente?page=1&limit=10" primary="Clientes" />
          <ListItemLink href="/transferencia-sucursal?page=1&limit=10" primary="Transferencias a Sucursal" />
          <ListItemLink href="/paquetes?page=1&limit=10" primary="Paquetes" />
          <ListItemLink href="/facturacion?page=1&limit=10" primary="Facturacion" />
      </List>
  )
}

export default SuperAdminMenu