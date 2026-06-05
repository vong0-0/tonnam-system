"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { Menu, X } from "lucide-react"

const NavbarCtx = createContext<{
  mode: "desktop" | "mobile"
  closeMobile: () => void
}>({
  mode: "desktop",
  closeMobile: () => {},
})

export type NavAlignment = "start" | "center" | "end"
export type NavScrollBehavior = "sticky" | "static" | "auto-hide"

export interface NavbarProps {
  children?: ReactNode
  /**
   * Controls navbar positioning relative to scroll.
   * - `sticky`: always visible at the top (default)
   * - `static`: scrolls with the page
   * - `auto-hide`: hides on scroll down, reveals on scroll up
   */
  behavior?: NavScrollBehavior
  className?: string
}

export interface NavItemsProps {
  align?: NavAlignment
  children?: ReactNode
  className?: string
}

export interface NavItemProps {
  href: string
  icon?: ReactNode
  matchPrefix?: boolean
  children: ReactNode
  className?: string
}

const ALIGN_CLASSES: Record<NavAlignment, string> = {
  start: "mr-auto",
  center: "mx-auto",
  end: "ml-auto",
}

const POSITION_CLASSES: Record<NavScrollBehavior, string> = {
  sticky: "sticky top-0",
  static: "relative",
  "auto-hide": "fixed top-0 left-0 right-0",
}

export function Navbar({ children, behavior = "sticky", className }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const closeMobile = () => setOpen(false)

  useEffect(() => {
    if (behavior !== "auto-hide") return

    const onScroll = () => {
      const y = window.scrollY
      if (y < lastScrollY.current || y < 64) {
        setVisible(true)
      } else {
        setVisible(false)
        setOpen(false)
      }
      lastScrollY.current = y
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [behavior])

  return (
    <>
      {/* auto-hide uses fixed positioning — spacer prevents content from rendering under the navbar */}
      {behavior === "auto-hide" && <div className="h-16" aria-hidden />}

      <header
        className={cn(
          "w-full bg-white/95 backdrop-blur-sm border-b border-[#E8DDD5] z-50",
          POSITION_CLASSES[behavior],
          behavior === "auto-hide" && "transition-transform duration-300 ease-in-out",
          behavior === "auto-hide" && !visible && "-translate-y-full",
          className,
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <NavbarCtx.Provider value={{ mode: "desktop", closeMobile }}>
              <div className="hidden md:flex flex-1 items-center min-w-0">
                {children}
              </div>
            </NavbarCtx.Provider>

            <Button
              variant="ghost"
              size="icon"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "md:hidden text-[#6B4C3B] hover:text-[#1B4332] hover:bg-[#1B4332]/8",
                open && "text-[#1B4332] bg-[#1B4332]/8",
              )}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        <div
          id="mobile-menu"
          aria-hidden={!open}
          className={cn(
            "md:hidden overflow-hidden transition-all duration-200 ease-in-out",
            open ? "max-h-screen" : "max-h-0",
          )}
        >
          <NavbarCtx.Provider value={{ mode: "mobile", closeMobile }}>
            <div className="flex flex-col px-4 py-3 gap-1 border-t border-[#E8DDD5] bg-white">
              {children}
            </div>
          </NavbarCtx.Provider>
        </div>
      </header>
    </>
  )
}

export function NavItems({ align = "start", children, className }: NavItemsProps) {
  const { mode } = useContext(NavbarCtx)

  if (mode === "mobile") {
    return (
      <div className={cn("flex flex-col gap-1 w-full", className)}>
        {children}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-0.5", ALIGN_CLASSES[align], className)}>
      {children}
    </div>
  )
}

export function NavItem({ href, icon, matchPrefix, children, className }: NavItemProps) {
  const pathname = usePathname()
  const { mode, closeMobile } = useContext(NavbarCtx)
  const active = matchPrefix ? pathname.startsWith(href) : pathname === href

  if (mode === "mobile") {
    return (
      <Button
        asChild
        variant="ghost"
        className={cn(
          "w-full justify-start h-10 px-3 text-sm font-medium rounded-lg transition-colors",
          active
            ? "text-[#1B4332] bg-[#1B4332]/8 border-l-2 border-[#1B4332] rounded-l-none pl-[calc(0.75rem-2px)]"
            : "text-[#6B4C3B] hover:text-[#1B4332] hover:bg-[#1B4332]/6",
          className,
        )}
        onClick={closeMobile}
      >
        <Link href={href}>
          {icon && <span className="mr-2 opacity-80">{icon}</span>}
          {children}
        </Link>
      </Button>
    )
  }

  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={cn(
        "relative h-8 px-3 rounded-lg text-sm font-medium transition-colors",
        active
          ? "text-[#1B4332] bg-[#1B4332]/8"
          : "text-[#6B4C3B] hover:text-[#1B4332] hover:bg-[#1B4332]/6",
        className,
      )}
    >
      <Link href={href}>
        {icon && <span className="mr-1.5 opacity-80">{icon}</span>}
        {children}
        {active && (
          <span
            aria-hidden
            className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#1B4332]"
          />
        )}
      </Link>
    </Button>
  )
}
