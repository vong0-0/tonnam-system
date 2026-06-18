/**
 * Remove all demo data seeded by seed-demo.ts.
 * Run with: npm run seed:demo:clear
 *
 * Deletes every `__seed: 'DEMO'` document (bills, orders, order items, payments,
 * reservations, audit logs, table-merge groups) and resets the demo tables to
 * AVAILABLE. Users, menu items, menu categories and the table rows themselves
 * are kept.
 */
import mongoose from 'mongoose'
import { clearDemoData } from './_demo-helpers.js'

async function main(): Promise<void> {
  const uri = process.env['MONGODB_URI'] ?? ''
  const dbName = process.env['DB_NAME'] ?? 'tonnam'
  await mongoose.connect(uri, { dbName })
  console.log('✓ Connected to MongoDB')

  const r = await clearDemoData()
  console.log('✓ Demo data cleared:')
  console.log(`  bills:        ${r.bills}`)
  console.log(`  orders:       ${r.orders}`)
  console.log(`  order items:  ${r.orderItems}`)
  console.log(`  payments:     ${r.payments}`)
  console.log(`  reservations: ${r.reservations}`)
  console.log(`  audit logs:   ${r.auditLogs}`)
  console.log(`  merge groups: ${r.mergeGroups}`)
  console.log(`  tables reset: ${r.tablesReset} (kept)`)

  await mongoose.disconnect()
}

main().catch((err: unknown) => {
  console.error('✗ Clear demo failed:', err)
  process.exit(1)
})
