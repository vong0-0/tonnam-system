import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportExcelButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isExporting?: boolean;
}

export function ExportExcelButton({
  onClick,
  disabled = false,
  isExporting = false,
}: ExportExcelButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="px-4 py-2 gap-1.5 bg-[#21a366] text-white hover:bg-[#185c37] hover:text-white"
      onClick={onClick}
      disabled={disabled || isExporting}
      aria-busy={isExporting}
    >
      <Download data-icon="inline-start" />
      {isExporting ? "Exporting..." : "Export Excel"}
    </Button>
  );
}
