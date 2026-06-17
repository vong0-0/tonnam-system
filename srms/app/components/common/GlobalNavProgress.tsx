import { useEffect, useState } from 'react'
import { useNavigation } from 'react-router'

/**
 * Global route-transition indicator. React Router lazy-loads each route's module
 * before swapping pages, so a click can feel unresponsive on first visit. This
 * shows a thin gold progress bar at the top of the viewport whenever a navigation
 * is pending — across every subsystem (admin / POS / waiter / kitchen).
 *
 * A short delay before showing avoids flashing the bar on instant (cached) navigations.
 */
export function GlobalNavProgress() {
  const navigation = useNavigation()
  const isNavigating = navigation.state !== 'idle'
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isNavigating) {
      setVisible(false)
      return
    }
    const t = setTimeout(() => setVisible(true), 120)
    return () => clearTimeout(t)
  }, [isNavigating])

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative h-full w-full overflow-hidden bg-gold/15">
        <div
          className="absolute h-full rounded-full bg-gold"
          style={{ animation: 'nav-indeterminate 1.1s ease-in-out infinite' }}
        />
      </div>
    </div>
  )
}
