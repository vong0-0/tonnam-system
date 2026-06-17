import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AppSelect } from "@/components/common/AppSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateMenuItem, useUpdateMenuItem } from "@/hooks/useMenu";
import { useZodForm, type SubmitHandler } from "@/lib/form";
import {
  createMenuItemSchema,
  updateMenuItemSchema,
} from "@/schemas/menu.schema";
import type {
  CreateMenuItemInput,
  UpdateMenuItemInput,
} from "@/schemas/menu.schema";
import type { MenuItem, MenuCategory } from "@/types/entities";

interface ItemDialogProps {
  item?: MenuItem;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: MenuCategory[];
}

export function ItemDialog({ item, open, onOpenChange, categories }: ItemDialogProps) {
  const isEdit = !!item;
  const { mutate: create, isPending: creating } = useCreateMenuItem();
  const { mutate: update, isPending: updating } = useUpdateMenuItem();
  const isPending = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useZodForm(isEdit ? updateMenuItemSchema : createMenuItemSchema, {
    defaultValues: item
      ? {
        category_id: item.category_id,
        name: item.name,
        price: item.price,
        description: item.description ?? "",
        image_url: item.image_url ?? "",
      }
      : {
        category_id: "",
        name: "",
        price: undefined as unknown as number,
        description: "",
        image_url: "",
      },
  });

  const selectedCategoryId = watch("category_id");

  const onSubmit: SubmitHandler<CreateMenuItemInput | UpdateMenuItemInput> = (values) => {
    const clean = {
      ...values,
      description: values.description || undefined,
      image_url: values.image_url || undefined,
    };
    if (isEdit && item) {
      update({ id: item._id, ...clean }, { onSuccess: () => { onOpenChange(false); reset(); } });
    } else {
      create(clean as CreateMenuItemInput, { onSuccess: () => { onOpenChange(false); reset(); } });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-body text-xl font-bold text-ink-900">
            {isEdit ? "ແກ້ໄຂເມນູ" : "ເພີ່ມເມນູໃໝ່"}
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-500">
            {isEdit ? "ແກ້ໄຂຂໍ້ມູນລາຍການເມນູ" : "ເພີ່ມລາຍການເມນູໃໝ່ເຂົ້າສູ່ລະບົບ"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4 p-4 pt-0">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              ໝວດໝູ່ <span className="text-danger">*</span>
            </label>
            <AppSelect
              value={selectedCategoryId}
              onValueChange={(v) => setValue("category_id", v, { shouldValidate: true })}
              options={categories.map((cat) => ({ value: cat._id, label: cat.name }))}
              placeholder="ເລືອກໝວດໝູ່"
              triggerClassName="border-ink-300 bg-paper"
            />
            {errors.category_id && (
              <p className="text-xs text-danger">{errors.category_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                ຊື່ເມນູ <span className="text-danger">*</span>
              </label>
              <Input
                {...register("name")}
                placeholder="ເຊັ່ນ: ຂ້າວຜັດ"
                className="border-ink-300 bg-paper"
              />
              {errors.name && (
                <p className="text-xs text-danger">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                ລາຄາ (ກີບ) <span className="text-danger">*</span>
              </label>
              <Input
                {...register("price")}
                type="number"
                min={0}
                placeholder="35000"
                className="border-ink-300 bg-paper"
              />
              {errors.price && (
                <p className="text-xs text-danger">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">ລາຍລະອຽດ</label>
            <Input
              {...register("description")}
              placeholder="ລາຍລະອຽດເມນູ (ບໍ່ບັງຄັບ)"
              className="border-ink-300 bg-paper"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">ຮູບພາບ (ຊື່ໄຟລ໌ ຫຼື URL)</label>
            <Input
              {...register("image_url")}
              placeholder="ຊື່ໄຟລ໌ ຫຼື https://..."
              className="border-ink-300 bg-paper"
            />
            {errors.image_url && (
              <p className="text-xs text-danger">{errors.image_url.message}</p>
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
              {isPending ? "ກຳລັງບັນທຶກ..." : isEdit ? "ບັນທຶກ" : "ເພີ່ມເມນູ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
