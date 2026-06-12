import { Plus } from "lucide-react";
import { SearchInput } from "@/components/common/SearchInput";
import { AppSelect, type SelectOption } from "@/components/common/AppSelect";
import { Button } from "@/components/ui/button";
import { TableStatus } from "@/types/enums";

const statusOptions: SelectOption[] = [
  { value: "ALL", label: "ທຸກສະຖານະ" },
  { value: TableStatus.AVAILABLE, label: "ວ່າງ" },
  { value: TableStatus.RESERVED, label: "ຈອງແລ້ວ" },
  { value: TableStatus.OCCUPIED, label: "ມີລູກຄ່າ" },
  { value: TableStatus.PAID, label: "ຊຳລະແລ້ວ" },
];

interface PosFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  isTemporary: boolean;
  onIsTemporaryChange: (v: boolean) => void;
  onCreateTable?: () => void;
}

export default function PosFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  isTemporary,
  onIsTemporaryChange,
  onCreateTable,
}: PosFilterBarProps) {
  return (
    <div className="flex items-center gap-3">
      <SearchInput
        placeholder="ຄົ້ນຫາໂຕະ..."
        className="flex-1 [&_input]:border-ink-300 [&_input]:bg-paper"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onClear={() => onSearchChange("")}
      />
      <AppSelect
        options={statusOptions}
        placeholder="ທຸກສະຖານະ"
        triggerClassName="w-36 h-auto py-2 border-ink-300 bg-paper"
        value={status}
        onValueChange={onStatusChange}
      />
      <Button
        style={{ height: "auto" }}
        variant={isTemporary ? "default" : "outline"}
        className={
          isTemporary
            ? "gap-1.5 px-4 py-2 shrink-0 bg-teal-500 hover:bg-teal-600 border-teal-500"
            : "gap-1.5 px-4 py-2 shrink-0 border-ink-300 text-ink-700 hover:bg-ink-50"
        }
        onClick={() => onIsTemporaryChange(!isTemporary)}
      >
        ໂຕະຊົ່ວຄາວ
      </Button>
      <Button
        style={{ height: "auto" }}
        className="gap-1.5 px-4 py-2 shrink-0 bg-blue-500 hover:bg-blue-600"
        onClick={onCreateTable}
      >
        <Plus size={16} />
        ເພີ່ມໂຕະ
      </Button>
    </div>
  );
}
