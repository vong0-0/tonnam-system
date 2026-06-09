import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("unauthorized", "routes/unauthorized.tsx"),
  layout("layouts/guard.layout.tsx", [
    route("select", "routes/select.tsx"),
    route("admin", "routes/admin/index.tsx"),
  ]),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
