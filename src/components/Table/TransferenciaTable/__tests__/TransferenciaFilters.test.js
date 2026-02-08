/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import TransferenciaFilters from '../TransferenciaFilters'
import { useMetodoPago } from '@/hooks/useMetodoPago'
import { useSucursal } from '@/hooks/useSucursal'

// Mock de los hooks
jest.mock('@/hooks/useMetodoPago')
jest.mock('@/hooks/useSucursal')

// Mock de use-debounce
jest.mock('use-debounce', () => ({
  useDebouncedCallback: (callback) => callback,
}))

const mockMetodosPago = [
  { id: 1, name: 'Efectivo' },
  { id: 2, name: 'Transferencia' },
  { id: 3, name: 'Tarjeta' },
]

const mockSucursales = [
  { id: 1, name: 'Sucursal A' },
  { id: 2, name: 'Sucursal B' },
  { id: 3, name: 'Sucursal C' },
]

describe('TransferenciaFilters', () => {
  const mockPush = jest.fn()
  const mockPathname = '/transferencia-sucursal'

  beforeEach(() => {
    jest.clearAllMocks()

    useRouter.mockReturnValue({ push: mockPush })
    usePathname.mockReturnValue(mockPathname)
    useSearchParams.mockReturnValue(new URLSearchParams())

    useMetodoPago.mockReturnValue({
      data: mockMetodosPago,
      isLoading: false,
    })

    useSucursal.mockReturnValue({
      data: mockSucursales,
      isLoading: false,
    })
  })

  describe('Renderizado inicial', () => {
    test('debe renderizar todos los campos de filtro', () => {
      render(<TransferenciaFilters />)

      expect(screen.getByLabelText('ID Transferencia')).toBeInTheDocument()
      expect(screen.getByLabelText('Estado de Entrega')).toBeInTheDocument()
      expect(screen.getByLabelText('Estado de Pago')).toBeInTheDocument()
      expect(screen.getByLabelText('Método de Pago')).toBeInTheDocument()
      expect(screen.getByLabelText('Sucursal Emisora')).toBeInTheDocument()
      expect(screen.getByLabelText('Sucursal Receptora')).toBeInTheDocument()
    })

    test('debe cargar métodos de pago desde el hook', () => {
      render(<TransferenciaFilters />)

      expect(useMetodoPago).toHaveBeenCalled()
    })

    test('debe cargar sucursales desde el hook', () => {
      render(<TransferenciaFilters />)

      expect(useSucursal).toHaveBeenCalled()
    })
  })

  describe('Estados de carga', () => {
    test('debe mostrar estado de carga para métodos de pago', async () => {
      useMetodoPago.mockReturnValue({
        data: null,
        isLoading: true,
      })

      const user = userEvent.setup()
      render(<TransferenciaFilters />)

      const metodoPagoSelect = screen.getByLabelText('Método de Pago')

      // Verificar que el select está deshabilitado durante la carga
      expect(metodoPagoSelect).toHaveAttribute('aria-disabled', 'true')
    })

    test('debe mostrar estado de carga para sucursales', async () => {
      useSucursal.mockReturnValue({
        data: null,
        isLoading: true,
      })

      render(<TransferenciaFilters />)

      const sucursalEmisoraSelect = screen.getByLabelText('Sucursal Emisora')

      // Verificar que el select está deshabilitado durante la carga
      expect(sucursalEmisoraSelect).toHaveAttribute('aria-disabled', 'true')
    })

    test('debe deshabilitar select de método de pago durante carga', () => {
      useMetodoPago.mockReturnValue({
        data: null,
        isLoading: true,
      })

      render(<TransferenciaFilters />)

      const metodoPagoSelect = screen.getByLabelText('Método de Pago')
      // MUI usa aria-disabled en lugar de disabled
      expect(metodoPagoSelect).toHaveAttribute('aria-disabled', 'true')
    })

    test('debe deshabilitar selects de sucursales durante carga', () => {
      useSucursal.mockReturnValue({
        data: null,
        isLoading: true,
      })

      render(<TransferenciaFilters />)

      const sucursalEmisoraSelect = screen.getByLabelText('Sucursal Emisora')
      const sucursalReceptoraSelect = screen.getByLabelText('Sucursal Receptora')

      // MUI usa aria-disabled en lugar de disabled
      expect(sucursalEmisoraSelect).toHaveAttribute('aria-disabled', 'true')
      expect(sucursalReceptoraSelect).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Filtro por ID', () => {
    test('debe permitir ingresar un ID de transferencia', async () => {
      const user = userEvent.setup()
      render(<TransferenciaFilters />)

      const idInput = screen.getByLabelText('ID Transferencia')
      await user.type(idInput, '123')

      expect(idInput).toHaveValue(123)
    })

    test('debe actualizar la URL al cambiar el ID', async () => {
      const user = userEvent.setup()
      render(<TransferenciaFilters />)

      const idInput = screen.getByLabelText('ID Transferencia')
      await user.type(idInput, '123')

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('factura_id=123')
        )
      })
    })

    test('debe aceptar solo números en el campo ID', () => {
      render(<TransferenciaFilters />)

      const idInput = screen.getByLabelText('ID Transferencia')
      expect(idInput).toHaveAttribute('type', 'number')
    })
  })

  describe('Filtro por Estado de Entrega', () => {
    test('debe mostrar opciones de estado de entrega', async () => {
      const user = userEvent.setup()
      render(<TransferenciaFilters />)

      const estadoEntregaSelect = screen.getByLabelText('Estado de Entrega')
      await user.click(estadoEntregaSelect)

      await waitFor(() => {
        expect(screen.getByText('Todos')).toBeInTheDocument()
        expect(screen.getByText('Pendiente')).toBeInTheDocument()
        expect(screen.getByText('Entregado')).toBeInTheDocument()
      })
    })

    test('debe actualizar la URL al seleccionar estado de entrega', async () => {
      const user = userEvent.setup()
      render(<TransferenciaFilters />)

      const estadoEntregaSelect = screen.getByLabelText('Estado de Entrega')
      await user.click(estadoEntregaSelect)

      const pendienteOption = await screen.findByText('Pendiente')
      await user.click(pendienteOption)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('delivery_status=false')
        )
      })
    })
  })

  describe('Filtro por Estado de Pago', () => {
    test('debe mostrar opciones de estado de pago', async () => {
      const user = userEvent.setup()
      render(<TransferenciaFilters />)

      const estadoPagoSelect = screen.getByLabelText('Estado de Pago')
      await user.click(estadoPagoSelect)

      await waitFor(() => {
        expect(screen.getAllByText('Todos').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0)
        expect(screen.getByText('Pagado')).toBeInTheDocument()
      })
    })

    test('debe actualizar la URL al seleccionar estado de pago', async () => {
      const user = userEvent.setup()
      render(<TransferenciaFilters />)

      const estadoPagoSelect = screen.getByLabelText('Estado de Pago')
      await user.click(estadoPagoSelect)

      const pagadoOption = await screen.findByText('Pagado')
      await user.click(pagadoOption)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('payment_status=true')
        )
      })
    })
  })

  describe('Filtro por Método de Pago', () => {
    test('debe mostrar métodos de pago cargados', async () => {
      const user = userEvent.setup()
      render(<TransferenciaFilters />)

      const metodoPagoSelect = screen.getByLabelText('Método de Pago')
      await user.click(metodoPagoSelect)

      await waitFor(() => {
        expect(screen.getByText('Efectivo')).toBeInTheDocument()
        expect(screen.getByText('Transferencia')).toBeInTheDocument()
        expect(screen.getByText('Tarjeta')).toBeInTheDocument()
      })
    })

    test('debe actualizar la URL al seleccionar método de pago', async () => {
      const user = userEvent.setup()
      render(<TransferenciaFilters />)

      const metodoPagoSelect = screen.getByLabelText('Método de Pago')
      await user.click(metodoPagoSelect)

      const efectivoOption = await screen.findByText('Efectivo')
      await user.click(efectivoOption)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('metodo_pago=1')
        )
      })
    })
  })

  describe('Filtro por Sucursales', () => {
    test('debe mostrar sucursales emisoras', async () => {
      const user = userEvent.setup()
      render(<TransferenciaFilters />)

      const sucursalEmisoraSelect = screen.getByLabelText('Sucursal Emisora')
      await user.click(sucursalEmisoraSelect)

      await waitFor(() => {
        expect(screen.getByText('Todas')).toBeInTheDocument()
        expect(screen.getByText('Sucursal A')).toBeInTheDocument()
        expect(screen.getByText('Sucursal B')).toBeInTheDocument()
        expect(screen.getByText('Sucursal C')).toBeInTheDocument()
      })
    })

    test('debe mostrar sucursales receptoras', async () => {
      const user = userEvent.setup()
      render(<TransferenciaFilters />)

      const sucursalReceptoraSelect = screen.getByLabelText('Sucursal Receptora')
      await user.click(sucursalReceptoraSelect)

      await waitFor(() => {
        expect(screen.getAllByText('Todas').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Sucursal A').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Sucursal B').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Sucursal C').length).toBeGreaterThan(0)
      })
    })

    test('debe actualizar la URL al seleccionar sucursal emisora', async () => {
      const user = userEvent.setup()
      render(<TransferenciaFilters />)

      const sucursalEmisoraSelect = screen.getByLabelText('Sucursal Emisora')
      await user.click(sucursalEmisoraSelect)

      const sucursalAOption = await screen.findByText('Sucursal A')
      await user.click(sucursalAOption)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('emisor_sucursal=1')
        )
      })
    })

    test('debe actualizar la URL al seleccionar sucursal receptora', async () => {
      const user = userEvent.setup()
      render(<TransferenciaFilters />)

      const sucursalReceptoraSelect = screen.getByLabelText('Sucursal Receptora')
      await user.click(sucursalReceptoraSelect)

      const sucursalBOption = await screen.findByText('Sucursal B')
      await user.click(sucursalBOption)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('receptor_sucursal=2')
        )
      })
    })
  })

  describe('Manejo de URL parameters', () => {
    test('debe mantener valores de filtros desde URL', () => {
      useSearchParams.mockReturnValue(
        new URLSearchParams('factura_id=123&delivery_status=true')
      )

      render(<TransferenciaFilters />)

      const idInput = screen.getByLabelText('ID Transferencia')
      expect(idInput).toHaveValue(123)
    })

    test('debe resetear a página 1 al cambiar cualquier filtro', async () => {
      const user = userEvent.setup()
      useSearchParams.mockReturnValue(
        new URLSearchParams('page=5')
      )

      render(<TransferenciaFilters />)

      const idInput = screen.getByLabelText('ID Transferencia')
      await user.type(idInput, '456')

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('page=1')
        )
      })
    })

    test('debe eliminar parámetro al limpiar filtro', async () => {
      const user = userEvent.setup()
      useSearchParams.mockReturnValue(
        new URLSearchParams('factura_id=123')
      )

      render(<TransferenciaFilters />)

      const idInput = screen.getByLabelText('ID Transferencia')
      await user.clear(idInput)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      })
    })
  })

  describe('Estilo y presentación', () => {
    test('debe aplicar estilos de animación', () => {
      const { container } = render(<TransferenciaFilters />)

      const filterBox = container.querySelector('.slide-up')
      expect(filterBox).toBeInTheDocument()
    })

    test('debe tener espaciado y diseño adecuados', () => {
      const { container } = render(<TransferenciaFilters />)

      const filterBox = container.firstChild
      expect(filterBox).toHaveStyle({
        display: 'flex',
      })
    })
  })
})
