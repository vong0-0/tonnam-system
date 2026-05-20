# srms-api-contract

## Project Overview

OpenAPI 3.0 specification for Smart Restaurant Management System (SRMS).
This repository contains API contracts, schemas, and documentation only.

## System Context

SRMS is an intelligent restaurant management system consisting of 4 subsystems:

**POS System**
Used by Cashier. Handles table management, bill creation, order management,
payment processing, and daily sales summary.

**Waiter App**
Used by Waiter. Handles taking orders at the table, sending orders to kitchen,
and receiving notifications when orders are ready.

**Kitchen System**
Used by Kitchen staff. Displays incoming orders, allows marking items as cooked
(partial or all at once), and sends WhatsApp notifications when items are ready.
Kitchen does not interact with POS or Waiter App directly.

**Admin Backend**
Used by Admin. Manages master data (menus, tables, users), views order history,
audit logs, and analytics (sales and menu performance).

## Actors

- ADMIN — full access including master data, analytics, audit logs
- CASHIER — POS, payments, table management, daily summary
- WAITER — take orders, view tables, receive kitchen notifications
- KITCHEN — view and mark orders, no access to billing or payments

## Key Business Concepts

- A Table can have multiple Bills
- A Bill contains multiple Orders
- An Order contains multiple OrderItems
- OrderItem status: COOKED or CANCELLED
- Order status: SENT_TO_KITCHEN → COOKED or CANCELLED
- Bill status: OPEN → PARTIALLY_PAID → PAID or CANCELLED
- Table status: AVAILABLE → RESERVED → OCCUPIED → PARTIALLY_PAID → PAID
- Tables can be merged into groups and unmerged
- Bills can be split into sub-bills (e.g. B-0001/A, B-0001/B)
- Payments support CASH, QR_PROMPTPAY, and MIXED methods
- All sensitive operations require reason + AuditLog entry

## Structure

- openapi/index.yaml — entry point
- openapi/paths/ — one file per resource
- openapi/components/schemas/ — reusable data models
- openapi/components/responses/ — reusable responses
- openapi/components/parameters/ — reusable parameters
- openapi/components/security/ — auth schemes
- openapi/webhooks/ — WebSocket events

## Commands

- Validate: npm run validate
- Preview: npm run preview
- Bundle: npm run bundle

## Must Follow

- OpenAPI version: 3.0.3
- All descriptions in English
- Always use $ref, never duplicate definitions
- Monetary values: type number format decimal
- All endpoints require BearerAuth except POST /auth/login
- Every endpoint has exactly one tag matching index.yaml
