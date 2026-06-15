import { Settings, Monitor, HandPlatter, ChefHat } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export const ROLES = {
  ADMIN: "ADMIN",
  CASHIER: "CASHIER",
  WAITER: "WAITER",
  KITCHEN: "KITCHEN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_REDIRECT: Record<Role, string> = {
  ADMIN: ROUTES.SELECT,
  CASHIER: ROUTES.SELECT,
  WAITER: ROUTES.WAITER,
  KITCHEN: ROUTES.KITCHEN,
};

export const ROLE_ACCESS: Record<Role, string[]> = {
  ADMIN: [ROUTES.ADMIN, ROUTES.POS, ROUTES.WAITER, ROUTES.KITCHEN],
  CASHIER: [ROUTES.POS, ROUTES.WAITER, ROUTES.KITCHEN],
  WAITER: [ROUTES.WAITER],
  KITCHEN: [ROUTES.KITCHEN],
};

export const ROUTE_GUARDS: Record<string, Role[]> = {
  [ROUTES.SELECT]: [],
  [ROUTES.POS]: [ROLES.CASHIER, ROLES.ADMIN],
  [ROUTES.WAITER]: [ROLES.WAITER, ROLES.ADMIN, ROLES.CASHIER],
  [ROUTES.KITCHEN]: [ROLES.KITCHEN, ROLES.ADMIN, ROLES.CASHIER],
  [ROUTES.ADMIN]: [ROLES.ADMIN],
};

export const SUBSYSTEM_META: Record<
  string,
  {
    label: string;
    description: string;
    icon: LucideIcon;
  }
> = {
  [ROUTES.ADMIN]: {
    label: "ລະບົບຫຼັງບ້ານ",
    description: "ຈັດການລະບົບ, ວິເຄາະຂໍ້ມູນ",
    icon: Settings,
  },
  [ROUTES.POS]: {
    label: "ລະບົບ POS",
    description: "ຈັດການໂຕະ, ບິນ ແລະ ການຊຳລະເງິນ",
    icon: Monitor,
  },
  [ROUTES.WAITER]: {
    label: "ລະບົບພະນັກງານເສີບ",
    description: "ຮັບອໍເດີ ແລະ ຕິດຕາມສະຖານະ",
    icon: HandPlatter,
  },
  [ROUTES.KITCHEN]: {
    label: "ລະບົບຫ້ອງຄົວ",
    description: "ເບິ່ງ ແລະ ອັບເດດລາຍການອາຫານ",
    icon: ChefHat,
  },
};
