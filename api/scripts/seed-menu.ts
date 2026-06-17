/**
 * Seed the real restaurant menu from the old-system CSV dump.
 * Run with: npm run seed:menu            (writes to the dev DB)
 *           npm run seed:menu -- --dry-run   (parse + report only, no writes)
 *
 * Source: old-system-dump/tonnam.categories.csv + tonnam.menus.csv
 *
 * Idempotent — upserts by name, so re-running never duplicates. Existing rows
 * have their price / is_available refreshed from the CSV.
 *
 * Field mapping (old → new):
 *   category.name                      → MenuCategory.name
 *   menu.name                          → MenuItem.name
 *   menu.categoryId (old _id)          → MenuItem.category_id (remapped to new _id)
 *   menu.price                         → MenuItem.price
 *   menu.available                     → MenuItem.is_available
 *   (new) description=null, is_sold_out=false, image_url=null
 *
 * image_url is left null here — the old CSV image URLs reference files that
 * don't exist in the new system. Real photos are attached by name via
 * `npm run seed:menu:images` (scripts/map-menu-images.ts).
 */
import { readFileSync } from 'node:fs'
import mongoose, { type Types } from 'mongoose'
import { MenuCategoryModel } from '@/models/menu-category.model.js'
import { MenuItemModel } from '@/models/menu-item.model.js'

// ─── CSV parsing ────────────────────────────────────────────────────────────────

/** Parse one CSV line, honoring double-quoted fields that may contain commas. */
function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let value = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          value += '"' // escaped quote
          i++
        } else {
          inQuotes = false
        }
      } else {
        value += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      fields.push(value)
      value = ''
    } else {
      value += ch
    }
  }
  fields.push(value)
  return fields
}

/** Parse a CSV file into an array of header-keyed records. */
function parseCsv(path: URL): Array<Record<string, string>> {
  const text = readFileSync(path, 'utf-8').replace(/^﻿/, '')
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return []

  const headers = parseCsvLine(lines[0]!)
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = (cells[i] ?? '').trim()
    })
    return row
  })
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function parseBool(value: string): boolean {
  return value.trim().toLowerCase() === 'true'
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')

  const categoriesCsv = new URL('../../old-system-dump/tonnam.categories.csv', import.meta.url)
  const menusCsv = new URL('../../old-system-dump/tonnam.menus.csv', import.meta.url)

  const categoryRows = parseCsv(categoriesCsv)
  const menuRows = parseCsv(menusCsv)
  console.log(`✓ Parsed ${categoryRows.length} categories and ${menuRows.length} menu items from CSV`)

  if (dryRun) {
    // Validate the joins without touching the DB.
    const oldIds = new Set(categoryRows.map((c) => c['_id']))
    const skipped = menuRows.filter((m) => !oldIds.has(m['categoryId']))
    console.log('— DRY RUN — no database writes')
    console.log(`  categories:        ${categoryRows.length}`)
    console.log(`  menu items:        ${menuRows.length}`)
    console.log(`  items unavailable: ${menuRows.filter((m) => !parseBool(m['available'] ?? '')).length}`)
    console.log(`  items skipped (no matching category): ${skipped.length}`)
    if (skipped.length > 0) {
      for (const s of skipped) console.warn(`    ⚠ "${s['name']}" → unknown categoryId ${s['categoryId']}`)
    }
    return
  }

  const uri = process.env['MONGODB_URI'] ?? ''
  const dbName = process.env['DB_NAME'] ?? 'tonnam'
  await mongoose.connect(uri, { dbName })
  console.log('✓ Connected to MongoDB')

  // ── Categories: upsert by name, build old _id → new _id map ────────────────
  const oldCatIdToNewId = new Map<string, Types.ObjectId>()
  for (const row of categoryRows) {
    const name = (row['name'] ?? '').trim()
    if (!name) continue
    const cat = await MenuCategoryModel.findOneAndUpdate(
      { name },
      { $setOnInsert: { name, description: null } },
      { upsert: true, returnDocument: 'after' },
    )
    oldCatIdToNewId.set(row['_id'] ?? '', cat!._id as Types.ObjectId)
  }
  console.log(`✓ Categories upserted: ${oldCatIdToNewId.size}`)

  // ── Menu items: upsert by (category_id, name) ──────────────────────────────
  let inserted = 0
  let updated = 0
  let skipped = 0

  for (const row of menuRows) {
    const name = (row['name'] ?? '').trim()
    const categoryId = oldCatIdToNewId.get(row['categoryId'] ?? '')
    if (!name || !categoryId) {
      skipped++
      console.warn(`  ⚠ Skipped "${name}" — no matching category for ${row['categoryId']}`)
      continue
    }

    const price = Number(row['price'] ?? 0)
    const is_available = parseBool(row['available'] ?? '')

    // image_url is intentionally NOT set here. The old CSV image URLs point at
    // files that don't exist in the new system; real photos are mapped by name
    // via `npm run seed:menu:images`, which owns image_url.
    const existing = await MenuItemModel.findOne({ category_id: categoryId, name }).lean()
    await MenuItemModel.findOneAndUpdate(
      { category_id: categoryId, name },
      {
        $set: { price, is_available },
        $setOnInsert: { category_id: categoryId, name, description: null, is_sold_out: false, image_url: null },
      },
      { upsert: true, returnDocument: 'after' },
    )
    if (existing) updated++
    else inserted++
  }

  console.log(`✓ Menu items — inserted: ${inserted}, updated: ${updated}, skipped: ${skipped}`)
  console.log('ℹ Run `npm run seed:menu:images` to attach the real menu photos (sets image_url)')
  console.log('✓ Done')

  await mongoose.disconnect()
}

main().catch((err: unknown) => {
  console.error('✗ Menu seed failed:', err)
  process.exit(1)
})
