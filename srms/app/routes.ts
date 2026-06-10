import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("unauthorized", "routes/unauthorized.tsx"),
  layout("layouts/guard.layout.tsx", [
    route("select", "routes/select.tsx"),
    route("admin", "routes/admin/index.tsx"),
    layout("layouts/waiter.layout.tsx", [
      route("waiter", "routes/waiter/index.tsx"),
      route("waiter/tables/:id", "routes/waiter/table-detail.tsx"),
      route("waiter/tables/:tableId/orders/new", "routes/waiter/order-new.tsx"),
      route("waiter/profile", "routes/profile/index.tsx")
    ]),
    layout("layouts/kitchen.layout.tsx", [
      route("kitchen", "routes/kitchen/index.tsx"),
      route("kitchen/order-history", "routes/kitchen/order-history.tsx"),
      route("kitchen/profile", "routes/kitchen/profile.tsx"),
    ])
  ]),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
