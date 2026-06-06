export function Line() {
  return (
    <div
      className="flex-1 h-px"
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, transparent 0px, transparent 4px, color-mix(in srgb, var(--color-gold) 35%, transparent) 4px, color-mix(in srgb, var(--color-gold) 35%, transparent) 8px)",
      }}
    />
  )
}

export function Gem() {
  return (
    <span className="text-gold opacity-60 text-lg leading-none shrink-0">✦</span>
  )
}
