import { useState } from "react";
import { LogOut } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useLogout } from "@/hooks/useAuth";
import ProfilePageMobile from "@/components/common/ProfilePageMobile";

export default function KitchenProfilePage() {
  const { mutate: logout } = useLogout();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <ProfilePageMobile />

      <button
        onClick={() => setConfirmOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-danger/30 text-danger text-sm font-medium hover:bg-danger/5 transition-colors duration-150 cursor-pointer mb-4"
      >
        <LogOut size={15} />
        ອອກຈາກລະບົບ
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="ອອກຈາກລະບົບ"
        description="ທ່ານຕ້ອງການອອກຈາກລະບົບຫຼືບໍ່?"
        confirmLabel="ອອກຈາກລະບົບ"
        cancelLabel="ຍົກເລີກ"
        variant="destructive"
        onConfirm={() => logout()}
      />
    </>
  );
}
