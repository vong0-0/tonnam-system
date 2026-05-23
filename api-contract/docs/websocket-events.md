# SRMS WebSocket Events

## Table of Contents

1. [Overview](#1-overview)
2. [Connection](#2-connection)
3. [Channels](#3-channels)
4. [Subscribe / Unsubscribe](#4-subscribe--unsubscribe)
5. [Events Reference](#5-events-reference)
6. [Subscription by Role](#6-subscription-by-role)
7. [Error Codes](#7-error-codes)

---

## 1. Overview

SRMS uses WebSocket to push real-time updates to connected clients without polling. Events are broadcast when state changes occur in the system — such as a new order arriving in the kitchen, a table status changing, or a payment being confirmed.

| Subsystem | Relies on WebSocket for |
|---|---|
| **POS System** (Cashier) | Table status changes, bill payment updates, menu availability |
| **Waiter App** (Waiter) | New order acknowledgements, order item cooked notifications, table status |
| **Kitchen System** (Kitchen) | Incoming orders, item-level status updates |
| **Admin Backend** (Admin) | System-wide monitoring of tables, orders, and menu changes |

---

## 2. Connection

### Endpoint

| Environment | URL |
|---|---|
| Production | `wss://api.srms.example.com/v1/ws` |
| Staging | `wss://staging-api.srms.example.com/v1/ws` |
| Development | `ws://localhost:3000/v1/ws` |

### Authentication

WebSocket connections use **ticket-based authentication**. A short-lived, one-time-use ticket is issued by the REST API and passed as a query parameter during the WebSocket handshake. Raw access tokens must not be sent in URLs.

**Step 1 — Obtain a ticket**

```
POST /v1/auth/ws-ticket
Authorization: Bearer <access_token>
```

Response:

```json
{
  "success": true,
  "data": {
    "ticket": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
    "expires_in": 30
  }
}
```

- `ticket` — opaque string, valid for **30 seconds**, **one-time use only**
- `expires_in` — seconds until the ticket expires

**Step 2 — Open the connection**

```
wss://api.srms.example.com/v1/ws?ticket={ws_ticket}
```

Example:

```
wss://api.srms.example.com/v1/ws?ticket=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4
```

**Step 3 — Server validates the ticket**

The server verifies the ticket, marks it as used, and upgrades the connection. If the ticket is invalid, expired, or already used, the connection is rejected with the appropriate error code before the WebSocket handshake completes.

---

## 3. Channels

Clients subscribe to channels to receive specific categories of events. Multiple subscriptions are allowed per connection.

| Channel | Description |
|---|---|
| `tables` | All table events across every table |
| `table:{table_id}` | Events for a specific table (e.g. `table:64f1a2b3c4d5e6f7a8b9c0d1`) |
| `orders` | All order events across every order |
| `order:{order_id}` | Events for a specific order (e.g. `order:64f1a2b3c4d5e6f7a8b9c0d2`) |
| `bill:{bill_id}` | Events for a specific bill (e.g. `bill:64f1a2b3c4d5e6f7a8b9c0d3`) |
| `menu` | Menu item availability changes |
| `kitchen` | Incoming orders and item-level updates for kitchen staff |

Channel access is role-enforced. Attempting to subscribe to a forbidden channel returns a `FORBIDDEN_CHANNEL` error without closing the connection.

---

## 4. Subscribe / Unsubscribe

All messages are JSON objects sent over the WebSocket connection.

### Subscribe

**Request** (Client → Server)

```json
{
  "event": "subscribe",
  "channel": "kitchen"
}
```

**Success response** (Server → Client)

```json
{
  "event": "subscribed",
  "channel": "kitchen"
}
```

**Error response — FORBIDDEN_CHANNEL** (Server → Client)

```json
{
  "event": "error",
  "code": "FORBIDDEN_CHANNEL",
  "channel": "kitchen",
  "message": "Your role does not have access to this channel."
}
```

---

### Unsubscribe

**Request** (Client → Server)

```json
{
  "event": "unsubscribe",
  "channel": "kitchen"
}
```

**Success response** (Server → Client)

```json
{
  "event": "unsubscribed",
  "channel": "kitchen"
}
```

**Error response — NOT_SUBSCRIBED** (Server → Client)

```json
{
  "event": "error",
  "code": "NOT_SUBSCRIBED",
  "channel": "kitchen",
  "message": "You are not subscribed to this channel."
}
```

---

## 5. Events Reference

All event messages share a common envelope:

```json
{
  "event": "<event_name>",
  "channel": "<channel>",
  "data": { ... },
  "timestamp": "2025-05-20T19:00:00Z"
}
```

---

### Table Events

#### `table:status_updated`

| Field | Value |
|---|---|
| **Trigger** | A table's status changes (e.g. AVAILABLE → OCCUPIED, OCCUPIED → PAID) |
| **Channels** | `tables`, `table:{table_id}` |
| **Subscribers** | ADMIN, CASHIER, WAITER |

```json
{
  "event": "table:status_updated",
  "channel": "tables",
  "data": {
    "table_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "table_name": "โต๊ะ 5",
    "status": "OCCUPIED",
    "previous_status": "RESERVED",
    "updated_by": {
      "id": "64f1a2b3c4d5e6f7a8b9c0aa",
      "username": "cashier01"
    }
  },
  "timestamp": "2025-05-20T18:45:00Z"
}
```

---

#### `table:merged`

| Field | Value |
|---|---|
| **Trigger** | Two or more tables (or groups) are merged into a single merge group |
| **Channels** | `tables` |
| **Subscribers** | ADMIN, CASHIER, WAITER |

```json
{
  "event": "table:merged",
  "channel": "tables",
  "data": {
    "merge_group_id": "64f1a2b3c4d5e6f7a8b9c0f1",
    "table_ids": [
      "64f1a2b3c4d5e6f7a8b9c0d1",
      "64f1a2b3c4d5e6f7a8b9c0d2"
    ],
    "merged_by": {
      "id": "64f1a2b3c4d5e6f7a8b9c0aa",
      "username": "cashier01"
    }
  },
  "timestamp": "2025-05-20T18:50:00Z"
}
```

---

#### `table:unmerged`

| Field | Value |
|---|---|
| **Trigger** | A merge group is dissolved and tables are returned to individual status |
| **Channels** | `tables` |
| **Subscribers** | ADMIN, CASHIER, WAITER |

```json
{
  "event": "table:unmerged",
  "channel": "tables",
  "data": {
    "merge_group_id": "64f1a2b3c4d5e6f7a8b9c0f1",
    "table_ids": [
      "64f1a2b3c4d5e6f7a8b9c0d1",
      "64f1a2b3c4d5e6f7a8b9c0d2"
    ],
    "unmerged_by": {
      "id": "64f1a2b3c4d5e6f7a8b9c0aa",
      "username": "cashier01"
    }
  },
  "timestamp": "2025-05-20T21:30:00Z"
}
```

---

#### `table:moved`

| Field | Value |
|---|---|
| **Trigger** | Bills and orders are moved from the source table to the target table via `POST /tables/{id}/move` |
| **Channels** | `tables`, `table:{table_id}` |
| **Subscribers** | ADMIN, CASHIER |

```json
{
  "event": "table:moved",
  "channel": "tables",
  "data": {
    "from_table": {
      "table_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "table_name": "โต๊ะ 1",
      "status": "AVAILABLE"
    },
    "to_table": {
      "table_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "table_name": "โต๊ะ 2",
      "status": "OCCUPIED"
    },
    "moved_by": {
      "id": "64f1a2b3c4d5e6f7a8b9c0bb",
      "username": "cashier01"
    }
  },
  "timestamp": "2025-05-20T10:15:00Z"
}
```

---

### Bill Events

#### `bill:created`

| Field | Value |
|---|---|
| **Trigger** | A new bill is created for a table |
| **Channels** | `bill:{bill_id}`, `table:{table_id}` |
| **Subscribers** | ADMIN, CASHIER, WAITER |

```json
{
  "event": "bill:created",
  "channel": "table:64f1a2b3c4d5e6f7a8b9c0d1",
  "data": {
    "bill_id": "64f1a2b3c4d5e6f7a8b9c0e1",
    "short_id": "B-0042",
    "table_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "table_name": "โต๊ะ 5",
    "name": "บิลโต๊ะ 5",
    "status": "OPEN",
    "created_by": {
      "id": "64f1a2b3c4d5e6f7a8b9c0aa",
      "username": "cashier01"
    }
  },
  "timestamp": "2025-05-20T18:55:00Z"
}
```

---

#### `bill:status_updated`

| Field | Value |
|---|---|
| **Trigger** | A bill's status changes (OPEN → PAID, OPEN → CANCELLED) |
| **Channels** | `bill:{bill_id}`, `table:{table_id}` |
| **Subscribers** | ADMIN, CASHIER, WAITER |

```json
{
  "event": "bill:status_updated",
  "channel": "bill:64f1a2b3c4d5e6f7a8b9c0e1",
  "data": {
    "bill_id": "64f1a2b3c4d5e6f7a8b9c0e1",
    "short_id": "B-0042",
    "table_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "status": "PAID",
    "previous_status": "OPEN"
  },
  "timestamp": "2025-05-20T20:10:00Z"
}
```

---

#### `bill:updated`

| Field | Value |
|---|---|
| **Trigger** | Bill details (e.g. name) are edited via `PATCH /bills/{id}` |
| **Channels** | `bill:{bill_id}` |
| **Subscribers** | ADMIN, CASHIER |

```json
{
  "event": "bill:updated",
  "channel": "bill:64f1a2b3c4d5e6f7a8b9c0e1",
  "data": {
    "bill_id": "64f1a2b3c4d5e6f7a8b9c0e1",
    "short_id": "B-0042",
    "changes": {
      "name": "บิลกลุ่มนักท่องเที่ยว"
    },
    "reason": "Customer requested name change.",
    "updated_by": {
      "id": "64f1a2b3c4d5e6f7a8b9c0aa",
      "username": "cashier01"
    }
  },
  "timestamp": "2025-05-20T19:30:00Z"
}
```

---

#### `bill:payment_confirmed`

| Field | Value |
|---|---|
| **Trigger** | A payment is applied to a bill via `POST /payments` |
| **Channels** | `bill:{bill_id}`, `table:{table_id}` |
| **Subscribers** | ADMIN, CASHIER |

```json
{
  "event": "bill:payment_confirmed",
  "channel": "bill:64f1a2b3c4d5e6f7a8b9c0e1",
  "data": {
    "bill_id": "64f1a2b3c4d5e6f7a8b9c0e1",
    "short_id": "B-0042",
    "payment_id": "64f1a2b3c4d5e6f7a8b9c0p1",
    "method": "CASH",
    "amount_paid": 500.00,
    "change_amount": 45.50,
    "remaining_amount": 0.00,
    "bill_status": "PAID"
  },
  "timestamp": "2025-05-20T21:05:00Z"
}
```

---

### Order Events

#### `order:new_order_received`

| Field | Value |
|---|---|
| **Trigger** | A new order is created and sent to the kitchen via `POST /orders` |
| **Channels** | `orders`, `order:{order_id}`, `kitchen` |
| **Subscribers** | ADMIN, CASHIER, WAITER, KITCHEN |

```json
{
  "event": "order:new_order_received",
  "channel": "kitchen",
  "data": {
    "order_id": "64f1a2b3c4d5e6f7a8b9c0c1",
    "bill_id": "64f1a2b3c4d5e6f7a8b9c0e1",
    "table_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "table_name": "โต๊ะ 5",
    "items": [
      {
        "item_id": "64f1a2b3c4d5e6f7a8b9c0i1",
        "menu_item_id": "64f1a2b3c4d5e6f7a8b9c0m1",
        "name": "Pad Thai",
        "quantity": 2,
        "notes": "No peanuts please."
      },
      {
        "item_id": "64f1a2b3c4d5e6f7a8b9c0i2",
        "menu_item_id": "64f1a2b3c4d5e6f7a8b9c0m2",
        "name": "Tom Yum Soup",
        "quantity": 1,
        "notes": null
      }
    ],
    "created_by": {
      "id": "64f1a2b3c4d5e6f7a8b9c0cc",
      "username": "waiter01"
    }
  },
  "timestamp": "2025-05-20T19:00:00Z"
}
```

---

#### `order:item_status_updated`

| Field | Value |
|---|---|
| **Trigger** | A kitchen staff member marks an item as `COOKED`, or ADMIN/CASHIER cancels an item |
| **Channels** | `orders`, `order:{order_id}`, `kitchen` |
| **Subscribers** | ADMIN, CASHIER, WAITER, KITCHEN |

```json
{
  "event": "order:item_status_updated",
  "channel": "order:64f1a2b3c4d5e6f7a8b9c0c1",
  "data": {
    "order_id": "64f1a2b3c4d5e6f7a8b9c0c1",
    "item_id": "64f1a2b3c4d5e6f7a8b9c0i1",
    "name": "Pad Thai",
    "status": "COOKED",
    "cancel_reason": null,
    "updated_by": {
      "id": "64f1a2b3c4d5e6f7a8b9c0kk",
      "username": "kitchen01"
    }
  },
  "timestamp": "2025-05-20T19:25:00Z"
}
```

---

#### `order:status_updated`

| Field | Value |
|---|---|
| **Trigger** | All items in an order are resolved (fully `COOKED` or `CANCELLED`), transitioning the order status |
| **Channels** | `orders`, `order:{order_id}`, `kitchen` |
| **Subscribers** | ADMIN, CASHIER, WAITER, KITCHEN |

```json
{
  "event": "order:status_updated",
  "channel": "order:64f1a2b3c4d5e6f7a8b9c0c1",
  "data": {
    "order_id": "64f1a2b3c4d5e6f7a8b9c0c1",
    "bill_id": "64f1a2b3c4d5e6f7a8b9c0e1",
    "table_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "status": "COOKED",
    "previous_status": "SENT_TO_KITCHEN"
  },
  "timestamp": "2025-05-20T19:27:00Z"
}
```

---

### Menu Events

#### `menu:item_availability_updated`

| Field | Value |
|---|---|
| **Trigger** | A menu item's `is_available` or `is_sold_out` flag is toggled via `PATCH /menu-items/{id}/availability` |
| **Channels** | `menu` |
| **Subscribers** | ADMIN, CASHIER, WAITER |

```json
{
  "event": "menu:item_availability_updated",
  "channel": "menu",
  "data": {
    "menu_item_id": "64f1a2b3c4d5e6f7a8b9c0m1",
    "name": "Pad Thai",
    "is_available": true,
    "is_sold_out": true,
    "updated_by": {
      "id": "64f1a2b3c4d5e6f7a8b9c0aa",
      "username": "cashier01"
    }
  },
  "timestamp": "2025-05-20T17:00:00Z"
}
```

---

### System Events

System events are sent directly to the affected connection without requiring a channel subscription.

#### `system:token_expired`

| Field | Value |
|---|---|
| **Trigger** | The access token used to authenticate the session has expired |
| **Channels** | *(direct — no subscription required)* |
| **Subscribers** | The affected client |

The client should use its refresh token to obtain a new access token, then open a new WebSocket connection with a fresh ticket.

```json
{
  "event": "system:token_expired",
  "data": {
    "message": "Your access token has expired. Please refresh and reconnect."
  },
  "timestamp": "2025-05-20T22:00:00Z"
}
```

---

#### `system:force_logout`

| Field | Value |
|---|---|
| **Trigger** | An ADMIN deactivates the user account or issues a force-logout |
| **Channels** | *(direct — no subscription required)* |
| **Subscribers** | The affected client |

The server closes the connection immediately after sending this event. The client must not attempt to reconnect without re-authenticating.

```json
{
  "event": "system:force_logout",
  "data": {
    "reason": "Your account has been deactivated by an administrator."
  },
  "timestamp": "2025-05-20T22:01:00Z"
}
```

---

## 6. Subscription by Role

| Channel | ADMIN | CASHIER | WAITER | KITCHEN |
|---|:---:|:---:|:---:|:---:|
| `tables` | ✓ | ✓ | ✓ | — |
| `table:{table_id}` | — | ✓ | ✓ | — |
| `orders` | ✓ | ✓ | ✓ | ✓ |
| `order:{order_id}` | — | ✓ | ✓ | ✓ |
| `bill:{bill_id}` | ✓ | ✓ (dynamic) | — | — |
| `menu` | ✓ | ✓ | ✓ | — |
| `kitchen` | — | — | — | ✓ |

**Notes:**

- **CASHIER** subscribes to `bill:{bill_id}` dynamically — on entering the bill detail view, it subscribes; on leaving, it unsubscribes. This avoids receiving bill events for every bill in the system.
- **KITCHEN** only needs `kitchen` and `orders`/`order:{order_id}` channels. It has no access to billing, payment, or table management channels.
- **WAITER** subscribes to `orders` to detect when items are cooked and notify the customer. Waiters do not subscribe to `bill:{bill_id}` or `kitchen`.
- System events (`system:token_expired`, `system:force_logout`) are delivered to all connected clients regardless of subscriptions.

---

## 7. Error Codes

These error codes appear in WebSocket error messages sent from the server. They do not close the connection unless noted.

| Code | Sent when | Closes connection? |
|---|---|:---:|
| `FORBIDDEN_CHANNEL` | The client attempted to subscribe to a channel its role cannot access | No |
| `NOT_SUBSCRIBED` | The client attempted to unsubscribe from a channel it is not currently subscribed to | No |
| `UNAUTHORIZED` | The WebSocket handshake was attempted without a ticket query parameter | Yes |
| `INVALID_TICKET` | The provided ticket is malformed, not found, or has expired | Yes |
| `TICKET_ALREADY_USED` | The provided ticket has already been consumed by a previous connection | Yes |
