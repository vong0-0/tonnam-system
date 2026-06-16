import { test, expect, type Page } from '@playwright/test'

// Login fixtures: seed_admin (ADMIN) from seed-daily; e2e_* from `npm run e2e:users`.
const ADMIN = { username: 'seed_admin', password: 'Seed@1234' }
const WAITER = { username: 'e2e_waiter', password: 'E2e@1234' }
const KITCHEN = { username: 'e2e_kitchen', password: 'E2e@1234' }
const CASHIER = { username: 'e2e_cashier', password: 'E2e@1234' }

async function login(page: Page, u: { username: string; password: string }): Promise<void> {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.fill('input[name="username"]', u.username)
  await page.fill('input[name="password"]', u.password)
  await page.click('button[type="submit"]')
}

test.describe('Auth', () => {
  test('rejects invalid credentials and stays on /login', async ({ page }) => {
    await login(page, { username: ADMIN.username, password: 'wrong-password' })
    await expect(page.getByText('ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ')).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('valid login redirects to the role landing page', async ({ page }) => {
    await login(page, ADMIN)
    await expect(page).toHaveURL(/\/select/)
  })
})

test.describe('Admin', () => {
  test('lands on /select and can open admin dashboard + analytics', async ({ page }) => {
    await login(page, ADMIN)
    await expect(page).toHaveURL(/\/select/)
    await expect(page.getByText('ລະບົບ POS')).toBeVisible()

    await page.goto('/admin', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.locator('body')).not.toContainText('404')

    await page.goto('/admin/analytics', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/admin\/analytics/)
  })
})

test.describe('Waiter', () => {
  test('lands on /waiter table list', async ({ page }) => {
    await login(page, WAITER)
    await expect(page).toHaveURL(/\/waiter/)
  })
})

test.describe('Kitchen', () => {
  test('lands on /kitchen display', async ({ page }) => {
    await login(page, KITCHEN)
    await expect(page).toHaveURL(/\/kitchen/)
  })
})

test.describe('POS / Cashier', () => {
  test('lands on /select and can open the POS bills page', async ({ page }) => {
    await login(page, CASHIER)
    await expect(page).toHaveURL(/\/select/)

    await page.goto('/pos/bills', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/pos\/bills/)
    await expect(page.locator('body')).not.toContainText('404')
  })
})
