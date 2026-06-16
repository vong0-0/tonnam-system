# docs/

Project documentation and quality-assurance material for TonNam SRMS.

## Contents

| File | What it is |
|---|---|
| [`manual-uat-test-cases.md`](./manual-uat-test-cases.md) | Manual **User Acceptance Testing** checklist for the staff app (`srms/`). Detailed test cases per role (Auth, Waiter, Kitchen, POS, Admin, plus permission checks). Each case has an ID, preconditions, steps, expected result, a Pass/Fail/Skip box, and a notes column. The app UI is in **Lao**, so the test labels quote the real Lao strings. |
| [`create-uat-form.gs`](./create-uat-form.gs) | A **Google Apps Script** that generates a Google Form version of the UAT checklist (in Lao), so testers can record results online instead of on paper. |

## Running the UAT form generator

`create-uat-form.gs` runs on Google's servers via Apps Script — not locally:

1. Go to <https://script.google.com> → **New project**.
2. Replace the default file contents with the contents of `create-uat-form.gs`.
3. Click **Run** and authorize the script when prompted.
4. Open the **Execution log** — it prints the generated form's **published URL** (for testers) and
   **edit URL** (for you).

## Prerequisites for manual UAT

- A running stack: `api/` (on :8080) and `srms/` (on :5173). See the
  [root README](../README.md#quick-start).
- Test accounts and seed data — see `api/`'s seed scripts (`npm run seed:daily`,
  `npm run e2e:users`) and the account notes inside `manual-uat-test-cases.md`.
