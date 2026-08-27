import type {
  MenuBestSellers,
  MenuDeadItems,
  MenuMix,
  SalesByCategory,
  SalesComparison,
  SalesSummary,
} from "@/types/analytics";

type CellValue = string | number;
type SheetRows = CellValue[][];

export interface AnalyticsExportData {
  period: string;
  date: string;
  rangeLabel: string;
  summary: SalesSummary;
  comparison: SalesComparison;
  byCategory: SalesByCategory;
  bestSellers: MenuBestSellers;
  menuMix: MenuMix;
  deadItems?: MenuDeadItems;
}

const BASE_FONT = { name: "Phetsarath OT", size: 12 };
const TITLE_FILL = "FF164E3A";
const HEADER_FILL = "FF2E7D5A";
const ALT_ROW_FILL = "FFF4F7F5";
const BORDER = {
  top: { style: "thin", color: { argb: "FFD8E0DB" } },
  left: { style: "thin", color: { argb: "FFD8E0DB" } },
  bottom: { style: "thin", color: { argb: "FFD8E0DB" } },
  right: { style: "thin", color: { argb: "FFD8E0DB" } },
} as const;

function addSection(rows: SheetRows, title: string, headers: string[], values: CellValue[][]) {
  rows.push([title]);
  rows.push(headers);
  rows.push(...(values.length ? values : [["No data"]]));
  rows.push([]);
}

function breakdownRows(summary: SalesSummary): CellValue[][] {
  return summary.breakdown.map((item) => {
    if ("hour" in item) return [String(item.hour).padStart(2, "0") + ":00", item.revenue, item.bills];
    if ("date" in item) return [item.date, item.revenue, item.bills];
    return [item.month, item.revenue, item.bills];
  });
}

function isBilingual(value: unknown): value is string {
  return typeof value === "string" && value.includes(" / ");
}

function appendSheet(
  workbook: import("exceljs").Workbook,
  name: string,
  rows: SheetRows,
  columnWidths: number[],
) {
  const worksheet = workbook.addWorksheet(name, {
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    views: [{ showGridLines: false }],
  });
  worksheet.properties.defaultRowHeight = 22;
  worksheet.columns = columnWidths.map((width) => ({ width }));
  rows.forEach((row) => worksheet.addRow(row));

  const headerRows: number[] = [];
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    const firstCell = row.getCell(1);
    const firstValue = firstCell.value;
    const secondValue = row.getCell(2).value;
    const isSection = row.actualCellCount === 1 && typeof firstValue === "string";
    const isHeader = isBilingual(firstValue) && isBilingual(secondValue);

    if (isSection) {
      worksheet.mergeCells(row.number, 1, row.number, columnWidths.length);
      row.height = row.number === 1 ? 30 : 25;
      firstCell.font = { ...BASE_FONT, bold: true, size: row.number === 1 ? 16 : 13, color: { argb: "FFFFFFFF" } };
      firstCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TITLE_FILL } };
      firstCell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      return;
    }

    if (isHeader) {
      headerRows.push(row.number);
      row.height = 48;
    }

    row.eachCell({ includeEmpty: true }, (cell) => {
      const numeric = typeof cell.value === "number";
      const isNotApplicable = cell.value === "N/A";
      cell.font = { ...BASE_FONT, bold: isHeader, italic: isNotApplicable, color: isNotApplicable ? { argb: "FF6B7280" } : undefined };
      cell.alignment = { vertical: "middle", horizontal: numeric ? "right" : isHeader || isNotApplicable ? "center" : "left", wrapText: true };
      cell.border = BORDER;

      if (isHeader) {
        cell.font = { ...BASE_FONT, bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
      } else if (isNotApplicable) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F3F2" } };
      } else if (row.number % 2 === 0) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ALT_ROW_FILL } };
      }

      if (numeric) cell.numFmt = "#,##0";
    });
  });

  const primaryHeaderRow = headerRows.at(-1);
  if (primaryHeaderRow) {
    worksheet.autoFilter = {
      from: { row: primaryHeaderRow, column: 1 },
      to: { row: worksheet.rowCount, column: columnWidths.length },
    };

    const header = worksheet.getRow(primaryHeaderRow);
    header.eachCell((cell) => {
      if (isBilingual(cell.value) && cell.value.includes("%")) {
        const column = cell.col;
        for (let rowNumber = primaryHeaderRow + 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
          const dataCell = worksheet.getCell(rowNumber, column);
          if (typeof dataCell.value === "number") dataCell.numFmt = "0.0\"%\"";
        }
      }
    });
  }

  return worksheet;
}
export async function exportAnalyticsExcel(data: AnalyticsExportData) {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TonNam";
  workbook.created = new Date();

  const summaryRows: SheetRows = [
    ["ລາຍງານວິເຄາະ / Analytics Report"],
    ["ໄລຍະເວລາ / Period", data.period],
    ["ວັນທີ / Date", data.date],
    ["ຊ່ວງລາຍງານ / Report range", data.rangeLabel],
    [],
  ];
  addSection(summaryRows, "ສະຫຼຸບຍອດຂາຍ / Sales summary", ["ລາຍການ / Metric", "ມູນຄ່າ / Value"], [
    ["ລາຍຮັບລວມ / Total revenue (LAK)", data.summary.total_revenue],
    ["ຈໍານວນບິນ / Total bills", data.summary.total_bills],
    ["ຈໍານວນອໍເດີ / Total orders", data.summary.total_orders],
    ["ສະເລ່ຍຕໍ່ບິນ / Average bill (LAK)", data.summary.average_bill_amount],
    ["ເງິນສົດ / Cash (LAK)", data.summary.payment_breakdown.cash],
    ["ໂອນຈ່າຍ / QR payment (LAK)", data.summary.payment_breakdown.qr_promptpay],
    ["ຊ່ວງຂາຍດີ / Peak period", data.summary.peak.label],
    ["ລາຍຮັບຊ່ວງຂາຍດີ / Peak revenue (LAK)", data.summary.peak.revenue],
  ]);
  addSection(summaryRows, "ຍອດຂາຍຕາມເວລາ / Sales breakdown", ["ເວລາ / Time", "ລາຍຮັບ / Revenue (LAK)", "ບິນ / Bills"], breakdownRows(data.summary));
  appendSheet(workbook, "Summary", summaryRows, [36, 28, 18]);

  const comparisonRows: SheetRows = [];
  addSection(comparisonRows, "ປຽບທຽບຍອດຂາຍ / Sales comparison", ["ລາຍການ / Metric", "ປັດຈຸບັນ / Current", "ກ່ອນໜ້າ / Previous", "ປ່ຽນແປງ / Change"], [
    ["ລາຍຮັບ / Revenue (LAK)", data.comparison.current.total_revenue, data.comparison.previous.total_revenue, data.comparison.changes.revenue_change],
    ["ຈໍານວນບິນ / Bills", data.comparison.current.total_bills, data.comparison.previous.total_bills, data.comparison.changes.bills_change],
    ["ຈໍານວນອໍເດີ / Orders", data.comparison.current.total_orders, data.comparison.previous.total_orders, data.comparison.changes.orders_change],
    ["ລາຍຮັບ (%) / Revenue change (%)", "N/A", "N/A", data.comparison.changes.revenue_change_percent],
    ["ບິນ (%) / Bills change (%)", "N/A", "N/A", data.comparison.changes.bills_change_percent],
    ["ອໍເດີ (%) / Orders change (%)", "N/A", "N/A", data.comparison.changes.orders_change_percent],
  ]);
  appendSheet(workbook, "Comparison", comparisonRows, [34, 22, 22, 22]);

  const categoryRows: SheetRows = [];
  addSection(categoryRows, "ຍອດຂາຍຕາມໝວດ / Sales by category", ["ໝວດໝູ່ / Category", "ລາຍຮັບ / Revenue (LAK)", "ສັດສ່ວນ / Percentage (%)", "ຈໍານວນຂາຍ / Items sold"], data.byCategory.categories.map((item) => [item.category_name, item.revenue, item.percentage, item.total_items_sold]));
  appendSheet(workbook, "Category Sales", categoryRows, [30, 25, 22, 22]);

  const bestSellerRows: SheetRows = [];
  addSection(bestSellerRows, "ເມນູຂາຍດີ / Best sellers", ["ອັນດັບ / Rank", "ເມນູ / Menu item", "ໝວດໝູ່ / Category", "ຈໍານວນຂາຍ / Quantity", "ລາຍຮັບ / Revenue (LAK)"], data.bestSellers.items.map((item) => [item.rank, item.name, item.category_name, item.total_quantity_sold, item.total_revenue]));
  appendSheet(workbook, "Best Sellers", bestSellerRows, [15, 30, 24, 22, 25]);

  const menuMixRows: SheetRows = [];
  addSection(menuMixRows, "ສັດສ່ວນເມນູ / Menu mix", ["ເມນູ / Menu item", "ໝວດໝູ່ / Category", "ຈໍານວນຂາຍ / Quantity", "ລາຍຮັບ / Revenue (LAK)", "ສັດສ່ວນຈໍານວນ / Quantity (%)", "ສັດສ່ວນລາຍຮັບ / Revenue (%)"], data.menuMix.items.map((item) => [item.name, item.category_name, item.total_quantity_sold, item.total_revenue, item.quantity_percentage, item.revenue_percentage]));
  appendSheet(workbook, "Menu Mix", menuMixRows, [30, 24, 22, 25, 26, 26]);

  if (data.deadItems) {
    const deadItemRows: SheetRows = [
      ["ເກນຂາຍຕໍ່າ / Low-sales threshold", data.deadItems.threshold],
      [],
    ];
    addSection(deadItemRows, "ເມນູຂາຍບໍ່ດີ / Dead items", ["ເມນູ / Menu item", "ໝວດໝູ່ / Category", "ຈໍານວນຂາຍ / Quantity", "ລາຍຮັບ / Revenue (LAK)", "ລາຄາ / Unit price (LAK)", "ພ້ອມຂາຍ / Available", "ໝົດ / Sold out"], data.deadItems.items.map((item) => [item.name, item.category_name, item.total_quantity_sold, item.total_revenue, item.unit_price, item.is_available ? "Yes" : "No", item.is_sold_out ? "Yes" : "No"]));
    appendSheet(workbook, "Dead Items", deadItemRows, [30, 24, 20, 25, 25, 18, 18]);
  }

  const filePeriod = data.period.charAt(0).toUpperCase() + data.period.slice(1);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "TonNam_Analytics_" + filePeriod + "_" + data.date + ".xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
