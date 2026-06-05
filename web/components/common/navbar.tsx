"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { Menu, X } from "lucide-react"

export type NavAlignment = "start" | "center" | "end"
export type NavScrollBehavior = "sticky" | "static" | "absolute" | "fixed" | "auto-hide"
export type NavColorScheme = "light" | "dark"
export type NavMobileVariant = "drawer" | "overlay"

interface NavbarCtxValue {
  mode: "desktop" | "mobile"
  mobileVariant: NavMobileVariant
  colorScheme: NavColorScheme
  closeMobile: () => void
}

const NavbarCtx = createContext<NavbarCtxValue>({
  mode: "desktop",
  mobileVariant: "drawer",
  colorScheme: "light",
  closeMobile: () => { },
})

export interface NavbarProps {
  children?: ReactNode
  /** Always rendered in the header row — never hidden on mobile */
  logo?: ReactNode
  /**
   * Controls navbar positioning relative to scroll.
   * - `sticky`: always visible at the top (default)
   * - `static`: scrolls with the page
   * - `absolute`: overlays content, scrolls away with the page
   * - `fixed`: overlays content AND stays visible at top (transparent sticky)
   * - `auto-hide`: like fixed but hides on scroll down, reveals on scroll up
   */
  behavior?: NavScrollBehavior
  /** `drawer` slides down below the header; `overlay` covers the full screen */
  mobileVariant?: NavMobileVariant
  /** `light` for white/cream backgrounds; `dark` for colored backgrounds like bg-green */
  colorScheme?: NavColorScheme
  /** Override the overlay background. Defaults to bg-green for dark, bg-white for light. */
  overlayClassName?: string
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

export interface NavCtaProps {
  href: string
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
  absolute: "absolute top-0 left-0 right-0",
  fixed: "fixed top-0 left-0 right-0",
  "auto-hide": "fixed top-0 left-0 right-0",
}

export function Navbar({
  children,
  logo,
  behavior = "sticky",
  mobileVariant = "drawer",
  colorScheme = "light",
  overlayClassName,
  className,
}: NavbarProps) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const lastScrollY = useRef(0)
  const closeMobile = () => setOpen(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 4)
      if (behavior === "auto-hide") {
        if (y < lastScrollY.current || y < 64) {
          setVisible(true)
        } else {
          setVisible(false)
          setOpen(false)
        }
        lastScrollY.current = y
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [behavior])

  const isDark = colorScheme === "dark"
  const desktopCtx: NavbarCtxValue = { mode: "desktop", mobileVariant, colorScheme, closeMobile }
  const mobileCtx: NavbarCtxValue = { mode: "mobile", mobileVariant, colorScheme, closeMobile }

  return (
    <>
      {/* auto-hide uses fixed positioning — spacer prevents content from rendering under the navbar */}
      {behavior === "auto-hide" && <div className="h-16" aria-hidden />}

      <header
        className={cn(
          "w-full z-50 transition-shadow duration-base",
          isDark
            ? "bg-green border-b border-green-light/50"
            : "bg-white/95 backdrop-blur-sm border-b border-[#E8DDD5]",
          POSITION_CLASSES[behavior],
          scrolled && "shadow-[0_2px_6px_rgba(0,0,0,0.3)]",
          behavior === "auto-hide" && "transition-transform duration-base ease-in-out",
          behavior === "auto-hide" && !visible && "-translate-y-full",
          className,
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            {logo && <div className="shrink-0">{logo}</div>}

            <NavbarCtx.Provider value={desktopCtx}>
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
                "md:hidden ml-auto transition-all duration-base",
                isDark
                  ? cn("text-white hover:text-white hover:bg-white/10", open && "bg-white/10")
                  : cn("text-[#6B4C3B] hover:text-green hover:bg-green/8", open && "text-green bg-green/8"),
              )}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {mobileVariant === "drawer" && (
          <div
            id="mobile-menu"
            aria-hidden={!open}
            className={cn(
              "md:hidden overflow-hidden transition-all duration-200 ease-in-out",
              open ? "max-h-screen" : "max-h-0",
            )}
          >
            <NavbarCtx.Provider value={mobileCtx}>
              <div className={cn(
                "flex flex-col px-4 py-3 gap-1 border-t",
                isDark ? "border-green-light/50 bg-green" : "border-[#E8DDD5] bg-white",
              )}>
                {children}
              </div>
            </NavbarCtx.Provider>
          </div>
        )}
      </header>

      {mobileVariant === "overlay" && (
        <div
          aria-hidden={!open}
          className={cn(
            "fixed inset-0 z-50 flex flex-col transition-opacity duration-300 md:hidden",
            open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
            overlayClassName ?? (isDark ? "bg-green" : "bg-white"),
          )}
        >
          <div className="flex items-center justify-end h-16 px-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close menu"
              onClick={closeMobile}
              className={cn(
                "transition-colors duration-base",
                isDark
                  ? "text-white hover:text-white hover:bg-white/10"
                  : "text-[#6B4C3B] hover:text-green hover:bg-green/8",
              )}
            >
              <X className="size-5" />
            </Button>
          </div>
          <NavbarCtx.Provider value={mobileCtx}>
            <nav className="flex flex-col items-center justify-center flex-1 gap-8 pb-16">
              {children}
            </nav>
          </NavbarCtx.Provider>
        </div>
      )}
    </>
  )
}

export function NavItems({ align = "start", children, className }: NavItemsProps) {
  const { mode, mobileVariant } = useContext(NavbarCtx)

  if (mode === "mobile") {
    // overlay layout is controlled by Navbar's nav container — don't add another wrapper
    if (mobileVariant === "overlay") return <>{children}</>
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
  const { mode, mobileVariant, colorScheme, closeMobile } = useContext(NavbarCtx)
  const active = matchPrefix ? pathname.startsWith(href) : pathname === href
  const isDark = colorScheme === "dark"

  if (mode === "mobile" && mobileVariant === "overlay") {
    return (
      <Link
        href={href}
        onClick={closeMobile}
        className={cn(
          "text-2xl font-medium transition-colors duration-base",
          isDark
            ? cn("text-white hover:text-white/70", active && "text-white/70")
            : cn("text-[#2C1810] hover:text-green", active && "text-green"),
          className,
        )}
      >
        {children}
      </Link>
    )
  }

  if (mode === "mobile") {
    return (
      <Button
        asChild
        variant="ghost"
        className={cn(
          "w-full justify-start h-10 px-3 text-sm font-medium rounded-lg transition-colors duration-base",
          isDark
            ? active
              ? "text-white bg-white/15 border-l-2 border-white rounded-l-none pl-[calc(0.75rem-2px)]"
              : "text-white/80 hover:text-white hover:bg-white/8"
            : active
              ? "text-green bg-green/8 border-l-2 border-green rounded-l-none pl-[calc(0.75rem-2px)]"
              : "text-[#6B4C3B] hover:text-green hover:bg-green/6",
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
        "relative h-8 px-3 rounded-lg text-sm font-medium transition-colors duration-base",
        isDark
          ? active
            ? "text-white bg-white/15"
            : "text-white/80 hover:text-white hover:bg-white/8"
          : active
            ? "text-green bg-green/8"
            : "text-[#6B4C3B] hover:text-green hover:bg-green/6",
        className,
      )}
    >
      <Link href={href}>
        {icon && <span className="mr-1.5 opacity-80">{icon}</span>}
        {children}
        {active && (
          <span
            aria-hidden
            className={cn(
              "absolute bottom-0 left-2 right-2 h-0.5 rounded-full",
              isDark ? "bg-gold" : "bg-green",
            )}
          />
        )}
      </Link>
    </Button>
  )
}

/**
 * A context-aware call-to-action button for use inside Navbar.
 * Automatically adapts its size and layout for desktop, drawer mobile, and overlay mobile.
 */
export function NavCta({ href, children, className }: NavCtaProps) {
  const { mode, mobileVariant, closeMobile } = useContext(NavbarCtx)
  const isOverlay = mode === "mobile" && mobileVariant === "overlay"
  const isDrawer = mode === "mobile" && mobileVariant === "drawer"

  return (
    <Button
      asChild
      variant="outline"
      size={isOverlay ? "default" : "sm"}
      className={cn(
        "rounded-full border-gold text-gold bg-transparent hover:bg-gold/10 hover:text-gold transition-colors duration-base",
        !isOverlay && !isDrawer && "ml-3",
        isOverlay && "h-12 px-8 text-base",
        isDrawer && "w-full justify-start mt-1",
        className,
      )}
    >
      <Link href={href} onClick={isOverlay || isDrawer ? closeMobile : undefined}>
        {children}
      </Link>
    </Button>
  )
}
