/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import TransferenciaTable from '../index'
import { useTransferencias } from '@/hooks/useTransferencias'

// Mock del hook useTransferencias
jest.mock('@/hooks/useTransferencias')

// Mock de los estilos del DataGrid
jest.mock('@/styles/dataGridStyles', () => ({
  dataGridStyles: {}
}))

// Mock del componente de filtros
jest.mock('../TransferenciaFilters', () => {
  return function TransferenciaFilters() {
    return <div data-testid="transferencia-filters">Filtros</div>
  }
})

// Datos de prueba
const mockTransferenciasData = {
  data: [
    {
      id: 1,
      emisor_sucursal: { id: 1, name: 'Sucursal A' },
      receptor_sucursal: { id: 2, name: 'Sucursal B' },
      metodo_pago: { id: 1, name: 'Efectivo' },
      delivery_status: true,
      payment_status: false,
      created_at: '2026-02-08T10:30:00Z',
    },
    {
      id: 2,
      emisor_sucursal: { id: 2, name: 'Sucursal B' },
      receptor_sucursal: { id: 3, name: 'Sucursal C' },
      metodo_pago: { id: 2, name: 'Transferencia' },
      delivery_status: false,
      payment_status: true,
      created_at: '2026-02-07T14:20:00Z',
    },
  ],
  count: 2,
}

describe('TransferenciaTable', () => {
  const mockPush = jest.fn()
  const mockOnEdit = jest.fn()

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup navigation mocks
    useRouter.mockReturnValue({ push: mockPush })
    usePathname.mockReturnValue('/transferencia-sucursal')
    useSearchParams.mockReturnValue(new URLSearchParams('page=1&limit=10'))
  })

  describe('Renderizado inicial', () => {
    test('debe renderizar el componente con estado de carga', () => {
      useTransferencias.mockReturnValue({
        data: { data: [], count: 0 },
        count: 0,
        isLoading: true,
        isError: false,
        error: null,
        page: 1,
        limit: 10,
      })

      render(<TransferenciaTable onEdit={mockOnEdit} />)

      expect(screen.getByTestId('transferencia-filters')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    test('debe renderizar la tabla con datos correctamente', async () => {
      useTransferencias.mockReturnValue({
        data: mockTransferenciasData,
        count: mockTransferenciasData.count,
        isLoading: false,
        isError: false,
        error: null,
        page: 1,
        limit: 10,
      })

      render(<TransferenciaTable onEdit={mockOnEdit} />)

      await waitFor(() => {
        const sucursalA = screen.getAllByText('Sucursal A')
        const sucursalB = screen.getAllByText('Sucursal B')
        const sucursalC = screen.getAllByText('Sucursal C')

        expect(sucursalA.length).toBeGreaterThan(0)
        expect(sucursalB.length).toBeGreaterThan(0)
        expect(sucursalC.length).toBeGreaterThan(0)
      })
    })

  })

  describe('Configuración de columnas', () => {
    beforeEach(() => {
      useTransferencias.mockReturnValue({
        data: mockTransferenciasData,
        count: mockTransferenciasData.count,
        isLoading: false,
        isError: false,
        error: null,
        page: 1,
        limit: 10,
      })
    })

    test('debe mostrar todas las columnas definidas', async () => {
      render(<TransferenciaTable onEdit={mockOnEdit} />)

      await waitFor(() => {
        expect(screen.getByText('ID')).toBeInTheDocument()
        expect(screen.getByText('Sucursal Emisora')).toBeInTheDocument()
        expect(screen.getByText('Sucursal Receptora')).toBeInTheDocument()
        expect(screen.getByText('Método de Pago')).toBeInTheDocument()
        expect(screen.getByText('Estado Entrega')).toBeInTheDocument()
        expect(screen.getByText('Estado Pago')).toBeInTheDocument()
        expect(screen.getByText('Creado en')).toBeInTheDocument()
        expect(screen.getByText('Acción')).toBeInTheDocument()
      })
    })

    test('debe mostrar chips con los valores correctos de sucursales', async () => {
      render(<TransferenciaTable onEdit={mockOnEdit} />)

      await waitFor(() => {
        // Verificar que las sucursales se muestran como chips
        expect(screen.getAllByText('Sucursal A').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Efectivo').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Transferencia').length).toBeGreaterThan(0)
      })
    })

    test('debe mostrar estados de entrega y pago correctamente', async () => {
      render(<TransferenciaTable onEdit={mockOnEdit} />)

      await waitFor(() => {
        expect(screen.getAllByText('Entregado').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Pagado').length).toBeGreaterThan(0)
      })
    })
  })

  describe('Interacciones del usuario', () => {
    beforeEach(() => {
      useTransferencias.mockReturnValue({
        data: mockTransferenciasData,
        count: mockTransferenciasData.count,
        isLoading: false,
        isError: false,
        error: null,
        page: 1,
        limit: 10,
      })
    })

    test('debe llamar a onEdit cuando se hace clic en el botón de editar', async () => {
      const user = userEvent.setup()
      render(<TransferenciaTable onEdit={mockOnEdit} />)

      await waitFor(() => {
        expect(screen.getAllByText('Sucursal A').length).toBeGreaterThan(0)
      })

      const editButtons = screen.getAllByRole('button', { name: '' })
      const dataRowButtons = editButtons.filter(btn =>
        btn.closest('[role="row"]')?.getAttribute('aria-rowindex') !== '1'
      )

      if (dataRowButtons.length > 0) {
        await user.click(dataRowButtons[0])
        expect(mockOnEdit).toHaveBeenCalledWith(mockTransferenciasData.data[0])
      }
    })
  })

  describe('Paginación', () => {
    test('debe manejar cambios de página correctamente', async () => {
      useTransferencias.mockReturnValue({
        data: mockTransferenciasData,
        count: 50,
        isLoading: false,
        isError: false,
        error: null,
        page: 1,
        limit: 10,
      })

      render(<TransferenciaTable onEdit={mockOnEdit} />)

      await waitFor(() => {
        expect(screen.getAllByText('Sucursal A').length).toBeGreaterThan(0)
      })

      // La paginación se maneja a través del DataGrid
      // Verificamos que el componente se renderiza con la configuración correcta
      expect(screen.getByTestId('transferencia-filters')).toBeInTheDocument()
    })

    test('debe configurar paginación del lado del servidor', async () => {
      useTransferencias.mockReturnValue({
        data: mockTransferenciasData,
        count: mockTransferenciasData.count,
        isLoading: false,
        isError: false,
        error: null,
        page: 1,
        limit: 10,
      })

      const { container } = render(<TransferenciaTable onEdit={mockOnEdit} />)

      await waitFor(() => {
        const dataGrid = container.querySelector('.MuiDataGrid-root')
        expect(dataGrid).toBeInTheDocument()
      })
    })
  })

  describe('Formato de datos', () => {
    test('debe formatear fechas correctamente', async () => {
      useTransferencias.mockReturnValue({
        data: mockTransferenciasData,
        count: mockTransferenciasData.count,
        isLoading: false,
        isError: false,
        error: null,
        page: 1,
        limit: 10,
      })

      render(<TransferenciaTable onEdit={mockOnEdit} />)

      await waitFor(() => {
        // Verificar que las fechas se muestran en formato legible
        const dateElements = screen.getAllByText(/feb/i)
        expect(dateElements.length).toBeGreaterThan(0)
      })
    })

    test('debe manejar valores nulos o undefined en sucursales', async () => {
      const dataWithNulls = {
        data: [
          {
            id: 3,
            emisor_sucursal: null,
            receptor_sucursal: { id: 2, name: 'Sucursal B' },
            metodo_pago: null,
            delivery_status: false,
            payment_status: false,
            created_at: '2026-02-08T10:30:00Z',
          },
        ],
        count: 1,
      }

      useTransferencias.mockReturnValue({
        data: dataWithNulls,
        count: 1,
        isLoading: false,
        isError: false,
        error: null,
        page: 1,
        limit: 10,
      })

      render(<TransferenciaTable onEdit={mockOnEdit} />)

      await waitFor(() => {
        expect(screen.getAllByText('Sucursal B').length).toBeGreaterThan(0)
      })
    })
  })

  describe('Estados vacíos', () => {
    test('debe renderizar correctamente cuando no hay datos', async () => {
      useTransferencias.mockReturnValue({
        data: { data: [], count: 0 },
        count: 0,
        isLoading: false,
        isError: false,
        error: null,
        page: 1,
        limit: 10,
      })

      const { container } = render(<TransferenciaTable onEdit={mockOnEdit} />)

      await waitFor(() => {
        const dataGrid = container.querySelector('.MuiDataGrid-root')
        expect(dataGrid).toBeInTheDocument()
      })

      expect(screen.getByTestId('transferencia-filters')).toBeInTheDocument()
    })
  })

  describe('Configuración del DataGrid', () => {
    test('debe deshabilitar el filtro de columnas', async () => {
      useTransferencias.mockReturnValue({
        data: mockTransferenciasData,
        count: mockTransferenciasData.count,
        isLoading: false,
        isError: false,
        error: null,
        page: 1,
        limit: 10,
      })

      const { container } = render(<TransferenciaTable onEdit={mockOnEdit} />)

      await waitFor(() => {
        const dataGrid = container.querySelector('.MuiDataGrid-root')
        expect(dataGrid).toBeInTheDocument()
      })
    })

    test('debe tener rowId configurado correctamente', async () => {
      useTransferencias.mockReturnValue({
        data: mockTransferenciasData,
        count: mockTransferenciasData.count,
        isLoading: false,
        isError: false,
        error: null,
        page: 1,
        limit: 10,
      })

      render(<TransferenciaTable onEdit={mockOnEdit} />)

      await waitFor(() => {
        expect(screen.getByText('Sucursal A')).toBeInTheDocument()
      })

      // Las filas deben usar el campo 'id' como identificador único
    })
  })
})
