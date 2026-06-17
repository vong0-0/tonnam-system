import { useRef, useState } from "react";
import { ImagePlus, Loader2, UploadCloud } from "lucide-react";
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
import { useCreateMenuItem, useUpdateMenuItem, useUploadMenuImage } from "@/hooks/useMenu";
import { resolveImageUrl } from "@/lib/image";
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
  const { mutateAsync: uploadImage, isPending: uploading } = useUploadMenuImage();
  const isPending = creating || updating;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

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
  const imagePreview = resolveImageUrl(watch("image_url"));

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const filename = await uploadImage(file);
      setValue("image_url", filename, { shouldValidate: true });
    } catch {
      // error toast is handled by the hook
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    await handleFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (uploading) return;
    await handleFile(e.dataTransfer.files?.[0]);
  };

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
            <label className="text-sm font-medium">ຮູບພາບ</label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              role="button"
              tabIndex={0}
              onClick={() => !uploading && fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !uploading) {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                dragging
                  ? "border-green bg-green-pale/40"
                  : "border-ink-200 bg-ink-50/50 hover:bg-ink-50"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 size={28} className="animate-spin text-green" />
                  <p className="text-sm text-ink-600">ກຳລັງອັບໂຫລດ...</p>
                </>
              ) : imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt=""
                    className="h-40 w-40 rounded-lg border border-ink-100 object-cover"
                  />
                  <p className="text-xs text-ink-500">ກົດ ຫຼື ລາກໄຟລ໌ໃໝ່ເພື່ອປ່ຽນຮູບ</p>
                </>
              ) : (
                <>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                    <UploadCloud size={22} strokeWidth={1.75} />
                  </div>
                  <p className="text-sm font-medium text-ink-700">
                    ເລືອກໄຟລ໌ ຫຼື ລາກວາງທີ່ນີ້
                  </p>
                  <p className="text-xs text-ink-400">JPG, PNG, WebP · ສູງສຸດ 5MB</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1 gap-1.5"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    <ImagePlus size={14} />
                    ເລືອກໄຟລ໌
                  </Button>
                </>
              )}
            </div>

            <Input
              {...register("image_url")}
              placeholder="ຫຼື ໃສ່ຊື່ໄຟລ໌ / https://..."
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
              disabled={isPending || uploading}
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
