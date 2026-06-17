/**
 * Attach the real menu photos to menu items.
 * Run with: npm run seed:menu:images              (copies + writes image_url)
 *           npm run seed:menu:images -- --dry-run  (match + report only)
 *
 * Prerequisite: `npm run seed:menu` first (menu items must exist).
 *
 * Source photos live in `Ton menu image/` at the repo root, named by Lao dish
 * name. They are matched to MenuItem.name (NFC + space/comma-insensitive), plus
 * a small set of HIGH-CONFIDENCE overrides for same-dish spelling variants.
 * Matched photos are copied to `api/uploads/menu/<menuItemId>.<ext>` (ASCII /
 * URL-safe) and the item's `image_url` is set to that bare filename. The API
 * serves them at `/uploads/menu/...`; the frontend composes the URL via
 * VITE_IMAGE_BASE_URL.
 *
 * Anything not confidently matched is left `image_url = null` and reported, so
 * the remaining few can be assigned manually.
 */
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import mongoose from 'mongoose'
import { MenuItemModel } from '@/models/menu-item.model.js'

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i

/**
 * Robust match key across spelling variants:
 *  - NFC normalize
 *  - strip whitespace & commas
 *  - strip stray THAI diacritics/tone marks (U+0E47–U+0E4E) that were typed into
 *    a few Lao names by mistake. Legit LAO tone marks (U+0EC8–U+0ECD) are kept.
 */
function looseKey(s: string): string {
  return s
    .normalize('NFC')
    .replace(/[็-๎]/g, '')
    .replace(/[\s,]+/g, '')
    .trim()
}

/**
 * HIGH-CONFIDENCE overrides: menu item name → source photo basename (no ext).
 * Only same-dish variants (Unicode composed/decomposed, word order, Thai
 * spelling). Uncertain pairs are deliberately omitted (left null for manual fix).
 */
const NAME_OVERRIDES: Record<string, string> = {
  'ນ້ຳປັ່ນແອັບເປີ້ນ': 'น้ำแอปเปิ้ลปั่น',     // apple smoothie — photo named in Thai
  'ຂະໜົມຈີບກຸ້ງ 4 ກ້ອນ': 'ຂະຫນົມຈີບກຸ້ງ',   // composed ໜ vs decomposed ຫນ + dropped "4 ກ້ອນ"
  'ທອດປາແມ່ໄຂ່': 'ແມ່ປາໄຂ່ທອດ',             // word order
  'ປານິນທອດລູກເຕົ໋າ': 'ປານິນທອດລູກເຕົາ',     // Lao tone mark ໋
  // (sun-dried pork "ຫມູແດດດ່ຽວ" now auto-matches: its stray Thai tone mark is
  //  stripped by looseKey, matching the toneless photo "ຫມູແດດດຽວ".)
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')

  // Source dir: repo-root/Ton menu image (override with a positional arg).
  const argDir = process.argv.find((a, i) => i >= 2 && !a.startsWith('--'))
  const sourceDir = argDir
    ? path.resolve(argDir)
    : fileURLToPath(new URL('../../Ton menu image', import.meta.url))
  const destDir = fileURLToPath(new URL('../uploads/menu', import.meta.url))

  // Index the photo files by loose key.
  const files = readdirSync(sourceDir).filter((f) => IMAGE_EXT.test(f))
  const byKey = new Map<string, string>() // looseKey(basename) → filename
  for (const f of files) {
    const base = f.replace(IMAGE_EXT, '')
    const key = looseKey(base)
    if (byKey.has(key)) {
      console.warn(`  ⚠ Duplicate photo for "${base}" — keeping ${byKey.get(key)}, ignoring ${f}`)
      continue
    }
    byKey.set(key, f)
  }
  console.log(`✓ Indexed ${byKey.size} photos from "${sourceDir}"`)

  const uri = process.env['MONGODB_URI'] ?? ''
  const dbName = process.env['DB_NAME'] ?? 'tonnam'
  await mongoose.connect(uri, { dbName })
  console.log('✓ Connected to MongoDB')

  const items = await MenuItemModel.find({}, { name: 1 }).lean()
  console.log(`✓ Loaded ${items.length} menu items`)

  if (!dryRun) mkdirSync(destDir, { recursive: true })

  const usedFiles = new Set<string>()
  const noPhoto: string[] = []
  let matched = 0
  let viaOverride = 0

  for (const item of items) {
    const name = item.name
    const overrideBase = NAME_OVERRIDES[name.normalize('NFC')]
    const key = overrideBase ? looseKey(overrideBase) : looseKey(name)
    const file = byKey.get(key)

    if (!file) {
      noPhoto.push(name)
      continue
    }

    const ext = path.extname(file).toLowerCase()
    const destName = `${String(item._id)}${ext}`
    usedFiles.add(file)
    matched++
    if (overrideBase) viaOverride++

    if (dryRun) {
      console.log(`  ${overrideBase ? '≈' : '✓'} ${name}  →  ${file}  →  ${destName}`)
    } else {
      copyFileSync(path.join(sourceDir, file), path.join(destDir, destName))
      await MenuItemModel.updateOne({ _id: item._id }, { $set: { image_url: destName } })
    }
  }

  const unusedFiles = files.filter((f) => !usedFiles.has(f))

  console.log('')
  console.log(`${dryRun ? '— DRY RUN — no files copied, no DB writes' : '✓ Copied photos + updated image_url'}`)
  console.log(`  matched:            ${matched} / ${items.length}  (incl. ${viaOverride} via override)`)
  console.log(`  menu items NO photo: ${noPhoto.length}`)
  for (const n of noPhoto) console.log(`    ✗ ${n}`)
  console.log(`  photos left UNUSED:  ${unusedFiles.length}`)
  for (const f of unusedFiles) console.log(`    ? ${f}`)
  if (!dryRun) console.log(`\n✓ Photos served at /uploads/menu/<id>.<ext> (dest: ${destDir})`)

  await mongoose.disconnect()
}

main().catch((err: unknown) => {
  console.error('✗ Image mapping failed:', err)
  process.exit(1)
})
