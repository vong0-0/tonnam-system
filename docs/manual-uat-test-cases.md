# TonNam SRMS — Manual UAT Test Cases

Manual User-Acceptance-Test checklist for the SRMS staff app. Each case walks a real usage flow.
The app UI is in **Lao**; every action quotes the exact on-screen Lao label, e.g. tap
**`ເປີດໂຕະ`** (Open table).

> A Google Form version of this checklist can be generated with `docs/create-uat-form.gs`.

---

## How to use

1. Bring the stack up (see Prerequisites) and log in with the account for the role you're testing.
2. Run each test case in order — follow **Steps**, compare against **Expected result**.
3. Mark **Result**: ☐ Pass · ☐ Fail · ☐ Skip (not tested).
4. On a failure, write what happened in **Note** (what you saw, any error text, screenshot name).
5. Report blockers immediately; otherwise finish the section and submit.

**Result legend:** Pass = behaved exactly as Expected · Fail = differed from Expected · Skip = could
not test (blocked / out of scope).

---

## Prerequisites / test accounts

| Item | Value |
|---|---|
| SRMS (frontend) | `http://localhost:5173` |
| API (backend) | `http://localhost:8080` |
| Start backend | in `api/`: `npm run dev` |
| Start frontend | in `srms/`: `npm run dev` |
| Seed data (menu, tables, paid bills) | in `api/`: `npm run seed:daily` |
| Admin login | `seed_admin` / `Seed@1234` |

**Staff accounts for Waiter / Kitchen / Cashier:** create them once via **Admin → Users →
`ເພີ່ມພະນັກງານ`** (covered by TC-ADM-10). Rules: password **≥ 8 characters**, phone format
**`020XXXXXXXX`** (11 digits).

**Roles & landing pages:** ADMIN/CASHIER → `/select` · WAITER → `/waiter` · KITCHEN → `/kitchen`.

---

## 1. Auth

### TC-AUTH-01 — Admin login redirects to role-select
- **Role:** Admin
- **Preconditions:** On `/login`, logged out.
- **Steps:** Enter `seed_admin` / `Seed@1234` → tap **`ເຂົ້າສູ່ລະບົບ`**.
- **Expected:** Redirects to `/select`; the 4 subsystem cards show (incl. **`ລະບົບ POS`**).
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-AUTH-02 — Cashier login redirects to role-select
- **Role:** Cashier
- **Preconditions:** A CASHIER account exists.
- **Steps:** Log in with the cashier account.
- **Expected:** Redirects to `/select`; cards shown do **not** include the Admin backend card.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-AUTH-03 — Waiter login redirects to waiter app
- **Role:** Waiter
- **Preconditions:** A WAITER account exists.
- **Steps:** Log in with the waiter account.
- **Expected:** Redirects straight to `/waiter` (table list).
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-AUTH-04 — Kitchen login redirects to kitchen display
- **Role:** Kitchen
- **Preconditions:** A KITCHEN account exists.
- **Steps:** Log in with the kitchen account.
- **Expected:** Redirects straight to `/kitchen`.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-AUTH-05 — Wrong password is rejected
- **Role:** Any
- **Preconditions:** On `/login`.
- **Steps:** Enter a valid username with a wrong password → tap **`ເຂົ້າສູ່ລະບົບ`**.
- **Expected:** Error **`ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ`** is shown; stays on `/login`.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-AUTH-06 — Logout requires confirmation
- **Role:** Any
- **Preconditions:** Logged in.
- **Steps:** Tap logout → in the dialog **`ອອກຈາກລະບົບ`** tap the confirm **`ອອກຈາກລະບົບ`**.
- **Expected:** A confirm dialog appears first; after confirming, returns to `/login`.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

---

## 2. Waiter

### TC-WAIT-01 — Open a table
- **Role:** Waiter
- **Preconditions:** On `/waiter`, an AVAILABLE (**`ວ່າງ`**) table exists.
- **Steps:** Tap a free table → on detail tap **`ເປີດໂຕະ`**.
- **Expected:** Table status changes to **`ມີລູກຄ້າ`** (OCCUPIED).
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-WAIT-02 — Open a bill on the table
- **Role:** Waiter
- **Preconditions:** Table is OCCUPIED with no open bill.
- **Steps:** Tap **`ເປີດບິນ`**.
- **Expected:** A bill is created; bill summary (code **`ລະຫັດໃບບິນ`**, total **`ຍອດລວມທັ້ງຫມົດ`**)
  appears; the action button becomes **`ສັ່ງເມນູເພີ່ມ`**.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-WAIT-03 — Add menu items with quantity and note
- **Role:** Waiter
- **Preconditions:** A bill is open.
- **Steps:** Tap **`ສັ່ງເມນູເພີ່ມ`** → tap a menu item → set **`ຈຳນວນ`** → type a **`ໝາຍເຫດ`**
  (e.g. `ບໍ່ເຜັດ`) → tap **`ເພີ່ມເຂົ້າ`**.
- **Expected:** Item is added to the cart; the cart bar shows item count + total.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-WAIT-04 — Review cart and send to kitchen
- **Role:** Waiter
- **Preconditions:** Cart has ≥1 item.
- **Steps:** Tap the cart bar → review in **`ກວດສອບລາຍການອາຫານ`** → tap **`ສົ່ງໄປຫ້ອງຄົວ`**.
- **Expected:** Order is sent; returns to the table detail; new order appears.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-WAIT-05 — Sent item shows "cooking" status
- **Role:** Waiter
- **Preconditions:** An order was just sent.
- **Steps:** Look at the order item status badge on the table detail.
- **Expected:** Item shows **`ກຳລັງເຮັດ`** (pending/cooking).
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-WAIT-06 — Confirm a reservation arrival
- **Role:** Waiter
- **Preconditions:** On `/waiter/reservations`, a PENDING (**`ລໍຖ້າ`**) reservation exists.
- **Steps:** Tap **`ຢືນຢັນລູກຄ້າມາຮອດ`** → confirm in the dialog **`ຢືນຢັນການຈອງ`**.
- **Expected:** Reservation becomes **`ຢືນຢັນແລ້ວ`**; its table moves toward in-use.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-WAIT-07 — Profile + logout
- **Role:** Waiter
- **Preconditions:** Logged in as waiter.
- **Steps:** Open profile → verify name/role/contact → tap **`ອອກຈາກລະບົບ`** → confirm.
- **Expected:** Profile data correct; logout returns to `/login`.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

---

## 3. Kitchen

### TC-KIT-01 — New order appears in the waiting tab
- **Role:** Kitchen
- **Preconditions:** A waiter has just sent an order.
- **Steps:** On `/kitchen` stay on the **`ລໍຖ້າ`** tab.
- **Expected:** The new order card is listed with status **`ອໍເດີໃຫມ່`**.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-KIT-02 — Mark an item ready to serve
- **Role:** Kitchen
- **Preconditions:** An order with a pending item is open.
- **Steps:** Expand the order card → on the item tap **`ພ້ອມເສີບ`**.
- **Expected:** Item badge changes to **`ສຳເລັດ`** (COOKED); when all items done the order leaves
  the waiting tab.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-KIT-03 — Cancel an item requires a reason
- **Role:** Kitchen
- **Preconditions:** An order with a pending item.
- **Steps:** Tap **`ຍົກເລິກລາຍການ`** → in **`ຢືນຢັນການຍົກເລີກລາຍການ`** type a
  **`ເຫດຜົນການຍົກເລີກ`** → tap **`ຢືນຢັນຍົກເລີກ`**.
- **Expected:** Cannot confirm with an empty reason; after a reason, item becomes **`ຍົກເລີກ`**.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-KIT-04 — Send finished items (batch)
- **Role:** Kitchen
- **Preconditions:** An order has items marked done.
- **Steps:** Tap **`ສົ່ງລາຍການອາຫານ`**.
- **Expected:** The finished items are dispatched; order/item statuses update accordingly.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-KIT-05 — Order history filtering
- **Role:** Kitchen
- **Preconditions:** Past orders exist.
- **Steps:** Open order history → filter by date (**`ເລືອກວັນທີ`**) and status
  (**`ສຳເລັດ`** / **`ຍົກເລີກ`**).
- **Expected:** List filters correctly; empty filter shows **`ບໍ່ມີ order`**.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

---

## 4. POS / Cashier

### TC-POS-01 — Open a table and create a bill
- **Role:** Cashier
- **Preconditions:** On `/pos`, an AVAILABLE table exists.
- **Steps:** Tap a free table → **`ເປີດໂຕະ`** → in the detail modal tap **`ເປີດບິດເພື່ອສັ່ງອາຫານ`**.
- **Expected:** Bill is created (status **`ອໍເດີ້ໃຫມ່`**); action buttons appear.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-POS-02 — Add an order to the bill
- **Role:** Cashier
- **Preconditions:** A bill is open.
- **Steps:** Tap **`ສັ່ງອາຫານເພີ່ມ`** → pick items → tap **`ສົ່ງໄປຫ້ອງຄົວ`**.
- **Expected:** Items appear on the bill; bill total updates.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-POS-03 — Adjust item quantity requires a reason
- **Role:** Cashier
- **Preconditions:** Bill has an item.
- **Steps:** Change the item quantity → tap **`ຢືນຢັນ`** → in **`ປ່ຽນຈຳນວນ`** enter a
  **`ເຫດຜົນ`** → confirm.
- **Expected:** Cannot confirm without a reason; total recalculates after change.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-POS-04 — Cancel an item requires a reason
- **Role:** Cashier
- **Preconditions:** Bill has an item.
- **Steps:** Cancel the item → in **`ຍົກເລີກລາຍການ`** enter a **`ເຫດຜົນ`** → confirm.
- **Expected:** Item is cancelled and excluded from the total.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-POS-05 — Pay by cash with change
- **Role:** Cashier
- **Preconditions:** An OPEN bill with items.
- **Steps:** Tap **`ໄລ່ເງິນ`** → **`ຊຳລະເງິນ`** → tab **`ເງິນສົດ`** → enter
  **`ຈຳນວນທີ່ລູກຄ້າຈ່າຍ`** greater than the total → tap **`ຢືນຢັນການຊຳລະ`**.
- **Expected:** Change shown under **`ເງິນທອນ`**; bill becomes **`ຊຳລະແລ້ວ`**.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-POS-06 — Cash less than total is rejected
- **Role:** Cashier
- **Preconditions:** Payment modal open, CASH tab.
- **Steps:** Enter an amount **less** than the total due.
- **Expected:** Error **`ຈຳນວນເງິນໜ້ອຍກວ່າຍອດທີ່ຕ້ອງຊຳລະ`**; cannot confirm.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-POS-07 — Pay by QR
- **Role:** Cashier
- **Preconditions:** An OPEN bill with items.
- **Steps:** Open payment → tab **`QR`** (sees **`ຈຳນວນທີ່ຕ້ອງໂອນ`**) → **`ຢືນຢັນການຊຳລະ`**.
- **Expected:** Bill becomes **`ຊຳລະແລ້ວ`**; method badge shows **`ໂອນຈ່າຍ`**.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-POS-08 — Mixed payment total must match
- **Role:** Cashier
- **Preconditions:** Payment modal open, **`ເງິນສົດ + QR`** tab.
- **Steps:** Enter cash + QR amounts that **don't** sum to the total.
- **Expected:** Error **`ຈຳນວນລວມຕ້ອງເທົ່າກັບ … ກີບ`**; when they match, confirm succeeds.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-POS-09 — Clear a paid table
- **Role:** Cashier
- **Preconditions:** A bill was just paid; table is in PAID state.
- **Steps:** In the table detail tap **`ເຄຍໂຕະ`**.
- **Expected:** Table returns to **`ວ່າງ`** (AVAILABLE).
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-POS-10 — Cancel a bill requires a reason
- **Role:** Cashier
- **Preconditions:** An OPEN bill (unpaid).
- **Steps:** Tap **`ຍົກເລິກບິດ`** → in **`ຍົກເລີກບິນ`** enter a **`ເຫດຜົນ`** → **`ຢືນຢັນ`**.
- **Expected:** Bill becomes **`ຍົກເລີກ`**; table returns to AVAILABLE.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-POS-11 — Create / move a table
- **Role:** Cashier
- **Preconditions:** On `/pos`.
- **Steps:** Tap **`ເພີ່ມໂຕະ`** → fill name + capacity → **`ເພີ່ມໂຕະ`**. (Optional) on an occupied
  table tap **`ຢ້າຍໂຕະ`** and pick a target.
- **Expected:** New table appears; move transfers the bill to the chosen table.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-POS-12 — Bills list, detail, print + menu sold-out toggle
- **Role:** Cashier
- **Preconditions:** Paid/open bills exist; menu has items.
- **Steps:** On `/pos/bills` filter by status/date → open a bill → review detail → tap
  **`ພິມບິນ`**. On `/pos/menu` toggle an item to **`ໝາຍວ່າ ໝົດ`** and confirm.
- **Expected:** Filters work; detail shows items/payment; print opens; the item shows sold-out.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

---

## 5. Admin

### TC-ADM-01 — Dashboard KPIs and charts render
- **Role:** Admin
- **Preconditions:** Seed data present (`npm run seed:daily`).
- **Steps:** Open `/admin`.
- **Expected:** KPI cards (**`ຍອດລວມ`**, **`ຈຳນວນບິນ`**, **`ຄ່າສະເລ່ຍ / ບິນ`**), charts, and
  **`ເມນູຍອດນິຍົມ`** show non-empty data.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-ADM-02 — Analytics period switching
- **Role:** Admin
- **Preconditions:** On `/admin/analytics`.
- **Steps:** Switch period **`ລາຍວັນ`** / **`ລາຍອາທິດ`** / **`ລາຍເດືອນ`** / **`ລາຍປີ`**.
- **Expected:** KPIs and charts refresh for each period without error.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-ADM-03 — Dead-items not supported for daily
- **Role:** Admin
- **Preconditions:** On `/admin/analytics`, period = **`ລາຍວັນ`**.
- **Steps:** Open the **`ຂາຍຊ້າ`** (Dead Items) tab.
- **Expected:** Shows the not-supported message asking to pick weekly/monthly/yearly; switching to
  **`ລາຍອາທິດ`** loads the table.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-ADM-04 — Create a table
- **Role:** Admin
- **Preconditions:** On `/admin/tables`.
- **Steps:** Tap **`ເພີ່ມໂຕະໃໝ່`** → enter **`ຊື່ໂຕະ`** + **`ຈຳນວນທີ່ນັ່ງ`** → **`ເພີ່ມໂຕະ`**.
- **Expected:** New table appears in the list.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-ADM-05 — Edit a table
- **Role:** Admin
- **Preconditions:** A table exists.
- **Steps:** Tap **`ແກ້ໄຂ`** → change name/capacity → **`ບັນທຶກ`**.
- **Expected:** Changes are saved and reflected in the list.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-ADM-06 — Delete a table
- **Role:** Admin
- **Preconditions:** A removable table exists.
- **Steps:** Tap **`ລົບ`** → confirm in **`ລົບໂຕະ`** with **`ລົບ`**.
- **Expected:** Table is removed from the list.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-ADM-07 — Menu category create / edit / delete
- **Role:** Admin
- **Preconditions:** On `/admin/menu`.
- **Steps:** Create via **`ເພີ່ມໝວດໝູ່ໃໝ່`** → edit (**`ແກ້ໄຂໝວດໝູ່`**) → delete (**`ລົບໝວດໝູ່`**).
- **Expected:** Each operation succeeds and the category list updates.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-ADM-08 — Menu item create / edit
- **Role:** Admin
- **Preconditions:** At least one category exists.
- **Steps:** Tap **`ເພີ່ມເມນູໃໝ່`** → set **`ໝວດໝູ່`**, **`ຊື່ເມນູ`**, **`ລາຄາ (ກີບ)`** →
  **`ເພີ່ມເມນູ`**. Then edit it via **`ແກ້ໄຂເມນູ`** → **`ບັນທຶກ`**.
- **Expected:** Item is created and edits persist.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-ADM-09 — Menu item availability / sold-out toggle
- **Role:** Admin
- **Preconditions:** A menu item exists.
- **Steps:** Toggle **`ພ້ອມຂາຍ`** (confirm **`ເປີດ ພ້ອມຂາຍ`** / **`ປິດ ພ້ອມຂາຍ`**) and toggle
  **`ໝົດ`** (confirm **`ໝາຍວ່າ ໝົດ`**).
- **Expected:** Flags update; a sold-out item is blocked from being ordered.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-ADM-10 — Create user with validation
- **Role:** Admin
- **Preconditions:** On `/admin/users`.
- **Steps:** Tap **`ເພີ່ມພະນັກງານ`** → fill fields, set **`ຕຳແຫນ່ງ`** → try an invalid phone
  (not `020XXXXXXXX`) and a short password (<8), then valid values → **`ເພີ່ມພະນັກງານ`**.
- **Expected:** Invalid phone/password are rejected with messages; valid input creates the user.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-ADM-11 — Edit a user
- **Role:** Admin
- **Preconditions:** A user exists.
- **Steps:** Edit name/phone/role → **`ບັນທຶກ`**.
- **Expected:** Changes are saved.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-ADM-12 — Deactivate / reactivate a user
- **Role:** Admin
- **Preconditions:** A non-admin user exists.
- **Steps:** Deactivate (confirm **`ປິດໃຊ້ງານ`**) then reactivate (confirm **`ເປີດໃຊ້ງານ`**).
- **Expected:** Status flips; a deactivated user cannot log in.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-ADM-13 — Edit / cancel a bill requires a reason
- **Role:** Admin
- **Preconditions:** On `/admin/bills`, a bill exists.
- **Steps:** Edit the bill name (must enter **`ເຫດຜົນທີ່ແກ້ໄຂ`**) → save. Then cancel a bill
  (must enter **`ເຫດຜົນ`**) → **`ຢືນຢັນຍົກເລີກ`**.
- **Expected:** Both require a reason; changes apply.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-ADM-14 — Audit log records the reason
- **Role:** Admin
- **Preconditions:** TC-ADM-13 (or any reason-bearing edit) was just done.
- **Steps:** Open `/admin/audit-logs` → filter by action/entity → open the entry detail.
- **Expected:** The edit/cancel appears with the **`ເຫດຜົນ`** you typed, plus before/after state.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

---

## 6. Permission / Access control

### TC-PERM-01 — Waiter cannot access POS
- **Role:** Waiter
- **Preconditions:** Logged in as waiter.
- **Steps:** In the address bar go to `/pos`.
- **Expected:** Access is blocked (redirected away / unauthorized) — not the POS page.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-PERM-02 — Waiter cannot access Admin
- **Role:** Waiter
- **Preconditions:** Logged in as waiter.
- **Steps:** Go to `/admin`.
- **Expected:** Access is blocked.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-PERM-03 — Kitchen is limited to the kitchen app
- **Role:** Kitchen
- **Preconditions:** Logged in as kitchen.
- **Steps:** Go to `/pos`, `/admin`, and `/waiter`.
- **Expected:** All are blocked; only `/kitchen` is accessible.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

### TC-PERM-04 — Cashier cannot access Admin
- **Role:** Cashier
- **Preconditions:** Logged in as cashier.
- **Steps:** Go to `/admin`.
- **Expected:** Blocked; `/select` shows no Admin backend card.
- **Result:** ☐ Pass ☐ Fail ☐ Skip — **Note:** ____

---

_Last updated: 2026-06-15 · Labels verified against `srms/app/routes/**` and `srms/app/components/**`._
