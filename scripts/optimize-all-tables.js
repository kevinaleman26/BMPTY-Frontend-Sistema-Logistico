#!/usr/bin/env node
/**
 * Script to optimize all DataGrid tables in the project
 * Applies performance optimizations to reduce horizontal scroll lag
 *
 * Usage: node scripts/optimize-all-tables.js
 */

const fs = require('fs');
const path = require('path');

const TABLES_DIR = path.join(__dirname, '../src/components/Table');

// DataGrid performance optimizations to inject
const PERFORMANCE_PROPS = `
        // ⚡ Performance optimizations
        columnBuffer={2}
        columnThreshold={2}
        disableColumnResize
        disableColumnReorder
        hideFooterSelectedRowCount
        sx={{
            ...dataGridStyles,
            '& .MuiDataGrid-virtualScroller': {
                overscrollBehaviorX: 'contain',
            },
            '& .MuiDataGrid-row': {
                willChange: 'transform',
            }
        }}`;

// Common memoized components template
const OPTIMIZED_CELLS_TEMPLATE = `// Auto-generated optimized cells for better performance
'use client'

import { memo } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

/**
 * Memoized Chip component
 * Prevents re-renders during scroll
 */
export const OptimizedChip = memo(function OptimizedChip({ label, color = 'primary', size = 'small' }) {
    return <Chip label={label || '—'} color={color} size={size} sx={{ maxWidth: '100%' }} />
})

/**
 * Memoized status chip
 */
export const StatusChip = memo(function StatusChip({ value, trueLabel, falseLabel, trueColor = 'success', falseColor = 'error' }) {
    return (
        <Chip
            label={value ? trueLabel : falseLabel}
            color={value ? trueColor : falseColor}
            size="small"
        />
    )
})

/**
 * Memoized currency display
 */
export const CurrencyCell = memo(function CurrencyCell({ value }) {
    if (value == null) return '—'
    return (
        <Box sx={{
            fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace',
            fontWeight: 600,
            color: '#f4b223'
        }}>
            $\${Number(value).toFixed(2)}
        </Box>
    )
})

/**
 * Memoized date display
 */
export const DateCell = memo(function DateCell({ value, format = 'full' }) {
    if (!value) return '—'

    const date = new Date(value)

    if (format === 'full') {
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return date.toLocaleDateString('es-ES')
})
`;

function findTableDirectories() {
    if (!fs.existsSync(TABLES_DIR)) {
        console.error('❌ Tables directory not found:', TABLES_DIR);
        return [];
    }

    return fs.readdirSync(TABLES_DIR)
        .filter(dir => {
            const fullPath = path.join(TABLES_DIR, dir);
            return fs.statSync(fullPath).isDirectory();
        })
        .map(dir => ({
            name: dir,
            path: path.join(TABLES_DIR, dir),
            indexPath: path.join(TABLES_DIR, dir, 'index.js')
        }))
        .filter(table => fs.existsSync(table.indexPath));
}

function analyzeTable(tablePath) {
    const content = fs.readFileSync(tablePath, 'utf8');

    // Count columns
    const fieldMatches = content.match(/field:\s*['"`](\w+)['"`]/g) || [];
    const columnCount = fieldMatches.length;

    // Check if already optimized
    const hasOptimizations = content.includes('columnBuffer') &&
                            content.includes('columnThreshold');

    // Check for renderCell usage
    const renderCellCount = (content.match(/renderCell:/g) || []).length;

    // Check if has OptimizedCells
    const hasOptimizedCells = content.includes('OptimizedCells');

    return {
        columnCount,
        renderCellCount,
        hasOptimizations,
        hasOptimizedCells,
        needsOptimization: columnCount >= 5 && !hasOptimizations
    };
}

function createOptimizedCells(tablePath, tableName) {
    const cellsPath = path.join(tablePath, 'OptimizedCells.js');

    // Don't overwrite if exists
    if (fs.existsSync(cellsPath)) {
        console.log(`  ⏭️  OptimizedCells.js already exists, skipping...`);
        return false;
    }

    fs.writeFileSync(cellsPath, OPTIMIZED_CELLS_TEMPLATE);
    console.log(`  ✅ Created OptimizedCells.js`);
    return true;
}

function optimizeTableFile(indexPath, tableName) {
    let content = fs.readFileSync(indexPath, 'utf8');

    // Create backup
    const backupPath = indexPath.replace('.js', '.backup.js');
    if (!fs.existsSync(backupPath)) {
        fs.writeFileSync(backupPath, content);
        console.log(`  💾 Created backup: ${path.basename(backupPath)}`);
    }

    let modified = false;

    // Add OptimizedCells import if not present
    if (!content.includes('OptimizedCells')) {
        const importMatch = content.match(/(import.*from.*['"].*['"][\r\n]+)+/);
        if (importMatch) {
            const lastImport = importMatch[0];
            const newImport = `import { OptimizedChip, StatusChip, CurrencyCell, DateCell } from './OptimizedCells'\n`;
            content = content.replace(lastImport, lastImport + newImport);
            modified = true;
            console.log(`  📦 Added OptimizedCells import`);
        }
    }

    // Add performance props to DataGrid if not present
    if (!content.includes('columnBuffer') && content.includes('<DataGrid')) {
        // Find DataGrid component
        const dataGridMatch = content.match(/<DataGrid[\s\S]*?\/>/);
        if (dataGridMatch) {
            const dataGridCode = dataGridMatch[0];

            // Insert performance props before closing />
            const optimizedDataGrid = dataGridCode.replace(/\s*\/>/, `${PERFORMANCE_PROPS}\n                    />`);
            content = content.replace(dataGridCode, optimizedDataGrid);
            modified = true;
            console.log(`  ⚡ Added performance props to DataGrid`);
        }
    }

    // Suggest simple renderCell optimizations (don't auto-replace, too risky)
    const simpleChipPattern = /<Chip\s+label=\{[^}]+\}\s+color="[^"]+"\s+size="small"\s*\/>/g;
    const chipMatches = content.match(simpleChipPattern);
    if (chipMatches && chipMatches.length > 0) {
        console.log(`  💡 Suggestion: Replace ${chipMatches.length} simple Chip components with <OptimizedChip />`);
    }

    if (modified) {
        fs.writeFileSync(indexPath, content);
        console.log(`  ✅ Optimized ${path.basename(indexPath)}`);
        return true;
    }

    return false;
}

function main() {
    console.log('🚀 Starting table optimization...\n');

    const tables = findTableDirectories();

    if (tables.length === 0) {
        console.error('❌ No tables found!');
        return;
    }

    console.log(`📊 Found ${tables.length} tables:\n`);

    let optimizedCount = 0;
    let skippedCount = 0;

    tables.forEach(table => {
        console.log(`\n🔍 Analyzing ${table.name}...`);

        const analysis = analyzeTable(table.indexPath);
        console.log(`  📊 ${analysis.columnCount} columns, ${analysis.renderCellCount} with renderCell`);

        if (analysis.hasOptimizations) {
            console.log(`  ✅ Already optimized, skipping...`);
            skippedCount++;
            return;
        }

        if (!analysis.needsOptimization) {
            console.log(`  ⏭️  Too simple (< 5 columns), skipping...`);
            skippedCount++;
            return;
        }

        console.log(`  🛠️  Optimizing...`);

        // Create OptimizedCells.js
        createOptimizedCells(table.path, table.name);

        // Optimize index.js
        const wasOptimized = optimizeTableFile(table.indexPath, table.name);

        if (wasOptimized) {
            optimizedCount++;
            console.log(`  ✅ ${table.name} optimized successfully!`);
        } else {
            console.log(`  ⚠️  ${table.name} - no changes needed`);
        }
    });

    console.log(`\n\n📈 Summary:`);
    console.log(`  ✅ Optimized: ${optimizedCount} tables`);
    console.log(`  ⏭️  Skipped: ${skippedCount} tables`);
    console.log(`\n💡 Next steps:`);
    console.log(`  1. Review the changes in each table`);
    console.log(`  2. Manually optimize complex renderCell functions`);
    console.log(`  3. Test each table for performance improvements`);
    console.log(`  4. Run: npm run build`);
    console.log(`\n✨ Done!`);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main, analyzeTable, optimizeTableFile };
