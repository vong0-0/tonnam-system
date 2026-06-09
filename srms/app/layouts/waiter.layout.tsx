import WaiterTopbar from "@/components/waiter/waiter-topbar"
import { Outlet } from "react-router"

export default function WaiterLayout() {
  return (
    <>
      <WaiterTopbar />
      <div className="py-2 px-2 max-w-[500px] mx-auto">
        <Outlet />
      </div>
    </>
  )
}