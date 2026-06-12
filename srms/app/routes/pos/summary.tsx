import { Banknote, QrCode, TrendingUp, Receipt, BarChart3, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSalesSummary } from "@/hooks/useAnalytics";
import { formatDate, DATE_FORMATS } from "@/lib/date";
import { formatNumber } from "@/lib/utils";

export default function PosSummary() {
  const today = formatDate(new Date(), DATE_FORMATS.DATE_ISO);
  const { data, isLoading } = useSalesSummary({ period: "daily", date: today });

  const cashPct =
    data && data.total_revenue > 0
      ? Math.round((data.payment_breakdown.cash / data.total_revenue) * 100)
      : 0;
  const qrPct =
    data && data.total_revenue > 0
      ? Math.round((data.payment_breakdown.qr_promptpay / data.total_revenue) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">ສະຫຼຸບຍອດຂາຍ</h1>
        <p className="text-sm text-ink-500 mt-0.5">
          {formatDate(new Date(), DATE_FORMATS.DATE)}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="ຍອດລວມ"
          isLoading={isLoading}
        >
          <span className="text-2xl font-bold text-teal-600">
            {formatNumber(data?.total_revenue ?? 0)}
          </span>
          <span className="text-sm text-ink-500 ml-1">ກີບ</span>
        </StatCard>

        <StatCard
          icon={<Receipt className="h-4 w-4" />}
          label="ຈຳນວນບິນ"
          isLoading={isLoading}
        >
          <span className="text-2xl font-bold text-ink-900">
            {data?.total_bills ?? 0}
          </span>
          <span className="text-sm text-ink-500 ml-1">ບິນ</span>
        </StatCard>

        <StatCard
          icon={<BarChart3 className="h-4 w-4" />}
          label="ຄ່າສະເລ່ຍ / ບິນ"
          isLoading={isLoading}
        >
          <span className="text-2xl font-bold text-ink-900">
            {formatNumber(data?.average_bill_amount ?? 0)}
          </span>
          <span className="text-sm text-ink-500 ml-1">ກີບ</span>
        </StatCard>

        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="ຊ່ວງຂາຍດີ"
          isLoading={isLoading}
        >
          <span className="text-2xl font-bold text-ink-900">
            {data?.peak.label || "—"}
          </span>
        </StatCard>
      </div>

      {/* Payment breakdown */}
      <div className="rounded-lg border border-ink-100 bg-paper p-5 space-y-4">
        <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
          ການຊຳລະເງິນ
        </p>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ) : (
          <div className="space-y-3">
            <PaymentRow
              icon={<Banknote className="h-4 w-4 text-emerald-600" />}
              label="ກີບສົດ"
              amount={data?.payment_breakdown.cash ?? 0}
              pct={cashPct}
              barColor="bg-emerald-500"
            />
            <PaymentRow
              icon={<QrCode className="h-4 w-4 text-violet-600" />}
              label="ໂອນຈ່າຍ"
              amount={data?.payment_breakdown.qr_promptpay ?? 0}
              pct={qrPct}
              barColor="bg-violet-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  isLoading,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-ink-100 bg-paper p-5 space-y-2">
      <div className="flex items-center gap-1.5 text-ink-500">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-32 rounded" />
      ) : (
        <div className="flex items-baseline">{children}</div>
      )}
    </div>
  );
}

function PaymentRow({
  icon,
  label,
  amount,
  pct,
  barColor,
}: {
  icon: React.ReactNode;
  label: string;
  amount: number;
  pct: number;
  barColor: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-ink-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink-900">
            {formatNumber(amount)} ກີບ
          </span>
          <span className="text-xs text-ink-400 w-9 text-right">{pct}%</span>
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full bg-ink-100">
        <div
          className={`h-1.5 rounded-full ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
