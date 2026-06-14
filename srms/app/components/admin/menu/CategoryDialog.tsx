import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateMenuCategory, useUpdateMenuCategory } from "@/hooks/useMenu";
import { useZodForm, type SubmitHandler } from "@/lib/form";
import {
  createMenuCategorySchema,
  updateMenuCategorySchema,
} from "@/schemas/menu.schema";
import type {
  CreateMenuCategoryInput,
  UpdateMenuCategoryInput,
} from "@/schemas/menu.schema";
import type { MenuCategory } from "@/types/entities";

interface CategoryDialogProps {
  category?: MenuCategory;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function CategoryDialog({ category, open, onOpenChange }: CategoryDialogProps) {
  const isEdit = !!category;
  const { mutate: create, isPending: creating } = useCreateMenuCategory();
  const { mutate: update, isPending: updating } = useUpdateMenuCategory();
  const isPending = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useZodForm(isEdit ? updateMenuCategorySchema : createMenuCategorySchema, {
    defaultValues: { name: category?.name ?? "" },
  });

  const onSubmit: SubmitHandler<CreateMenuCategoryInput | UpdateMenuCategoryInput> = (values) => {
    if (isEdit && category) {
      update({ id: category._id, ...values }, { onSuccess: () => { onOpenChange(false); reset(); } });
    } else {
      create(values as CreateMenuCategoryInput, { onSuccess: () => { onOpenChange(false); reset(); } });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-body font-bold text-ink-900">
            {isEdit ? "ແກ້ໄຂໝວດໝູ່" : "ເພີ່ມໝວດໝູ່ໃໝ່"}
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-500">
            {isEdit ? "ແກ້ໄຂຊື່ໝວດໝູ່ເມນູ" : "ເພີ່ມໝວດໝູ່ເມນູໃໝ່"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4 p-4 pt-0">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              ຊື່ໝວດໝູ່ <span className="text-danger">*</span>
            </label>
            <Input
              {...register("name")}
              placeholder="ເຊັ່ນ: ອາຫານຈານຫຼັກ"
              className="border-ink-300 bg-paper"
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-danger">{errors.name.message}</p>
            )}
          </div>
          <DialogFooter className="gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="px-4 py-2"
              onClick={() => onOpenChange(false)}
            >
              ຍົກເລີກ
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="gap-1.5 px-4 py-2 bg-green hover:bg-green-light text-white"
            >
              {isPending ? "ກຳລັງບັນທຶກ..." : isEdit ? "ບັນທຶກ" : "ເພີ່ມໝວດໝູ່"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
