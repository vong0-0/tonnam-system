import { useState, useRef } from "react";
import { ChevronRight, X, Plus, Pencil, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import type { MenuCategory } from "@/types/entities";

const DEFAULT_WIDTH = 220;
const COLLAPSE_THRESHOLD = 120;
const MAX_WIDTH = 360;

interface MenuSidebarProps {
  allCategories: MenuCategory[];
  selectedCategoryId: string | undefined;
  onSelectCategory: (id: string | undefined) => void;
  totalCount: number;
  onAddCategory: () => void;
  onEditCategory: (cat: MenuCategory) => void;
  onDeleteCategory: (cat: MenuCategory) => void;
}

export function MenuSidebar({
  allCategories,
  selectedCategoryId,
  onSelectCategory,
  totalCount,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: MenuSidebarProps) {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isOpen, setIsOpen] = useState(true);
  const lastOpenWidth = useRef(DEFAULT_WIDTH);

  function handleDragStart(e: React.MouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    function onMouseMove(ev: MouseEvent) {
      const newWidth = startWidth + (ev.clientX - startX);
      if (newWidth < COLLAPSE_THRESHOLD) {
        setIsOpen(false);
        cleanup();
        return;
      }
      const clamped = Math.min(MAX_WIDTH, Math.max(COLLAPSE_THRESHOLD, newWidth));
      setSidebarWidth(clamped);
      lastOpenWidth.current = clamped;
    }
    function onMouseUp() { cleanup(); }
    function cleanup() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  if (!isOpen) {
    return (
      <div className="flex-shrink-0 self-start sticky top-0 bg-paper border border-ink-100 rounded-xl flex items-center justify-center">
        <button
          onClick={() => { setIsOpen(true); setSidebarWidth(lastOpenWidth.current); }}
          className="w-8 h-8 text-ink-400 rounded-full flex justify-center items-center hover:text-ink-700 transition-colors"
          title="ເປີດໝວດໝູ່"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative flex-shrink-0 self-start sticky top-0 bg-paper border border-ink-100 overflow-hidden"
      style={{ width: sidebarWidth }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <p className="text-sm font-medium">ໝວດໝູ່</p>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            title="ເພີ່ມໝວດໝູ່"
            onClick={onAddCategory}
          >
            <Plus size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 rounded-full"
            onClick={() => setIsOpen(false)}
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      <div className="max-h-[calc(100vh-160px)] overflow-y-auto">
        <button
          onClick={() => onSelectCategory(undefined)}
          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
            selectedCategoryId === undefined
              ? "border-l-2 border-green bg-ink-50 font-semibold text-ink-900"
              : "border-l-2 border-transparent text-ink-500 hover:text-ink-700 hover:bg-ink-50"
          }`}
        >
          <span className="truncate block">
            ທັງໝົດ{" "}
            <span className="text-ink-400 font-normal">({totalCount})</span>
          </span>
        </button>

        {allCategories.map((cat) => (
          <div key={cat._id} className="group relative">
            <button
              onClick={() => onSelectCategory(cat._id)}
              className={`w-full text-left px-4 py-2 pr-16 text-sm transition-colors ${
                selectedCategoryId === cat._id
                  ? "border-l-2 border-green bg-ink-50 font-semibold text-ink-900"
                  : "border-l-2 border-transparent text-ink-500 hover:text-ink-700 hover:bg-ink-50"
              }`}
            >
              <span className="truncate block">
                {cat.name}{" "}
                <span className="text-ink-400 font-normal">({cat.item_count})</span>
              </span>
            </button>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
              <button
                onClick={(e) => { e.stopPropagation(); onEditCategory(cat); }}
                className="p-1 rounded text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors"
                title="ແກ້ໄຂ"
              >
                <Pencil size={11} />
              </button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (cat.item_count === 0) onDeleteCategory(cat);
                        }}
                        disabled={cat.item_count > 0}
                        className="p-1 rounded text-ink-400 hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="ລົບ"
                      >
                        <Trash2 size={11} />
                      </button>
                    </span>
                  </TooltipTrigger>
                  {cat.item_count > 0 && (
                    <TooltipContent side="right">
                      <p className="text-xs">ຍັງມີ {cat.item_count} ລາຍການຢູ່</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}
      </div>

      <div
        className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-10 hover:bg-ink-100"
        onMouseDown={handleDragStart}
      />
    </div>
  );
}
