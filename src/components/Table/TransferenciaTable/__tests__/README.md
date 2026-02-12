# Pruebas de TransferenciaTable

Este directorio contiene las pruebas unitarias para el módulo de transferencias entre sucursales.

## 📁 Estructura

```
__tests__/
├── TransferenciaTable.test.js      # Pruebas del componente principal de tabla
├── TransferenciaFilters.test.js    # Pruebas del componente de filtros
└── README.md                        # Este archivo
```

## 🧪 Ejecutar las Pruebas

### Todas las pruebas del módulo
```bash
npm test -- --testPathPatterns=TransferenciaTable
```

### Con cobertura
```bash
npm test:coverage -- --testPathPatterns=TransferenciaTable
```

### Modo watch (desarrollo)
```bash
npm test:watch -- --testPathPatterns=TransferenciaTable
```

### Todas las pruebas del proyecto
```bash
npm test
```

## 📊 Cobertura de Pruebas

### TransferenciaTable.test.js (23 tests)
✅ **Renderizado inicial**
- Estado de carga con spinner
- Tabla con datos
- Manejo de errores con mensajes claros

✅ **Configuración de columnas**
- Todas las columnas definidas (ID, sucursales, métodos de pago, estados, fecha, acciones)
- Chips con valores correctos
- Estados de entrega y pago

✅ **Interacciones del usuario**
- Botón de edición funcional
- Callback onEdit con datos correctos

✅ **Paginación**
- Cambios de página
- Configuración server-side

✅ **Formato de datos**
- Fechas formateadas (es-ES)
- Manejo de valores null/undefined

✅ **Estados vacíos**
- Sin datos

✅ **Configuración del DataGrid**
- Filtros de columna deshabilitados
- rowId configurado correctamente

### TransferenciaFilters.test.js (16 tests)
✅ **Renderizado inicial**
- Todos los campos de filtro
- Carga de datos desde hooks

✅ **Estados de carga**
- Spinner en selectores
- Selectores deshabilitados durante carga

✅ **Filtro por ID**
- Input numérico
- Actualización de URL

✅ **Filtro por Estado de Entrega**
- Opciones disponibles (Todos, Pendiente, Entregado)
- Actualización de URL

✅ **Filtro por Estado de Pago**
- Opciones disponibles (Todos, Pendiente, Pagado)
- Actualización de URL

✅ **Filtro por Método de Pago**
- Carga dinámica desde API
- Actualización de URL

✅ **Filtro por Sucursales**
- Emisoras y receptoras
- Carga dinámica desde API
- Actualización de URL

✅ **Manejo de URL parameters**
- Persistencia de valores
- Reset a página 1 al filtrar
- Eliminación de parámetros vacíos

✅ **Estilo y presentación**
- Animaciones aplicadas
- Diseño responsive

## 🔧 Configuración de Jest

### jest.config.js
- Integración con Next.js
- Mapeo de alias `@/` a `src/`
- Exclusiones de cobertura
- Transformación de módulos ES6

### jest.setup.js
- @testing-library/jest-dom
- Mocks de next/navigation
- Mocks de APIs del navegador (IntersectionObserver, ResizeObserver)
- TextEncoder/TextDecoder para Node
- Variables de entorno de Supabase

## 🎯 Mejores Prácticas Aplicadas

### Testing Library
✅ Consultas semánticas (getByRole, getByLabelText, getByText)
✅ Espera asíncrona con waitFor
✅ userEvent para interacciones realistas
✅ Mocks de hooks personalizados
✅ Limpieza automática entre tests

### Jest
✅ describe/test para organización
✅ beforeEach para setup
✅ Mock claro y específico
✅ Assertions descriptivas
✅ Cobertura de casos edge

### React/Next.js
✅ Aislamiento de componentes
✅ Mocks de navegación
✅ Pruebas de estados de carga
✅ Pruebas de manejo de errores

## 📝 Notas Importantes

### MUI DataGrid
- Los selectores MUI usan `aria-disabled` en lugar de `disabled`
- Los Chips no tienen role="status" por defecto
- La paginación se maneja internamente en el componente

### Hooks Mockeados
- `useTransferencias`: Simula respuestas de API
- `useMetodoPago`: Datos de métodos de pago
- `useSucursal`: Datos de sucursales
- `useRouter`, `usePathname`, `useSearchParams`: Navegación de Next.js

### Datos de Prueba
Los datos mock incluyen:
- Transferencias con sucursales emisoras/receptoras
- Estados de entrega y pago (true/false)
- Métodos de pago variados
- Fechas en formato ISO

## 🚀 Agregar Nuevas Pruebas

1. Crear el archivo de test en este directorio
2. Importar el componente y dependencias
3. Mockear hooks y navegación
4. Escribir casos de prueba
5. Ejecutar y verificar cobertura

Ejemplo:
```javascript
describe('NuevaFuncionalidad', () => {
  beforeEach(() => {
    // Setup
  })

  test('debe comportarse correctamente', async () => {
    // Arrange
    // Act
    // Assert
  })
})
```

## 📚 Referencias

- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing](https://nextjs.org/docs/testing)
