import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BillStatus } from "@/types/enums";

interface BillStatusBadgeProps {
  status: BillStatus;
  className?: string;
}

const statusConfig: Record<
  BillStatus,
  { label: string; bgClass: string; textClass: string; dotClass: string }
> = {
  OPEN: {
    label: "ອໍເດີ້ໃຫມ່",
    bgClass: "bg-amber-100",
    textClass: "text-amber-800",
    dotClass: "bg-amber-800",
  },
  PAID: {
    label: "ຊຳລະແລ້ວ",
    bgClass: "bg-green-100",
    textClass: "text-green-800",
    dotClass: "bg-green-800",
  },
  CANCELLED: {
    label: "ຍົກເລີກ",
    bgClass: "bg-red-100",
    textClass: "text-red-800",
    dotClass: "bg-red-800",
  },
};

export default function BillStatusBadge({
  status,
  className,
}: BillStatusBadgeProps) {
  const { label, bgClass, textClass, dotClass } = statusConfig[status];

  return (
    <Badge
      className={cn(
        "border-none px-2 py-0.5 text-xs font-medium",
        bgClass,
        textClass,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotClass)} />
      {label}
    </Badge>
  );
}
