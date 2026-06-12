import { formatDate, DATE_FORMATS } from "@/lib/date";
import { formatNumber } from "@/lib/utils";
import type { BillDetail, OrderItem, OrderWithItems } from "@/types/entities";

function mergeItems(items: OrderItem[]): OrderItem[] {
  const result: OrderItem[] = [];
  const grouped = new Map<string, OrderItem>();

  for (const item of items) {
    if (item.note) {
      result.push(item);
    } else {
      const existing = grouped.get(item.menu_item_id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        grouped.set(item.menu_item_id, { ...item });
        result.push(grouped.get(item.menu_item_id)!);
      }
    }
  }

  return result;
}

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "ກີບສົດ",
  QR_PROMPTPAY: "ໂອນຈ່າຍ",
  MIXED: "ປະສົມ",
};

export function printBill(detail: BillDetail, createdByName: string): void {
  const { bill, table, orders, payments } = detail;
  const items = mergeItems(
    orders.flatMap((o: OrderWithItems) => o.items),
  ).filter((item) => bill.status === "CANCELLED" || item.status !== "CANCELLED");

  const itemRows = items
    .map((item) => {
      const cancelled = item.status === "CANCELLED";
      return `<div style="padding:6px 0;border-bottom:1px solid #dee2e6;opacity:${cancelled ? "0.6" : "1"}">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
        <div style="font-weight:bold;${cancelled ? "text-decoration:line-through" : ""}">${item.name}</div>
        ${cancelled ? `<span style="font-size:10px;color:#c0392b;white-space:nowrap">[ຍົກເລີກ]</span>` : ""}
      </div>
      ${item.note ? `<div style="color:#d97706;font-size:11px">ຫມາຍເຫດ: ${item.note}</div>` : ""}
      <div style="font-size:11px;color:#6c757d;margin-top:2px${cancelled ? ";text-decoration:line-through" : ""}">
        ${item.quantity} x ${formatNumber(item.unit_price)} = ${formatNumber(item.quantity * item.unit_price)} ກີບ
      </div>
    </div>`;
    })
    .join("");

  const paymentLines = payments
    .map(
      (
        p,
      ) => `<div style="display:flex;justify-content:space-between;margin-bottom:2px">
      <span>${PAYMENT_LABELS[p.method] ?? p.method}</span>
      <span>${formatNumber(p.amount)} ກີບ</span>
    </div>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html><head>
  <meta charset="utf-8"/>
  <title>ບິນ ${bill.short_id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;700&display=swap');
    body{font-family:'Noto Sans Lao',sans-serif;font-size:12px;width:100%;box-sizing:border-box;padding:16px;color:#1f2326}
    h2{text-align:center;margin:0 0 4px;font-size:16px}
    .sub{text-align:center;color:#6c757d;margin-bottom:12px;font-size:11px;line-height:1.6}
    .divider{border:none;border-top:1px dashed #adb5bd;margin:8px 0}
    .total{display:flex;justify-content:space-between;font-weight:bold;font-size:14px;margin-top:8px}
    .footer{text-align:center;margin-top:12px;color:#adb5bd;font-size:10px}
    @media print{@page{margin:4mm}}
  </style>
  </head><body>
  <h2>ຕົ້ນນ້ຳ</h2>
  <div class="sub">
    <div><strong>${bill.short_id}</strong></div>
    <div>ໂຕະ: ${table?.table_name ?? bill.name}</div>
    <div>${formatDate(bill.created_at, DATE_FORMATS.DATE_TIME)}</div>
    <div>ພະນັກງານ: ${createdByName}</div>
  </div>
  <hr class="divider"/>
  <div>${itemRows}</div>
  <hr class="divider"/>
  ${paymentLines ? `<div style="margin-bottom:6px">${paymentLines}</div>` : ""}
  <div class="total"><span>ຍອດລວມ</span><span>${formatNumber(bill.total_amount)} ກີບ</span></div>
  <hr class="divider"/>
  <div class="footer">ຂອບໃຈທີ່ໃຊ້ບໍລິການ</div>
  <script>window.onload=function(){window.print();window.close()}<\/script>
  </body></html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
}
