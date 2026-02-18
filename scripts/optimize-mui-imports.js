#!/usr/bin/env node

/**
 * Script para optimizar imports de MUI
 * Convierte barrel imports a imports directos para mejor tree-shaking
 *
 * Uso:
 *   node scripts/optimize-mui-imports.js
 *
 * Ejemplo:
 *   ANTES:  import { Box, Button, Typography } from '@mui/material'
 *   DESPUÉS: import Box from '@mui/material/Box'
 *            import Button from '@mui/material/Button'
 *            import Typography from '@mui/material/Typography'
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Colores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Regex para detectar imports de MUI
const MUI_IMPORT_REGEX = /import\s+{([^}]+)}\s+from\s+['"]@mui\/material['"]/g
const MUI_ICONS_IMPORT_REGEX = /import\s+{([^}]+)}\s+from\s+['"]@mui\/icons-material['"]/g

function optimizeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  let newContent = content
  let hasChanges = false

  // Optimizar @mui/material
  newContent = newContent.replace(MUI_IMPORT_REGEX, (match, imports) => {
    hasChanges = true
    const componentList = imports
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0)

    const directImports = componentList
      .map(name => `import ${name} from '@mui/material/${name}'`)
      .join('\n')

    return directImports
  })

  // Optimizar @mui/icons-material
  newContent = newContent.replace(MUI_ICONS_IMPORT_REGEX, (match, imports) => {
    hasChanges = true
    const iconList = imports
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0)

    const directImports = iconList
      .map(name => `import ${name} from '@mui/icons-material/${name}'`)
      .join('\n')

    return directImports
  })

  if (hasChanges) {
    fs.writeFileSync(filePath, newContent, 'utf8')
    return true
  }

  return false
}

function optimizeDirectory(directory) {
  log(`\n🔍 Buscando archivos en: ${directory}`, 'cyan')

  // Buscar todos los archivos .js y .jsx
  const files = glob.sync(`${directory}/**/*.{js,jsx}`, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**']
  })

  log(`📁 Encontrados ${files.length} archivos\n`, 'blue')

  let optimizedCount = 0
  const optimizedFiles = []

  files.forEach(file => {
    const relativePath = path.relative(process.cwd(), file)

    if (optimizeFile(file)) {
      optimizedCount++
      optimizedFiles.push(relativePath)
      log(`✅ Optimizado: ${relativePath}`, 'green')
    }
  })

  log(`\n${'='.repeat(60)}`, 'bright')
  log(`📊 Resumen:`, 'bright')
  log(`   Total de archivos analizados: ${files.length}`, 'blue')
  log(`   Archivos optimizados: ${optimizedCount}`, 'green')
  log(`   Ahorro estimado en bundle: ~${optimizedCount * 3} KB`, 'yellow')
  log(`${'='.repeat(60)}\n`, 'bright')

  if (optimizedFiles.length > 0) {
    log('📝 Archivos modificados:', 'cyan')
    optimizedFiles.forEach(file => {
      log(`   - ${file}`, 'blue')
    })
  } else {
    log('✨ No se encontraron imports de MUI para optimizar', 'green')
  }
}

// Ejecutar optimización
const srcDir = path.join(process.cwd(), 'src')

log('\n' + '='.repeat(60), 'bright')
log('⚡ MUI Import Optimizer', 'bright')
log('='.repeat(60), 'bright')

try {
  optimizeDirectory(srcDir)

  log('\n✅ Optimización completada exitosamente\n', 'green')
  log('💡 Recomendaciones:', 'yellow')
  log('   1. Ejecuta "npm run build" para verificar el nuevo bundle size')
  log('   2. Ejecuta tus tests para asegurar que todo funciona')
  log('   3. Commit los cambios si todo está bien\n')

} catch (error) {
  log(`\n❌ Error durante la optimización: ${error.message}\n`, 'red')
  process.exit(1)
}
