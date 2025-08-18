import ClientesTable from "@/components/Dashboard/AdminDashboard/ClientesTable"
import OperadoresTable from "@/components/Dashboard/AdminDashboard/OperadoresTable"
import RoleCount from "@/components/Dashboard/AdminDashboard/RoleCount"
import SucursalesTable from "@/components/Dashboard/AdminDashboard/SucursalesTable"
import { Box, Grid, Typography } from "@mui/material"

const SuperAdminDashboard = ({ user }) => {
  return (
    <Box sx={{ width: '100%', py: 3 }}>
      <Grid
        container
        spacing={2}
        sx={{ width: '100%', mx: 'auto', px: { xs: 2, md: 3 } }}
      >
        {/* Header */}
        <Grid item xs={12} md={12} lg={12}>
          <Typography variant="h2" color="white">
            Bienvenido, {user?.full_name}
          </Typography>
        </Grid>

        {/* KPIs */}
        <Grid item xs={12} md={12} lg={12}>
          <RoleCount />
        </Grid>

        {/* Tablas */}
        <Grid item xs={12} md={6} lg={6}>
          <SucursalesTable />
        </Grid>

        <Grid item xs={12} md={6} lg={6}>
          <OperadoresTable />
        </Grid>

        <Grid item xs={12} md={12} lg={12}>
          <ClientesTable />
        </Grid>
      </Grid>
    </Box>
  )
}

export default SuperAdminDashboard
