import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("unauthorized", "routes/unauthorized.tsx"),
  layout("layouts/guard.layout.tsx", [
    route("select", "routes/select.tsx"),
    layout("layouts/admin.layout.tsx", [
      route("admin", "routes/admin/index.tsx"),
      route("admin/tables", "routes/admin/tables.tsx"),
      route("admin/menu", "routes/admin/menu.tsx"),
      route("admin/users", "routes/admin/users.tsx"),
    ]),
    layout("layouts/waiter.layout.tsx", [
      route("waiter", "routes/waiter/index.tsx"),
      route("waiter/tables/:id", "routes/waiter/table-detail.tsx"),
      route("waiter/tables/:tableId/orders/new", "routes/waiter/order-new.tsx"),
      route("waiter/reservations", "routes/waiter/reservations.tsx"),
      route("waiter/profile", "routes/profile/index.tsx")
    ]),
    layout("layouts/kitchen.layout.tsx", [
      route("kitchen", "routes/kitchen/index.tsx"),
      route("kitchen/order-history", "routes/kitchen/order-history.tsx"),
      route("kitchen/profile", "routes/kitchen/profile.tsx"),
    ]),
    layout("layouts/pos.layout.tsx", [
      route("pos", "routes/pos/index.tsx"),
      route("pos/bills", "routes/pos/bills.tsx"),
      route("pos/summary", "routes/pos/summary.tsx"),
      route("pos/reservations", "routes/pos/reservations.tsx"),
      route("pos/menu", "routes/pos/menu.tsx"),
      route("pos/profile", "routes/pos/profile.tsx"),
    ])
  ]),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
