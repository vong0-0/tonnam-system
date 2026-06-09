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
    ])
  ]),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
