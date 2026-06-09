import { ProfileDropdown } from '@/components/common/ProfileDropdown'

export default function WaiterTopbar() {
  return (
    <header className="w-full z-50 transition-shadow duration-base bg-green border-b border-green-light/50 sticky top-0 left-0 right-0">
      <div className="max-w-[500px] mx-auto px-4 h-14 flex items">
        <div className="w-full flex items-center justify-between">
          <div className="text-[20px] text-center">
            <span className="font-heading text-white">Ton</span>
            <span className="font-heading italic text-gold">Nam</span>
          </div>

          <ProfileDropdown
            className="text-white/80 hover:text-white hover:bg-white/10"
            iconClassName="text-current"
          />
        </div>
      </div>
    </header>
  )
}
