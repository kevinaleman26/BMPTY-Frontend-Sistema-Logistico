# ✅ Corrección: Error Asíncrono en ClienteFilters

**Fecha:** 8 de febrero de 2026
**Error:** `Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received`
**Status:** ✅ CORREGIDO

---

## 🔍 Diagnóstico del Problema

### **Error Original:**
```
Uncaught (in promise) Error: A listener indicated an asynchronous response
by returning true, but the message channel closed before a response was received
```

### **Causa Raíz:**
ClienteFilters usaba un patrón diferente que causaba **navegaciones múltiples y conflictos**:

---

## ❌ Código Problemático (ANTES)

### **ClienteFilters.js - Patrón Incorrecto:**

```javascript
// ❌ PROBLEMA 1: useState para cada filtro
const [nombre, setNombre] = useState(searchParams.get('nombre') || '')
const [documento, setDocumento] = useState(searchParams.get('documento') || '')
const [sucursal, setSucursal] = useState(searchParams.get('sucursal_id') || '')
const [tipoDoc, setTipoDoc] = useState(searchParams.get('document_type') || '')

// ❌ PROBLEMA 2: useDebounce (no useDebouncedCallback)
const [debouncedNombre] = useDebounce(nombre, 500)
const [debouncedDocumento] = useDebounce(documento, 500)

// ❌ PROBLEMA 3: useEffect con searchParams en dependencias
useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    debouncedNombre
        ? params.set('nombre', debouncedNombre)
        : params.delete('nombre')

    debouncedDocumento
        ? params.set('documento', debouncedDocumento)
        : params.delete('documento')

    sucursal
        ? params.set('sucursal_id', sucursal)
        : params.delete('sucursal_id')

    tipoDoc
        ? params.set('document_type', tipoDoc)
        : params.delete('document_type')

    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)  // ❌ Navegación en cada render
}, [debouncedNombre, debouncedDocumento, sucursal, tipoDoc, pathname, router, searchParams])
// ☝️ searchParams causa loop infinito

// ❌ PROBLEMA 4: TextField usa value (controlled) con setState
<TextField
    value={nombre}              // ❌ Controlled
    onChange={(e) => setNombre(e.target.value)}  // ❌ Causa re-render
/>
```

### **Problemas Identificados:**

1. **useState causa re-renders excesivos** - Cada cambio causa múltiples re-renders
2. **useDebounce vs useDebouncedCallback** - useDebounce crea nuevos valores, useDebouncedCallback debouncea la función
3. **useEffect con searchParams** - Crea loop infinito porque searchParams cambia con cada navegación
4. **Navegaciones múltiples** - El useEffect navega en cada cambio, causando race conditions
5. **Controlled inputs** - TextField con `value` causa re-renders en cada tecla

### **Resultado:**
- ❌ Navegaciones múltiples simultáneas
- ❌ Race conditions con router.push
- ❌ Listeners asíncronos cancelados prematuramente
- ❌ Error: "message channel closed before a response was received"

---

## ✅ Solución Aplicada (DESPUÉS)

### **ClienteFilters.js - Patrón Correcto:**

```javascript
'use client'

import { useSucursales } from '@/hooks/useSucursales'
import { useTipoDocumento } from '@/hooks/useTipoDocumento'
import { Box, CircularProgress, MenuItem, TextField } from '@mui/material'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'  // ✅ Correcto

export default function ClienteFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const { data: sucursales, isLoading: isLoadingSucursales } = useSucursales()
    const { data: tiposDocumento, isLoading: isLoadingTipos } = useTipoDocumento()

    // ✅ SOLUCIÓN: Una función debounced que maneja TODO
    const handleFilterChange = useDebouncedCallback((key, value) => {
        const params = new URLSearchParams(searchParams.toString())

        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }

        params.set('page', '1')
        router.push(`${pathname}?${params.toString()}`)
    }, 300)  // ✅ Debounce de 300ms

    return (
        <Box>
            {/* ✅ SOLUCIÓN: defaultValue (uncontrolled) en lugar de value */}
            <TextField
                label="Nombre"
                defaultValue={searchParams.get('nombre') || ''}
                onChange={(e) => handleFilterChange('nombre', e.target.value)}
                size="small"
            />

            <TextField
                label="Documento"
                defaultValue={searchParams.get('documento') || ''}
                onChange={(e) => handleFilterChange('documento', e.target.value)}
                size="small"
            />

            {/* ✅ SOLUCIÓN: value para select (necesario) pero con debounced handler */}
            <TextField
                select
                label="Sucursal"
                value={searchParams.get('sucursal_id') ?? ''}
                onChange={(e) => handleFilterChange('sucursal_id', e.target.value)}
                size="small"
            />

            <TextField
                select
                label="Tipo Documento"
                value={searchParams.get('document_type') ?? ''}
                onChange={(e) => handleFilterChange('document_type', e.target.value)}
                size="small"
            />
        </Box>
    )
}
```

### **Mejoras Implementadas:**

1. ✅ **Sin useState** - Eliminados estados locales innecesarios
2. ✅ **useDebouncedCallback** - Debouncea la función de navegación, no el valor
3. ✅ **Sin useEffect** - No hay loops infinitos ni dependencias problemáticas
4. ✅ **defaultValue en TextFields** - Inputs de texto son uncontrolled
5. ✅ **value solo en selects** - Selects necesitan value pero usan handler debounced
6. ✅ **Una sola navegación** - Solo se navega una vez por cambio, después del debounce

---

## 📊 Comparación: Antes vs Después

| Aspecto | Antes (❌) | Después (✅) |
|---------|-----------|--------------|
| **Patrón** | useState + useDebounce + useEffect | useDebouncedCallback |
| **Estados locales** | 4 useState | 0 useState |
| **useEffect** | 1 (con searchParams en deps) | 0 |
| **Navegaciones** | Múltiples (race conditions) | 1 por cambio (debounced) |
| **TextFields** | Controlled (value + setState) | Uncontrolled (defaultValue) |
| **Selects** | Controlled con setState | Controlled con handler debounced |
| **Re-renders** | Excesivos | Mínimos |
| **Error asíncrono** | ❌ Presente | ✅ Corregido |

---

## 🔄 Flujo de Ejecución

### **Antes (Problemático):**
```
1. Usuario escribe en TextField "nombre"
   ↓
2. onChange dispara setNombre('nuevo valor')
   ↓
3. Estado cambia → componente re-renderiza
   ↓
4. useDebounce detecta cambio → espera 500ms
   ↓
5. debouncedNombre cambia → useEffect se dispara
   ↓
6. useEffect crea params y llama router.push
   ↓
7. router.push cambia searchParams
   ↓
8. searchParams cambió → useEffect se dispara OTRA VEZ
   ↓
9. Loop infinito / navegaciones múltiples
   ↓
10. ❌ ERROR: message channel closed
```

### **Después (Correcto):**
```
1. Usuario escribe en TextField "nombre"
   ↓
2. onChange dispara handleFilterChange('nombre', 'nuevo valor')
   ↓
3. useDebouncedCallback espera 300ms (sin cambios de estado)
   ↓
4. Después de 300ms, ejecuta la función:
   - Crea params
   - Actualiza URL
   - router.push UNA SOLA VEZ
   ↓
5. ✅ Navegación exitosa, sin conflictos
```

---

## ✅ Ventajas de la Solución

### **1. Sin Race Conditions**
- Una sola navegación por cambio
- No hay navegaciones simultáneas
- No hay listeners cancelados

### **2. Mejor Performance**
- Sin re-renders innecesarios
- Sin estados locales
- Debounce eficiente

### **3. Consistencia**
- Mismo patrón que TransferenciaFilters, FacturaFilters, etc.
- Código predecible
- Fácil de mantener

### **4. Simplicidad**
- Menos código
- Menos complejidad
- Menos bugs

---

## 🎯 Patrón Estándar para Filtros

Este es el patrón que **TODAS** las tablas deben seguir:

```javascript
'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export default function [Entity]Filters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // ✅ Una función debounced para todos los filtros
    const handleFilterChange = useDebouncedCallback((key, value) => {
        const params = new URLSearchParams(searchParams.toString())

        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }

        params.set('page', '1')
        router.push(`${pathname}?${params.toString()}`)
    }, 300)

    return (
        <Box>
            {/* ✅ Inputs de texto: defaultValue */}
            <TextField
                defaultValue={searchParams.get('campo') || ''}
                onChange={(e) => handleFilterChange('campo', e.target.value)}
            />

            {/* ✅ Selects: value */}
            <TextField
                select
                value={searchParams.get('campo_select') ?? ''}
                onChange={(e) => handleFilterChange('campo_select', e.target.value)}
            >
                <MenuItem value="">Todos</MenuItem>
            </TextField>
        </Box>
    )
}
```

---

## 📋 Checklist de Validación

Para evitar este error en el futuro, verificar:

- [ ] ✅ Usa `useDebouncedCallback` (NO `useDebounce`)
- [ ] ✅ NO usa `useState` para filtros
- [ ] ✅ NO usa `useEffect` para navegación
- [ ] ✅ TextFields de texto usan `defaultValue`
- [ ] ✅ Selects usan `value` pero con handler debounced
- [ ] ✅ searchParams NO está en dependencias de useEffect
- [ ] ✅ Una sola navegación por cambio

---

## 🚀 Resultado Final

**ClienteFilters ahora:**
- ✅ Usa patrón estándar (como TransferenciaFilters)
- ✅ Sin navegaciones múltiples
- ✅ Sin race conditions
- ✅ Sin error asíncrono
- ✅ Mejor performance
- ✅ Código más simple
- ✅ Consistente con otras tablas

---

## 📚 Referencias

- **Patrón base:** TransferenciaFilters.js, SucursalFilters.js
- **Hook usado:** useDebouncedCallback (use-debounce)
- **Documentación:** [use-debounce](https://github.com/xnimorz/use-debounce)

---

**Status:** ✅ **ERROR CORREGIDO**

El error asíncrono ha sido eliminado completamente mediante la implementación del patrón estándar de filtros.
