# SRMS API Contract

The **OpenAPI 3.0 specification** for the TonNam Smart Restaurant Management System (SRMS) — the
**source of truth** for the backend API. It defines every endpoint, request/response shape, and
error format for the POS, Waiter, Kitchen, and Admin systems.

Both the backend (`api/`) and the frontends (`srms/`, `web/`) are expected to follow this spec. When
the API changes, **update this contract first**, then the server, then the clients.

- **Spec format:** OpenAPI **3.0.3** (YAML)
- **Title / version:** `SRMS API` v1.0.0
- **Tooling:** [Redocly CLI](https://redocly.com/docs/cli)

---

## Structure

The spec is split across multiple files and assembled from a single entry point.

```
api-contract/
├── openapi/
│   ├── index.yaml          # entry point — info, servers, $ref to paths & components
│   ├── paths/              # one file per resource group (12 files)
│   │   ├── auth.yaml
│   │   ├── users.yaml
│   │   ├── tables.yaml
│   │   ├── table-merge-groups.yaml
│   │   ├── menu-categories.yaml
│   │   ├── menu-items.yaml
│   │   ├── reservations.yaml
│   │   ├── bills.yaml
│   │   ├── orders.yaml
│   │   ├── payments.yaml
│   │   ├── audit-logs.yaml
│   │   └── analytics.yaml
│   └── components/
│       ├── schemas/        # reusable data models (Bill, Order, Payment, Table, User, ...)
│       ├── parameters/     # reusable query/path parameters
│       ├── responses/      # reusable responses (incl. ProblemDetail errors)
│       └── security/       # auth schemes (Bearer JWT)
├── redocly.yaml            # Redocly CLI config
└── package.json
```

---

## Requirements

- **Node.js 20+** and **npm** (only needed to run the Redocly tooling)

```bash
npm install
```

## Commands

| Command | Description |
|---|---|
| `npm run validate` | Lint the spec — `redocly lint openapi/index.yaml` |
| `npm run bundle` | Bundle the multi-file spec into one file — `dist/openapi.yaml` |
| `npm run preview` | Build and open rendered HTML docs (`dist/index.html`) |

> `dist/` is git-ignored — it is generated output from `bundle`/`preview`.

---

## How it's used

- **`api/`** implements these endpoints (Express routers/controllers/services) under the `/v1`
  prefix and returns the response envelope and `ProblemDetail` errors defined here.
- **`srms/` / `web/`** rely on these shapes when typing services and hooks.
- Treat this spec as authoritative: if code and contract disagree, fix the mismatch — never assume
  the API shape from memory.
