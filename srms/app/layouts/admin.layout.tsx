import { Outlet } from "react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar, {
  type SidebarNavGroup,
} from "@/components/common/app-sidebar";
import AppHeader from "@/components/common/AppHeader";
import { ROUTES } from "@/constants/routes";
import {
  LayoutDashboard,
  BarChart2,
  LayoutGrid,
  UtensilsCrossed,
  Users,
  CalendarCheck,
  Receipt,
  ClipboardList,
} from "lucide-react";

const ADMIN_NAV: SidebarNavGroup[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: ROUTES.ADMIN,
        icon: LayoutDashboard,
        end: true,
      },
      { label: "ວິເຄາະຂໍ້ມູນ", href: ROUTES.ADMIN_ANALYTICS, icon: BarChart2 },
      { label: "ໂຕະ", href: ROUTES.ADMIN_TABLES, icon: LayoutGrid },
      { label: "ເມນູ", href: ROUTES.ADMIN_MENU, icon: UtensilsCrossed },
      { label: "ຜູ້ໃຊ້", href: ROUTES.ADMIN_USERS, icon: Users },
      { label: "ການຈອງ", href: ROUTES.ADMIN_RESERVATIONS, icon: CalendarCheck },
      { label: "ບິນ", href: ROUTES.ADMIN_BILLS, icon: Receipt },
      {
        label: "Audit Logs",
        href: ROUTES.ADMIN_AUDIT_LOGS,
        icon: ClipboardList,
      },
    ],
  },
];

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <AppSidebar navGroups={ADMIN_NAV} />
      <SidebarInset className="bg-ink-50">
        <AppHeader navGroups={ADMIN_NAV} />
        <div className="px-6 py-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
