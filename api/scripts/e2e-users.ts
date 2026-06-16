/**
 * Manage persistent login fixtures for the SRMS Playwright smoke tests.
 *
 *   npm run e2e:users          → upsert e2e_waiter / e2e_kitchen / e2e_cashier
 *   npm run e2e:users -- --delete  → remove them
 *
 * Admin login for the suite reuses the existing `seed_admin` account.
 * These users place no orders, so analytics are unaffected.
 */
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { UserModel } from '@/models/user.model.js'

const USERS = [
  { username: 'e2e_waiter',  first_name: 'E2E', last_name: 'Waiter',  phone: '02000000011', role: 'WAITER' as const },
  { username: 'e2e_kitchen', first_name: 'E2E', last_name: 'Kitchen', phone: '02000000012', role: 'KITCHEN' as const },
  { username: 'e2e_cashier', first_name: 'E2E', last_name: 'Cashier', phone: '02000000013', role: 'CASHIER' as const },
]
const PASSWORD = 'E2e@1234'

async function main(): Promise<void> {
  const del = process.argv.includes('--delete')
  await mongoose.connect(process.env['MONGODB_URI'] ?? '', { dbName: process.env['DB_NAME'] ?? 'tonnam' })

  if (del) {
    const r = await UserModel.deleteMany({ username: { $in: USERS.map((u) => u.username) } })
    console.log(`✓ Deleted ${r.deletedCount} e2e users`)
  } else {
    const hashed = await bcrypt.hash(PASSWORD, 10)
    for (const u of USERS) {
      await UserModel.findOneAndUpdate(
        { username: u.username },
        { $set: { ...u, password: hashed, is_active: true } },
        { upsert: true, returnDocument: 'after' },
      )
    }
    console.log(`✓ Upserted ${USERS.length} e2e users (password: ${PASSWORD})`)
  }

  await mongoose.disconnect()
}

main().catch((err: unknown) => {
  console.error('✗ e2e-users failed:', err)
  process.exit(1)
})
