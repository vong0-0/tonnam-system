import { useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { ImageOff, LoaderCircle, SearchX, UtensilsCrossed } from "lucide-react";
import { AppSelect, type SelectOption } from "@/components/common/AppSelect";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePublicMenuCategories,
  usePublicMenuItems,
} from "@/hooks/usePublicMenu";
import { resolveImageUrl } from "@/lib/image";
import { formatNumber } from "@/lib/utils";

function MenuCardSkeleton() {
  return (
    <Card className="gap-3 p-0">
      <Skeleton className="aspect-[4/3] w-full rounded-b-none" />
      <CardHeader className="gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-5 w-1/2" />
      </CardContent>
    </Card>
  );
}

function CustomerMenuCard({
  item,
}: {
  item: {
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
  };
}) {
  const imageUrl = resolveImageUrl(item.image_url);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Card className="gap-3 p-0">
      {imageUrl && !imageFailed ? (
        <img
          src={imageUrl}
          alt={item.name}
          className="aspect-[4/3] w-full object-cover"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-muted text-muted-foreground">
          {imageFailed ? (
            <ImageOff aria-hidden="true" />
          ) : (
            <UtensilsCrossed aria-hidden="true" />
          )}
        </div>
      )}
      <CardHeader className="gap-1">
        <CardTitle className="line-clamp-2 font-[family-name:var(--font-body)] text-base">{item.name}</CardTitle>
        {item.description && (
          <CardDescription className="line-clamp-2">
            {item.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-4 text-base font-semibold text-primary">
        {formatNumber(item.price)} LAK
      </CardContent>
    </Card>
  );
}

export default function CustomerMenu() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [categoryId, setCategoryId] = useState("ALL");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data: categories = [] } = usePublicMenuCategories();
  const {
    items,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = usePublicMenuItems({
    limit: 24,
    search: debouncedSearch || undefined,
    category_id: categoryId === "ALL" ? undefined : categoryId,
  });

  const categoryOptions = useMemo<SelectOption[]>(
    () => [
      { value: "ALL", label: "ທຸກໝວດ" },
      ...categories.map((category) => ({
        value: category._id,
        label: `${category.name} (${category.item_count})`,
      })),
    ],
    [categories],
  );

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void fetchNextPage();
      },
      { rootMargin: "240px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">ຮ້ານອາຫານຕົ້ນນ້ຳ</p>
          <h1 className="font-[family-name:var(--font-body)] text-3xl font-semibold tracking-tight">
            ເມນູ
          </h1>
          <p className="text-sm text-muted-foreground">
            ເລືອກເບິ່ງລາຍການອາຫານທີ່ມີໃຫ້ບໍລິການ
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_13rem]">
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onClear={() => setSearch("")}
            placeholder="ຄົ້ນຫາເມນູ"
            aria-label="ຄົ້ນຫາເມນູ"
          />
          <AppSelect
            value={categoryId}
            onValueChange={setCategoryId}
            options={categoryOptions}
            placeholder="ເລືອກໝວດ"
            triggerClassName="h-10 w-full"
          />
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <MenuCardSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <section className="flex flex-col items-center gap-3 rounded-lg border bg-card px-6 py-14 text-center">
            <p className="font-medium">ໂຫລດເມນູບໍ່ສຳເລັດ</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "ກະລຸນາລອງໃໝ່ອີກຄັ້ງ"}
            </p>
            <Button onClick={() => void refetch()}>ລອງໃໝ່</Button>
          </section>
        ) : items.length === 0 ? (
          <section className="flex flex-col items-center gap-2 rounded-lg border bg-card px-6 py-14 text-center">
            <SearchX aria-hidden="true" className="text-muted-foreground" />
            <p className="font-medium">ບໍ່ພົບລາຍການອາຫານ</p>
            <p className="text-sm text-muted-foreground">
              ລອງຄົ້ນຫາດ້ວຍຄຳອື່ນ ຫຼື ເລືອກໝວດອື່ນ
            </p>
          </section>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <CustomerMenuCard key={item._id} item={item} />
              ))}
            </section>
            <div
              ref={sentinelRef}
              className="flex h-12 items-center justify-center"
              aria-live="polite"
            >
              {isFetchingNextPage && (
                <LoaderCircle
                  className="animate-spin text-muted-foreground"
                  aria-label="ກຳລັງໂຫລດລາຍການເພີ່ມເຕີມ"
                />
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
