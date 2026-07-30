type CellValue = string | number;

export interface MasterDataSheet {
  name: string;
  title: string;
  headers: string[];
  rows: CellValue[][];
  columnWidths: number[];
  currencyColumns?: number[];
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

function sanitizeWorksheetName(name: string): string {
  // Replace invalid characters: \ / ? * [ ] : with a space
  let clean = name.replace(/[\\\/\?\*\[\]\:]/g, " ");
  
  // Collapse multiple spaces to a single space
  clean = clean.replace(/\s+/g, " ").trim();
  
  // Sheet names cannot start or end with a single quote
  if (clean.startsWith("'")) {
    clean = clean.slice(1);
  }
  if (clean.endsWith("'")) {
    clean = clean.slice(0, -1);
  }
  clean = clean.trim();

  // Excel sheet names are limited to 31 characters
  clean = clean.slice(0, 31).trim();

  // Fallback to a default name if empty
  return clean || "Sheet";
}

function appendSheet(workbook: import("exceljs").Workbook, definition: MasterDataSheet) {
  const sanitizedName = sanitizeWorksheetName(definition.name);
  const worksheet = workbook.addWorksheet(sanitizedName, {
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    views: [{ showGridLines: false }],
  });
  worksheet.properties.defaultRowHeight = 22;
  worksheet.columns = definition.columnWidths.map((width) => ({ width }));
  worksheet.addRow([definition.title]);
  worksheet.addRow(definition.headers);
  const dataRows = definition.rows.length ? definition.rows : [["??????????? / No data"]];
  dataRows.forEach((row) => worksheet.addRow(row));

  worksheet.mergeCells(1, 1, 1, definition.headers.length);
  const titleCell = worksheet.getCell(1, 1);
  titleCell.font = { ...BASE_FONT, bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TITLE_FILL } };
  titleCell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  worksheet.getRow(1).height = 30;

  const headerRow = worksheet.getRow(2);
  headerRow.height = 48;
  headerRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { ...BASE_FONT, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
    cell.border = BORDER;
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });

  for (let rowNumber = 3; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    row.eachCell({ includeEmpty: true }, (cell) => {
      const numeric = typeof cell.value === "number";
      cell.font = { ...BASE_FONT };
      cell.border = BORDER;
      cell.alignment = { vertical: "middle", horizontal: numeric ? "right" : "left", wrapText: true };
      if (rowNumber % 2 === 0) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ALT_ROW_FILL } };
      }
      if (numeric) cell.numFmt = "#,##0";
    });
  }

  definition.currencyColumns?.forEach((column) => {
    for (let rowNumber = 3; rowNumber <= worksheet.rowCount; rowNumber += 1) {
      const cell = worksheet.getCell(rowNumber, column);
      if (typeof cell.value === "number") cell.numFmt = "#,##0";
    }
  });

  worksheet.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: Math.max(2, worksheet.rowCount), column: definition.headers.length },
  };
}

export async function exportMasterDataExcel(fileName: string, sheets: MasterDataSheet[]) {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TonNam";
  workbook.created = new Date();
  sheets.forEach((sheet) => appendSheet(workbook, sheet));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
