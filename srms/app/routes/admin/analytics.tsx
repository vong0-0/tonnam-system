import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import {
  TrendingUp,
  Receipt,
  ShoppingCart,
  BarChart3,
  RefreshCw,
  TrendingDown,
  Minus,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";
import { AppSelect } from "@/components/common/AppSelect";
import { DatePickerFilter } from "@/components/common/DatePickerFilter";
import {
  useSalesSummary,
  useMenuBestSellers,
  useSalesComparison,
  useSalesByCategory,
  useMenuDeadItems,
  useMenuMix,
} from "@/hooks/useAnalytics";
import { formatDate, DATE_FORMATS, getPreviousPeriodDate, getPeriodRange } from "@/lib/date";
import type {
  AnalyticsPeriod,
  HourlyBreakdown,
  DailyBreakdown,
  MonthlyBreakdown,
} from "@/types/analytics";

// ── Animation helpers ──────────────────────────────────────────
const SLIDE_UP =
  "animate-in fade-in-0 slide-in-from-bottom-3 duration-500 fill-mode-both";
const FADE_IN = "animate-in fade-in-0 duration-300 fill-mode-both";

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

// ── Period options ─────────────────────────────────────────────
const PERIOD_OPTIONS = [
  { value: "daily",   label: "ລາຍວັນ" },
  { value: "weekly",  label: "ລາຍອາທິດ" },
  { value: "monthly", label: "ລາຍເດືອນ" },
  { value: "yearly",  label: "ລາຍປີ" },
];

// ── Y-axis tick formatter ──────────────────────────────────────
function formatTick(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

// ── Breakdown → chart data ─────────────────────────────────────
function toChartData(
  breakdown: HourlyBreakdown[] | DailyBreakdown[] | MonthlyBreakdown[] | undefined,
): { label: string; revenue: number }[] {
  if (!breakdown?.length) return [];
  const first = breakdown[0];
  if ("hour" in first) {
    return (breakdown as HourlyBreakdown[]).map((b) => ({
      label: `${String(b.hour).padStart(2, "0")}:00`,
      revenue: b.revenue,
    }));
  }
  if ("day" in first) {
    return (breakdown as DailyBreakdown[]).map((b) => ({
      label: b.day,
      revenue: b.revenue,
    }));
  }
  return (breakdown as MonthlyBreakdown[]).map((b) => ({
    label: b.month,
    revenue: b.revenue,
  }));
}

// ── Main page ──────────────────────────────────────────────────
export default function AdminAnalytics() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("daily");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const dateStr  = formatDate(selectedDate, DATE_FORMATS.DATE_ISO);
  const prevDate = getPreviousPeriodDate(period, dateStr);

  const { start: rangeStart, end: rangeEnd } = getPeriodRange(period, dateStr);
  const rangeLabel =
    period === "daily"
      ? formatDate(rangeStart, DATE_FORMATS.DATE)
      : `${formatDate(rangeStart, DATE_FORMATS.DATE)} – ${formatDate(rangeEnd, DATE_FORMATS.DATE)}`;

  const { data: summary,     isLoading: loadingSummary,    isFetching: f1, refetch: r1 } =
    useSalesSummary({ period, date: dateStr });
  const { data: comparison,  isLoading: loadingComparison, isFetching: f2, refetch: r2 } =
    useSalesComparison({ period, current_date: dateStr, previous_date: prevDate });
  const { data: byCategory,  isLoading: loadingCategory,   isFetching: f3, refetch: r3 } =
    useSalesByCategory({ period, date: dateStr });
  const { data: bestSellers, isLoading: loadingBest,       isFetching: f4, refetch: r4 } =
    useMenuBestSellers({ period, date: dateStr, limit: 10 });
  const { data: menuMix,     isLoading: loadingMix,        isFetching: f5, refetch: r5 } =
    useMenuMix({ period, date: dateStr });
  const { data: deadItems,   isLoading: loadingDead,       isFetching: f6, refetch: r6 } =
    useMenuDeadItems(
      period !== "daily"
        ? { period: period as Exclude<AnalyticsPeriod, "daily">, date: dateStr }
        : null,
    );

  const isFetching = f1 || f2 || f3 || f4 || f5 || f6;
  function handleRefresh() {
    r1(); r2(); r3(); r4(); r5(); r6();
  }

  // Chart data
  const chartData = toChartData(summary?.breakdown);
  const totalRevenue = summary?.total_revenue ?? 0;
  const cashAmount   = summary?.payment_breakdown.cash ?? 0;
  const qrAmount     = summary?.payment_breakdown.qr_promptpay ?? 0;
  const paymentData  = [
    { name: "ກີບສົດ",       value: cashAmount, color: "#00bba7" },
    { name: "QR PromptPay", value: qrAmount,   color: "#C8A84B" },
  ];

  const categoryData = byCategory?.categories.map((c) => ({
    category_name: c.category_name,
    revenue: c.revenue,
    percentage: c.percentage,
  })) ?? [];
  const categoryChartHeight = Math.max(160, categoryData.length * 44);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <FadeIn delay={0}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink-900">Analytics</h1>
            <p className="mt-0.5 text-sm text-ink-500">{rangeLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <AppSelect
              value={period}
              onValueChange={(v) => setPeriod(v as AnalyticsPeriod)}
              options={PERIOD_OPTIONS}
              triggerClassName="w-36 h-9 border-ink-300 bg-paper"
            />
            <DatePickerFilter
              value={selectedDate}
              onChange={(d) => { if (d) setSelectedDate(d); }}
              className="w-44"
            />
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
        </div>
      </FadeIn>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <FadeIn delay={60}>
          <StatCard icon={<TrendingUp size={15} />} label="ລາຍຮັບທັງໝົດ" iconClass="text-green" isLoading={loadingSummary}>
            <span className="text-3xl font-bold text-ink-900">{formatNumber(totalRevenue)}</span>
            <span className="ml-1 text-sm text-ink-500">ກີບ</span>
          </StatCard>
        </FadeIn>
        <FadeIn delay={110}>
          <StatCard icon={<Receipt size={15} />} label="ຈຳນວນບິນ" iconClass="text-gold" isLoading={loadingSummary}>
            <span className="text-3xl font-bold text-ink-900">{summary?.total_bills ?? 0}</span>
            <span className="ml-1 text-sm text-ink-500">ບິນ</span>
          </StatCard>
        </FadeIn>
        <FadeIn delay={160}>
          <StatCard icon={<ShoppingCart size={15} />} label="ຈຳນວນອໍເດີ" iconClass="text-ink-400" isLoading={loadingSummary}>
            <span className="text-3xl font-bold text-ink-900">{summary?.total_orders ?? 0}</span>
            <span className="ml-1 text-sm text-ink-500">ອໍເດີ</span>
          </StatCard>
        </FadeIn>
        <FadeIn delay={210}>
          <StatCard icon={<BarChart3 size={15} />} label="ສະເລ່ຍ / ບິນ" iconClass="text-ink-400" isLoading={loadingSummary}>
            <span className="text-3xl font-bold text-ink-900">{formatNumber(summary?.average_bill_amount ?? 0)}</span>
            <span className="ml-1 text-sm text-ink-500">ກີບ</span>
          </StatCard>
        </FadeIn>
      </div>

      {/* ── Revenue Trend + Payment Breakdown ── */}
      <FadeIn delay={270}>
        <div className="grid grid-cols-4 gap-4">
          {/* Revenue Trend */}
          <Card className="col-span-3">
            <CardContent className="p-5">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500">
                ແນວໂນ້ມລາຍໄດ້
              </p>
              {loadingSummary ? (
                <Skeleton className="h-[220px] w-full rounded" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DEE2E6" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#6C757D" }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#6C757D" }}
                      tickLine={false}
                      axisLine={false}
                      width={56}
                      tickFormatter={formatTick}
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
                              {typeof val === "number" ? formatNumber(val) : "—"} ກີບ
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="revenue" fill="#1B4332" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Payment Breakdown */}
          <Card>
            <CardContent className="p-5">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500">
                ການຊຳລະເງິນ
              </p>
              {loadingSummary ? (
                <div className="flex flex-col items-center gap-4">
                  <Skeleton className="h-[176px] w-[176px] rounded-full" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="relative mx-auto h-[176px] w-[176px]">
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
                        <div key={entry.name} className="flex items-center gap-2.5 text-sm">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="flex-1 text-ink-700">{entry.name}</span>
                          <span className="font-medium text-ink-900">
                            {formatNumber(entry.value)} ກີບ
                          </span>
                          <span className="w-9 text-right text-xs text-ink-400">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      {/* ── Period Comparison ── */}
      <FadeIn delay={330}>
        <Card>
          <CardContent className="p-0">
            <div className="px-5 pt-5 pb-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-ink-500">
                ປຽບທຽບກັບໄລຍະກ່ອນ
              </p>
            </div>
            {loadingComparison ? (
              <div className="grid grid-cols-3 divide-x divide-ink-100 border-t border-ink-100">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex flex-col gap-2 p-5">
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-8 w-28 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                ))}
              </div>
            ) : comparison ? (
              <div className="grid grid-cols-3 divide-x divide-ink-100 border-t border-ink-100">
                <ComparisonMetric
                  label="ລາຍຮັບ"
                  current={formatNumber(comparison.current.total_revenue)}
                  previous={formatNumber(comparison.previous.total_revenue)}
                  unit="ກີບ"
                  changePercent={comparison.changes.revenue_change_percent}
                />
                <ComparisonMetric
                  label="ຈຳນວນບິນ"
                  current={String(comparison.current.total_bills)}
                  previous={String(comparison.previous.total_bills)}
                  unit="ບິນ"
                  changePercent={comparison.changes.bills_change_percent}
                />
                <ComparisonMetric
                  label="ຈຳນວນອໍເດີ"
                  current={String(comparison.current.total_orders)}
                  previous={String(comparison.previous.total_orders)}
                  unit="ອໍເດີ"
                  changePercent={comparison.changes.orders_change_percent}
                />
              </div>
            ) : (
              <p className="pb-5 text-center text-sm text-ink-400">ບໍ່ມີຂໍ້ມູນ</p>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* ── Sales by Category ── */}
      <FadeIn delay={390}>
        <Card>
          <CardContent className="p-5">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500">
              ລາຍໄດ້ຕາມໝວດໝູ່
            </p>
            {loadingCategory ? (
              <Skeleton className="w-full rounded" style={{ height: categoryChartHeight }} />
            ) : !categoryData.length ? (
              <p className="py-6 text-center text-sm text-ink-400">ບໍ່ມີຂໍ້ມູນ</p>
            ) : (
              <ResponsiveContainer width="100%" height={categoryChartHeight}>
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#DEE2E6" horizontal={false} />
                  <YAxis
                    dataKey="category_name"
                    type="category"
                    width={120}
                    tick={{ fontSize: 12, fill: "#495057" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#6C757D" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatTick}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const val = payload[0]?.value;
                      const pct = payload[0]?.payload?.percentage as number | undefined;
                      return (
                        <div className="rounded-lg border border-ink-100 bg-white p-3 text-xs shadow-md">
                          <p className="mb-1 text-ink-500">{label}</p>
                          <p className="font-semibold text-ink-900">
                            {typeof val === "number" ? formatNumber(val) : "—"} ກີບ
                          </p>
                          {pct !== undefined && (
                            <p className="text-ink-400">{pct.toFixed(1)}% ຂອງທັງໝົດ</p>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="revenue" fill="#1B4332" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* ── Menu Performance Tabs ── */}
      <FadeIn delay={450}>
        <Card>
          <CardContent className="p-5">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500">
              ປະສິດທິພາບເມນູ
            </p>
            <Tabs defaultValue="best-sellers">
              <TabsList className="mb-4">
                <TabsTrigger value="best-sellers">ສິນຄ້າຂາຍດີ</TabsTrigger>
                <TabsTrigger value="menu-mix">ສ່ວນຜະສົມເມນູ</TabsTrigger>
                <TabsTrigger value="dead-items" disabled={period === "daily"}>
                  ຂາຍຊ້າ
                  {period === "daily" && (
                    <span className="ml-1 text-[10px] opacity-50">(ບໍ່ຮອງຮັບ)</span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Best Sellers */}
              <TabsContent value="best-sellers">
                {loadingBest ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-full rounded" />
                        <Skeleton className="h-1 w-3/4 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : !bestSellers?.items.length ? (
                  <p className="py-6 text-center text-sm text-ink-400">ບໍ່ມີຂໍ້ມູນ</p>
                ) : (
                  <div>
                    {bestSellers.items.map((item, index) => {
                      const maxQty = bestSellers.items[0].total_quantity_sold;
                      const barPct =
                        maxQty > 0 ? (item.total_quantity_sold / maxQty) * 100 : 0;
                      return (
                        <FadeIn key={item.menu_item_id} delay={500 + index * 30} slide={false}>
                          <div className={`py-3 ${index > 0 ? "border-t border-ink-100" : ""}`}>
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-5 shrink-0 text-sm font-bold ${item.rank === 1 ? "text-amber-500" : "text-ink-300"}`}
                              >
                                {item.rank}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-ink-900">
                                  {item.name}
                                </p>
                                <p className="text-xs text-ink-400">{item.category_name}</p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="text-sm font-semibold text-ink-700">
                                  x{item.total_quantity_sold}
                                </p>
                                <p className="text-xs text-ink-400">
                                  {formatNumber(item.total_revenue)} ກີບ
                                </p>
                              </div>
                            </div>
                            <div className="ml-8 mt-1.5 h-1 overflow-hidden rounded-full bg-ink-100">
                              <div
                                className="h-1 origin-left rounded-full bg-gold fill-mode-both [animation:bar-grow_0.55s_cubic-bezier(0.22,1,0.36,1)_forwards]"
                                style={
                                  {
                                    width: `${barPct}%`,
                                    animationDelay: `${530 + index * 30}ms`,
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
              </TabsContent>

              {/* Menu Mix */}
              <TabsContent value="menu-mix">
                <DataTable
                  columns={MENU_MIX_COLUMNS}
                  data={menuMix?.items ?? []}
                  isLoading={loadingMix}
                />
              </TabsContent>

              {/* Dead Items */}
              <TabsContent value="dead-items">
                {period === "daily" ? (
                  <p className="py-6 text-center text-sm text-ink-400">
                    ຂໍ້ມູນນີ້ບໍ່ຮອງຮັບລາຍວັນ — ກະລຸນາເລືອກລາຍອາທິດ, ລາຍເດືອນ, ຫຼື ລາຍປີ
                  </p>
                ) : (
                  <DataTable
                    columns={DEAD_ITEMS_COLUMNS}
                    data={deadItems?.items ?? []}
                    isLoading={loadingDead}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

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

function ComparisonMetric({
  label,
  current,
  previous,
  unit,
  changePercent,
}: {
  label: string;
  current: string;
  previous: string;
  unit: string;
  changePercent: number;
}) {
  const isPositive = changePercent > 0;
  const isNeutral  = changePercent === 0;

  return (
    <div className="flex flex-col gap-1 p-5">
      <span className="text-xs text-ink-500">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-ink-900">{current}</span>
        <span className="text-xs text-ink-400">{unit}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        {isNeutral ? (
          <Minus size={12} className="text-ink-400" />
        ) : isPositive ? (
          <TrendingUp size={12} className="text-success" />
        ) : (
          <TrendingDown size={12} className="text-danger" />
        )}
        <span
          className={cn(
            "font-medium",
            isNeutral ? "text-ink-400" : isPositive ? "text-success" : "text-danger",
          )}
        >
          {isNeutral ? "0" : `${isPositive ? "+" : ""}${changePercent.toFixed(1)}`}%
        </span>
        <span className="text-ink-400">vs {previous} {unit}</span>
      </div>
    </div>
  );
}

// ── Table columns ──────────────────────────────────────────────

type MenuMixItem = {
  menu_item_id: string;
  name: string;
  category_name: string;
  total_quantity_sold: number;
  total_revenue: number;
  quantity_percentage: number;
  revenue_percentage: number;
};

const MENU_MIX_COLUMNS: ColumnDef<MenuMixItem>[] = [
  {
    accessorKey: "name",
    header: "ຊື່ເມນູ",
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium text-ink-900">{row.getValue("name")}</p>
        <p className="text-xs text-ink-400">{row.original.category_name}</p>
      </div>
    ),
  },
  {
    accessorKey: "total_quantity_sold",
    header: () => <div className="text-right">ຈຳນວນ</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium text-ink-900">
        {row.getValue<number>("total_quantity_sold")}
      </div>
    ),
  },
  {
    accessorKey: "quantity_percentage",
    header: () => <div className="text-right">% ຈຳນວນ</div>,
    cell: ({ row }) => (
      <div className="text-right text-ink-700">
        {row.getValue<number>("quantity_percentage").toFixed(1)}%
      </div>
    ),
  },
  {
    accessorKey: "total_revenue",
    header: () => <div className="text-right">ລາຍໄດ້</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium text-ink-900">
        {formatNumber(row.getValue<number>("total_revenue"))} ກີບ
      </div>
    ),
  },
  {
    accessorKey: "revenue_percentage",
    header: () => <div className="text-right">% ລາຍໄດ້</div>,
    cell: ({ row }) => (
      <div className="text-right text-ink-700">
        {row.getValue<number>("revenue_percentage").toFixed(1)}%
      </div>
    ),
  },
];

type DeadItem = {
  menu_item_id: string;
  name: string;
  category_name: string;
  total_quantity_sold: number;
  total_revenue: number;
  unit_price: number;
  is_available: boolean;
  is_sold_out: boolean;
};

const DEAD_ITEMS_COLUMNS: ColumnDef<DeadItem>[] = [
  {
    accessorKey: "name",
    header: "ຊື່ເມນູ",
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium text-ink-900">{row.getValue("name")}</p>
        <p className="text-xs text-ink-400">{row.original.category_name}</p>
      </div>
    ),
  },
  {
    accessorKey: "unit_price",
    header: () => <div className="text-right">ລາຄາ</div>,
    cell: ({ row }) => (
      <div className="text-right text-ink-700">
        {formatNumber(row.getValue<number>("unit_price"))} ກີບ
      </div>
    ),
  },
  {
    accessorKey: "total_quantity_sold",
    header: () => <div className="text-right">ຂາຍໄດ້</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium text-ink-900">
        {row.getValue<number>("total_quantity_sold")}
      </div>
    ),
  },
  {
    accessorKey: "total_revenue",
    header: () => <div className="text-right">ລາຍໄດ້</div>,
    cell: ({ row }) => (
      <div className="text-right text-ink-700">
        {formatNumber(row.getValue<number>("total_revenue"))} ກີບ
      </div>
    ),
  },
  {
    accessorKey: "is_available",
    header: "ສະຖານະ",
    cell: ({ row }) => {
      if (row.original.is_sold_out) {
        return (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            ໝົດສ່ວນ
          </span>
        );
      }
      if (!row.original.is_available) {
        return (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800">
            ປິດ
          </span>
        );
      }
      return (
        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800">
          ເປີດ
        </span>
      );
    },
  },
];
