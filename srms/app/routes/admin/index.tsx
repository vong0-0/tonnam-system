import {
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, Receipt, BarChart3, Clock, RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSalesSummary, useMenuBestSellers } from "@/hooks/useAnalytics";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { useTableStatusSummary } from "@/hooks/useTables";
import { formatDate, DATE_FORMATS } from "@/lib/date";
import { formatNumber } from "@/lib/utils";
import type { HourlyBreakdown } from "@/types/analytics";

// ── Animation classes ──────────────────────────────────────────
const SLIDE_UP =
  "animate-in fade-in-0 slide-in-from-bottom-3 duration-500 fill-mode-both";
const FADE_IN = "animate-in fade-in-0 duration-300 fill-mode-both";

// ── Intersection Observer hook ─────────────────────────────────
// Fires once when the element enters the viewport, then unobserves.
function useInView(threshold = 0.05) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ── FadeIn wrapper ─────────────────────────────────────────────
// Wraps any content. Stays opacity-0 until IO fires, then animates.
// `slide` controls whether to include the translateY entrance (default: true).
function FadeIn({
  children,
  delay = 0,
  slide = true,
  className,
}: {
  children: ReactNode;
  delay?: number;
  slide?: boolean;
  className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={cn(inView ? (slide ? SLIDE_UP : FADE_IN) : "opacity-0", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────
export default function AdminDashboard() {
  const today = formatDate(new Date(), DATE_FORMATS.DATE_ISO);

  const { data: summary, isLoading: summaryLoading, refetch: refetchSales, isFetching: f1 } = useSalesSummary({
    period: "daily",
    date: today,
  });
  const { data: bestSellers, isLoading: bestSellersLoading, refetch: refetchBest, isFetching: f2 } =
    useMenuBestSellers({ period: "daily", date: today, limit: 8 });
  const { data: auditData, isLoading: auditLoading, refetch: refetchLogs, isFetching: f3 } = useAuditLogs({
    limit: 6,
  });
  const { data: tableData, isLoading: tablesLoading, refetch: refetchTables, isFetching: f4 } = useTableStatusSummary();

  const isFetching = f1 || f2 || f3 || f4;
  function handleRefresh() {
    refetchSales();
    refetchBest();
    refetchLogs();
    refetchTables();
  }

  const totalRevenue = summary?.total_revenue ?? 0;
  const cashAmount = summary?.payment_breakdown.cash ?? 0;
  const qrAmount = summary?.payment_breakdown.qr_promptpay ?? 0;

  const paymentData = [
    { name: "ກີບສົດ", value: cashAmount, color: "#00bba7" },
    { name: "QR PromptPay", value: qrAmount, color: "#C8A84B" },
  ];

  const chartData = summary?.breakdown
    ? (summary.breakdown as HourlyBreakdown[]).map((b) => ({
        label: `${String(b.hour).padStart(2, "0")}:00`,
        revenue: b.revenue,
      }))
    : [];

  const tables = tableData?.data ?? [];
  const available = tables.filter((t) => t.status === "AVAILABLE").length;
  const reserved = tables.filter((t) => t.status === "RESERVED").length;
  const occupied = tables.filter((t) => t.status === "OCCUPIED").length;
  const paid = tables.filter((t) => t.status === "PAID").length;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <FadeIn delay={0}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink-900">Dashboard</h1>
            <p className="mt-0.5 text-sm text-ink-500">
              {formatDate(new Date(), DATE_FORMATS.DATE)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="h-9 gap-1.5 border-ink-300 bg-paper text-ink-700"
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            ໂຫລດໃໝ່
          </Button>
        </div>
      </FadeIn>

      {/* ── KPI Cards — each card observed individually ── */}
      <div className="grid grid-cols-4 gap-4">
        <FadeIn delay={60}>
          <StatCard
            icon={<TrendingUp size={15} />}
            label="ຍອດລວມ"
            iconClass="text-green"
            isLoading={summaryLoading}
          >
            <span className="text-3xl font-bold text-ink-900">
              {formatNumber(totalRevenue)}
            </span>
            <span className="ml-1 text-sm text-ink-500">ກີບ</span>
          </StatCard>
        </FadeIn>

        <FadeIn delay={110}>
          <StatCard
            icon={<Receipt size={15} />}
            label="ຈຳນວນບິນ"
            iconClass="text-gold"
            isLoading={summaryLoading}
          >
            <span className="text-3xl font-bold text-ink-900">
              {summary?.total_bills ?? 0}
            </span>
            <span className="ml-1 text-sm text-ink-500">ບິນ</span>
          </StatCard>
        </FadeIn>

        <FadeIn delay={160}>
          <StatCard
            icon={<BarChart3 size={15} />}
            label="ຄ່າສະເລ່ຍ / ບິນ"
            iconClass="text-ink-400"
            isLoading={summaryLoading}
          >
            <span className="text-3xl font-bold text-ink-900">
              {formatNumber(summary?.average_bill_amount ?? 0)}
            </span>
            <span className="ml-1 text-sm text-ink-500">ກີບ</span>
          </StatCard>
        </FadeIn>

        <FadeIn delay={210}>
          <StatCard
            icon={<Clock size={15} />}
            label="ຊ່ວງຂາຍດີ"
            iconClass="text-ink-400"
            isLoading={summaryLoading}
          >
            <span className="text-3xl font-bold text-ink-900">
              {summary?.peak.label || "—"}
            </span>
          </StatCard>
        </FadeIn>
      </div>

      {/* ── Revenue Trend Chart ── */}
      <FadeIn delay={270}>
        <Card>
          <CardContent className="p-5">
            <p className="mb-4 text-base font-semibold uppercase tracking-wide text-ink-500">
              ແນວໂນ້ມລາຍໄດ້
            </p>
            {summaryLoading ? (
              <Skeleton className="h-[200px] w-full rounded" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#DEE2E6"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#6C757D" }}
                    tickLine={false}
                    axisLine={false}
                    interval={2}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6C757D" }}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tickFormatter={(v: number) => {
                      if (v >= 1_000_000)
                        return `${(v / 1_000_000).toFixed(1)}M`;
                      if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
                      return String(v);
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const val = payload[0]?.value;
                      return (
                        <div className="rounded-lg border border-ink-100 bg-white p-3 text-xs shadow-md">
                          <p className="mb-1 text-ink-500">{label}</p>
                          <p className="font-semibold text-ink-900">
                            {typeof val === "number" ? formatNumber(val) : "—"}{" "}
                            ກີບ
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#1B4332"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* ── Payment Breakdown + Table Status ── */}
      <FadeIn delay={330}>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="mb-4 text-base font-semibold uppercase tracking-wide text-ink-500">
                ການຊຳລະເງິນ
              </p>
              {summaryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Skeleton className="h-[176px] w-[176px] rounded-full" />
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="relative mx-auto h-[176px] w-[176px] text-teal-500">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={
                            totalRevenue > 0
                              ? paymentData
                              : [{ name: "", value: 1, color: "#DEE2E6" }]
                          }
                          cx="50%"
                          cy="50%"
                          innerRadius={54}
                          outerRadius={82}
                          dataKey="value"
                          paddingAngle={totalRevenue > 0 ? 3 : 0}
                          startAngle={90}
                          endAngle={-270}
                          strokeWidth={0}
                        >
                          {(totalRevenue > 0
                            ? paymentData
                            : [{ name: "", value: 1, color: "#DEE2E6" }]
                          ).map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        {totalRevenue > 0 && (
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const item = payload[0];
                              return (
                                <div className="rounded-lg border border-ink-100 bg-white p-2.5 text-xs shadow-md">
                                  <p className="text-ink-500">{item.name}</p>
                                  <p className="font-semibold text-ink-900">
                                    {formatNumber(item.value as number)} ກີບ
                                  </p>
                                </div>
                              );
                            }}
                          />
                        )}
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-ink-900">
                        {formatNumber(totalRevenue)}
                      </span>
                      <span className="text-xs text-ink-400">ລວມ</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {paymentData.map((entry) => {
                      const pct =
                        totalRevenue > 0
                          ? Math.round((entry.value / totalRevenue) * 100)
                          : 0;
                      return (
                        <div
                          key={entry.name}
                          className="flex items-center gap-2.5 text-sm"
                        >
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="flex-1 text-ink-700">
                            {entry.name}
                          </span>
                          <span className="font-medium text-ink-900">
                            {formatNumber(entry.value)} ກີບ
                          </span>
                          <span className="w-9 text-right text-xs text-ink-400">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold uppercase tracking-wide text-ink-500">
                  ສະຖານະໂຕະ
                </p>
                {!tablesLoading && (
                  <span className="text-base text-ink-400">
                    {tables.length} ໂຕະ
                  </span>
                )}
              </div>
              {tablesLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <TableStatusCard
                    count={available}
                    label="ວ່າງ"
                    bgClass="bg-teal-100"
                    colorClass="text-teal-800"
                  />
                  <TableStatusCard
                    count={reserved}
                    label="ຈອງ"
                    bgClass="bg-blue-100"
                    colorClass="text-blue-800"
                  />
                  <TableStatusCard
                    count={occupied}
                    label="ມີລູກຄ້າ"
                    bgClass="bg-amber-100"
                    colorClass="text-amber-800"
                  />
                  <TableStatusCard
                    count={paid}
                    label="ຊຳລະແລ້ວ"
                    bgClass="bg-slate-100"
                    colorClass="text-slate-800"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      {/* ── Best Sellers + Audit Log ── */}
      <FadeIn delay={390}>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="mb-4 text-base font-semibold uppercase tracking-wide text-ink-500">
                ເມນູຍອດນິຍົມ
              </p>
              {bestSellersLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-full rounded" />
                      <Skeleton className="h-1 w-3/4 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : !bestSellers?.items.length ? (
                <p className="py-6 text-center text-sm text-ink-400">
                  ບໍ່ມີຂໍ້ມູນ
                </p>
              ) : (
                <div>
                  {bestSellers.items.map((item, index) => {
                    const maxQty = bestSellers.items[0].total_quantity_sold;
                    const barPct =
                      maxQty > 0
                        ? (item.total_quantity_sold / maxQty) * 100
                        : 0;
                    return (
                      <FadeIn
                        key={item.menu_item_id}
                        delay={430 + index * 35}
                        slide={false}
                      >
                        <div
                          className={`py-3 ${index > 0 ? "border-t border-ink-100" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-5 shrink-0 text-sm font-bold ${item.rank === 1 ? "text-amber-500" : "text-ink-300"}`}
                            >
                              {item.rank}
                            </span>
                            <span className="flex-1 truncate text-sm font-medium text-ink-900">
                              {item.name}
                            </span>
                            <span className="shrink-0 text-sm font-semibold text-ink-700">
                              x{item.total_quantity_sold}
                            </span>
                          </div>
                          <div className="ml-8 mt-1.5 h-1 overflow-hidden rounded-full bg-ink-100">
                            <div
                              className="h-1 origin-left rounded-full bg-gold fill-mode-both [animation:bar-grow_0.55s_cubic-bezier(0.22,1,0.36,1)_forwards]"
                              style={
                                {
                                  width: `${barPct}%`,
                                  animationDelay: `${460 + index * 35}ms`,
                                } as CSSProperties
                              }
                            />
                          </div>
                        </div>
                      </FadeIn>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="mb-4 text-base font-semibold uppercase tracking-wide text-ink-500">
                ກິດຈະກຳລ່າສຸດ
              </p>
              {auditLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded" />
                  ))}
                </div>
              ) : !auditData?.data.length ? (
                <p className="py-6 text-center text-sm text-ink-400">
                  ບໍ່ມີຂໍ້ມູນ
                </p>
              ) : (
                <div className="space-y-2">
                  {auditData.data.map((log, index) => {
                    const isDestructive = /CANCEL|DELETE/.test(log.action);
                    return (
                      <FadeIn
                        key={log.id}
                        delay={430 + index * 45}
                        slide={false}
                      >
                        <div
                          className={`rounded-r-lg border-l-[3px] bg-ink-50 px-3 py-2.5 ${isDestructive ? "border-l-rose-400" : "border-l-emerald-400"}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-ink-900">
                                {log.action.replace(/_/g, " ")} ·{" "}
                                <span className="font-normal text-ink-500">
                                  @{log.actor.username}
                                </span>
                              </p>
                              <p className="mt-0.5 text-xs text-ink-500">
                                {ENTITY_LABELS[log.entity_name] ??
                                  log.entity_name}
                                {log.reason && (
                                  <span className="text-ink-400">
                                    {" "}
                                    · {log.reason}
                                  </span>
                                )}
                              </p>
                            </div>
                            <span className="shrink-0 text-xs text-ink-400">
                              {formatDate(
                                log.created_at,
                                DATE_FORMATS.DATE_TIME,
                              )}
                            </span>
                          </div>
                        </div>
                      </FadeIn>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

const ENTITY_LABELS: Record<string, string> = {
  Bill: "ບິນ",
  Order: "ອໍເດີ",
  OrderItem: "ລາຍການ",
  Table: "ໂຕະ",
  TableMergeGroup: "ລວມໂຕະ",
  Payment: "ການຊຳລະ",
};

function StatCard({
  icon,
  label,
  iconClass,
  isLoading,
  children,
}: {
  icon: ReactNode;
  label: string;
  iconClass: string;
  isLoading: boolean;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <div className={`flex items-center gap-1.5 ${iconClass}`}>
          {icon}
          <span className="text-xs font-medium text-ink-500">{label}</span>
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-32 rounded" />
        ) : (
          <div className="flex items-baseline">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}

function TableStatusCard({
  count,
  label,
  bgClass,
  colorClass,
}: {
  count: number;
  label: string;
  bgClass: string;
  colorClass: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl p-4 ${bgClass}`}
    >
      <span className={`text-2xl font-bold ${colorClass}`}>{count}</span>
      <span className={`mt-1 text-xs ${colorClass} opacity-70`}>{label}</span>
    </div>
  );
}
