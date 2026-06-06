import Image, { type StaticImageData } from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"

export interface Dish {
  id: string
  category: { lao: string; en: string }
  name: { lao: string; en: string }
  description: string
  price: number
  cardColor: string
  imageSrc?: string | StaticImageData
}

export function DishCard({ dish }: { dish: Dish }) {
  const initial = dish.name.lao.charAt(0)

  return (
    <div className="rounded-xl overflow-hidden shadow-md bg-white flex flex-col">

      {/* Image / placeholder */}
      <div className={`relative h-52 flex items-center justify-center ${dish.cardColor}`}>
        {dish.imageSrc ? (
          <Image src={dish.imageSrc} alt={dish.name.en} fill className="object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <span className="font-sans font-semibold text-white text-xl leading-none">
              {initial}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <p className="eyebrow mb-2">
          {dish.category.lao} · {dish.category.en}
        </p>
        <h3 className="font-sans font-bold text-green text-lg leading-snug mb-0.5">
          {dish.name.lao}
        </h3>
        <p className="font-sans text-brown-soft/65 text-sm italic mb-3">
          {dish.name.en}
        </p>
        <p className="font-sans text-brown/70 text-sm leading-[1.75] flex-1 mb-4">
          {dish.description}
        </p>
        <div className="font-sans font-semibold text-gold text-lg">
          {formatPrice(dish.price)}
        </div>
      </div>
    </div>

  )
}

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
