import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { ChevronRight, LogOut } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/hooks/useAuth";
import { ROLE_ACCESS, SUBSYSTEM_META } from "@/constants/roles";

const DIAMOND_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Cpath d='M18 1 L35 18 L18 35 L1 18 Z' fill='none' stroke='rgba(255%2C255%2C255%2C0.07)' stroke-width='0.75'/%3E%3C%2Fsvg%3E\")";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "ADMIN",
  CASHIER: "CASHIER",
  WAITER: "WAITER",
  KITCHEN: "KITCHEN",
};

export default function SelectPage() {
  const user = useAuthStore((s) => s.user)!;
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const access = ROLE_ACCESS[user.role];

  if (access.length === 1) {
    return <Navigate to={access[0]!} replace />;
  }

  const initials =
    `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        style={{ backgroundImage: DIAMOND_PATTERN }}
        className="bg-green shrink-0"
      >
        {/* Mobile: compact horizontal bar */}
        <div className="flex lg:hidden flex-row items-center justify-between px-5 py-3 gap-3">
          {/* User info */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-paper/15 border border-paper/25 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-paper leading-none">
                {initials}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-paper leading-tight">
                {user.first_name} {user.last_name}
              </p>
              <span className="text-[10px] text-gold">
                {ROLE_LABEL[user.role] ?? user.role}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => setConfirmOpen(true)}
            className="p-1.5 text-paper/45 hover:text-paper/75 transition-colors duration-150 cursor-pointer"
          >
            <LogOut size={15} />
          </button>
        </div>

        {/* Desktop: full sidebar */}
        <div className="hidden lg:flex flex-col w-[500px] min-h-screen">
          {/* Center brand mark */}
          <div className="flex-1 flex flex-col items-center justify-center px-10 py-12 gap-4">
            {/* TN monogram */}
            <div className="flex items-end leading-none select-none mb-1">
              <span
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "88px",
                  lineHeight: 1,
                  color: "var(--color-paper)",
                  letterSpacing: "-0.03em",
                }}
              >
                T
              </span>
              <span
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "88px",
                  lineHeight: 1,
                  color: "var(--color-gold)",
                  letterSpacing: "-0.03em",
                  marginLeft: "-10px",
                }}
              >
                N
              </span>
            </div>

            {/* Restaurant name */}
            <p className="text-xs font-bold tracking-[0.35em] uppercase text-paper/90">
              TONNAM
            </p>

            {/* Divider */}
            <div className="w-10 h-px bg-paper/30" />

            {/* Lao name */}
            <p className="text-sm text-paper/70">ຕ້ນນ້ຳ</p>
          </div>

          {/* Bottom: user + logout */}
          <div className="px-8 pb-6 pt-6 border-t border-paper/10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-paper/10 border border-paper/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-paper leading-none">
                    {initials}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-paper leading-snug truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <span className="inline-flex items-center gap-1.5 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gold/15 border border-gold/25 text-gold">
                    <span className="w-1 h-1 rounded-full bg-gold shrink-0" />
                    {ROLE_LABEL[user.role] ?? user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setConfirmOpen(true)}
                className="flex items-center gap-1.5 text-xs text-paper/45 hover:text-paper/75 transition-colors duration-150 cursor-pointer shrink-0"
              >
                <LogOut size={13} />
                <span>ອອກ</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col bg-ink-50">
        <div className="w-full flex-1 flex flex-col items-center justify-center px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
          {/* Heading */}
          <div className="mb-6 lg:mb-8 text-center animate-in fade-in-0 slide-in-from-bottom-2 duration-300 fill-mode-both">
            <h1 className="text-xl font-bold text-ink-900 lg:text-2xl">
              ເລືອກລະບົບ
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              ທ່ານສາມາດເຂົ້າໃຊ້ລະບົບຕໍ່ໄປນີ້
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
            {access.map((route, index) => {
              const meta = SUBSYSTEM_META[route];
              if (!meta) return null;
              const Icon = meta.icon;
              const isLastOdd =
                access.length % 2 !== 0 && index === access.length - 1;

              return (
                <button
                  key={route}
                  onClick={() => navigate(route, { replace: true })}
                  className={[
                    "group bg-paper rounded-xl border border-ink-100 p-5 text-left cursor-pointer",
                    "hover:border-green hover:shadow-md transition-all duration-200 hover:-translate-y-px",
                    "animate-in fade-in-0 slide-in-from-bottom-3 duration-300 fill-mode-both",
                    isLastOdd ? "sm:col-span-2" : "",
                  ].join(" ")}
                  style={{ animationDelay: `${80 + index * 55}ms` }}
                >
                  <div
                    className={[
                      "flex items-center gap-4",
                      isLastOdd ? "sm:max-w-xs" : "",
                    ].join(" ")}
                  >
                    {/* Icon */}
                    <div className="w-11 h-11 rounded-lg bg-green-pale flex items-center justify-center shrink-0 group-hover:bg-green transition-colors duration-200">
                      {Icon && (
                        <Icon
                          size={20}
                          className="text-green group-hover:text-paper transition-colors duration-200"
                        />
                      )}
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-900">
                        {meta.label}
                      </p>
                      <p className="text-xs text-ink-500 mt-0.5 leading-snug">
                        {meta.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      size={15}
                      className="shrink-0 text-ink-200 group-hover:text-green transition-colors duration-200"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <footer className="px-6 text-center py-4 text-xs text-ink-300 sm:px-10 lg:px-14">
          © 2026 TonNam · ຕ້ນນ້ຳ
        </footer>
      </main>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="ອອກຈາກລະບົບ"
        description="ທ່ານຕ້ອງການອອກຈາກລະບົບຫຼືບໍ່?"
        confirmLabel="ອອກຈາກລະບົບ"
        cancelLabel="ຍົກເລີກ"
        variant="destructive"
        onConfirm={() => logout()}
      />
    </div>
  );
}
