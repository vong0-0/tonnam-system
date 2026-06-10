import { Outlet } from "react-router"
import KitchenBottomNav from "@/components/kitchen/KitchenBottomNav"

export default function KitchenLayout() {
  return (
    <>
      <div className="py-2 px-2 max-w-[500px] mx-auto pb-28">
        <Outlet />
      </div>
      <KitchenBottomNav />
    </>
  )
}