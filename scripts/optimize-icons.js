#!/usr/bin/env node

/**
 * Script para optimizar imports de iconos
 * Reemplaza iconos MUI pesados por versiones SVG ligeras
 *
 * Uso:
 *   node scripts/optimize-icons.js
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

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

// Iconos que tenemos optimizados (versiones ligeras)
const OPTIMIZED_ICONS = [
  'EditIcon',
  'AddIcon',
  'VisibilityIcon',
  'CloseIcon',
  'DescriptionIcon',
  'SearchIcon'
]

function optimizeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  let newContent = content
  let hasChanges = false
  let optimizedCount = 0

  // Para cada icono optimizado (soporta múltiples formatos)
  OPTIMIZED_ICONS.forEach(iconName => {
    // Regex para encontrar imports (formato directo o barrel)
    const importRegex = new RegExp(
      `import ${iconName} from ['"]@mui/icons-material(/[^'"]*)?['"]`,
      'g'
    )

    if (importRegex.test(content)) {
      hasChanges = true
      optimizedCount++
    }
  })

  if (hasChanges) {
    // Reemplazar todos los imports de iconos optimizados
    const iconsToReplace = OPTIMIZED_ICONS.filter(iconName => {
      const regex = new RegExp(`import ${iconName} from ['"]@mui/icons-material`)
      return regex.test(content)
    })

    if (iconsToReplace.length > 0) {
      // Remover los imports individuales (soporta ambos formatos)
      iconsToReplace.forEach(iconName => {
        const regex = new RegExp(
          `import ${iconName} from ['"]@mui/icons-material(/[^'"]*)?['"]\\n?`,
          'g'
        )
        newContent = newContent.replace(regex, '')
      })

      // Agregar un solo import de nuestros iconos optimizados
      const importStatement = `import { ${iconsToReplace.join(', ')} } from '@/components/Icons'\n`

      // Insertar después del último import existente
      const lastImportMatch = newContent.match(/^import.*$/gm)
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1]
        const lastImportIndex = newContent.lastIndexOf(lastImport)
        newContent =
          newContent.slice(0, lastImportIndex + lastImport.length) +
          '\n' +
          importStatement +
          newContent.slice(lastImportIndex + lastImport.length)
      }

      fs.writeFileSync(filePath, newContent, 'utf8')
      return optimizedCount
    }
  }

  return 0
}

function optimizeDirectory(directory) {
  log(`\n🔍 Buscando archivos con iconos en: ${directory}`, 'cyan')

  const files = glob.sync(`${directory}/**/*.{js,jsx}`, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/Icons/**']
  })

  log(`📁 Encontrados ${files.length} archivos\n`, 'blue')

  let totalOptimized = 0
  const optimizedFiles = []

  files.forEach(file => {
    const relativePath = path.relative(process.cwd(), file)
    const count = optimizeFile(file)

    if (count > 0) {
      totalOptimized += count
      optimizedFiles.push({ path: relativePath, count })
      log(`✅ Optimizado: ${relativePath} (${count} iconos)`, 'green')
    }
  })

  log(`\n${'='.repeat(60)}`, 'bright')
  log(`📊 Resumen:`, 'bright')
  log(`   Total de archivos analizados: ${files.length}`, 'blue')
  log(`   Archivos optimizados: ${optimizedFiles.length}`, 'green')
  log(`   Iconos reemplazados: ${totalOptimized}`, 'green')
  log(`   Ahorro estimado en bundle: ~${totalOptimized * 3} KB`, 'yellow')
  log(`${'='.repeat(60)}\n`, 'bright')

  if (optimizedFiles.length > 0) {
    log('📝 Archivos modificados:', 'cyan')
    optimizedFiles.forEach(({ path, count }) => {
      log(`   - ${path} (${count} iconos)`, 'blue')
    })
  } else {
    log('✨ No se encontraron iconos para optimizar', 'green')
  }
}

// Ejecutar optimización
const srcDir = path.join(process.cwd(), 'src')

log('\n' + '='.repeat(60), 'bright')
log('⚡ Icon Optimizer', 'bright')
log('='.repeat(60), 'bright')

try {
  optimizeDirectory(srcDir)

  log('\n✅ Optimización de iconos completada\n', 'green')
  log('💡 Iconos optimizados:', 'yellow')
  OPTIMIZED_ICONS.forEach(icon => {
    log(`   - ${icon} (~3 KB → ~0.5 KB)`, 'blue')
  })
  log('\n💡 Próximos pasos:', 'yellow')
  log('   1. Ejecuta "npm run build" para verificar el bundle size')
  log('   2. Verifica que los iconos se ven correctamente')
  log('   3. Commit los cambios si todo está bien\n')

} catch (error) {
  log(`\n❌ Error durante la optimización: ${error.message}\n`, 'red')
  process.exit(1)
}
