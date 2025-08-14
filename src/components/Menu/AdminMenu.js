import ListItemLink from '@/components/List/Item/ListItemLink'
import { List } from '@mui/material'

const AdminMenu = () => {
  return (
      <List>
          <ListItemLink href="/dashboard" primary="Dashboard" />
          <ListItemLink href="/operador?page=1&limit=10" primary="Operadores" />
          <ListItemLink href="/cliente?page=1&limit=10" primary="Clientes" />
          <ListItemLink href="/paquetes?page=1&limit=10" primary="Paquetes" />
          <ListItemLink href="/facturacion?page=1&limit=10" primary="Facturacion" />
      </List>
  )
}

export default AdminMenu