"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin, Clock, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Reveal } from "@/components/ui/reveal"

const MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1753.3925670244014!2d104.74649566573785!3d16.56763890605049!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313dc601f3314091%3A0x620bf33304456a29!2z4Lqu4LuJ4Lqy4LqZIOC6leC6u-C7ieC6meC6meC7ieC6syjguKPguYnguLLguJnguJXguYnguJnguJnguYnguLMp!5e0!3m2!1sth!2sla!4v1780723816672!5m2!1sth!2sla"

const INFO_ITEMS = [
  {
    icon: MapPin,
    label: "ທີ່ຢູ່",
    lines: ["ບ້ານຈອມແກ້ວ ນະຄອນໄກສອນພົມວິຫານ", "ແຂວງສະຫວັນນະເຂດ ສ.ປ.ປ. ລາວ"],
  },
  {
    icon: Clock,
    label: "ເວລາທຳການ",
    lines: ["ຈັນ – ອາທິດ · 16:00 – 21:00 ໂມງ", "ເປີດຮ້ານທຸກມື້"],
  },
  {
    icon: Phone,
    label: "ຕິດຕໍ່",
    lines: ["020-995-51122", "ສາມາດໂທຈອງໂຕະລ່ວງໜ້າໄດ້"],
  },
]

export default function ContactSection() {
  return (
    <section id="contact" className="bg-cream py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

        {/* Left: Info */}
        <Reveal direction="right" duration={700}>
          <div>
            <p className="eyebrow mb-5 text-sm">ມາຫາເຮົາ · Visit Us</p>

            <h2 className="font-sans font-bold text-green leading-[1.2] text-[2rem] md:text-[2.625rem] mb-4">
              ຍິນດີຕ້ອນຮັບ{" "}
              <em className="italic text-gold">ທຸກທ່ານ</em>
            </h2>

            <div className="w-12 h-0.5 bg-gold mb-8" />

            <div className="flex flex-col gap-3 mb-8">
              {INFO_ITEMS.map((item, i) => (
                <Reveal key={item.label} direction="up" delay={i * 120} duration={500}>
                  <InfoCard {...item} />
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Right: Map */}
        <Reveal direction="left" delay={200} duration={700}>
          <div className="relative h-[420px] lg:h-[500px] rounded-2xl overflow-hidden shadow-md">
            <MapEmbed />
          </div>
        </Reveal>

      </div>
    </section>
  )
}

function InfoCard({
  icon: Icon,
  label,
  lines,
}: {
  icon: typeof MapPin
  label: string
  lines: string[]
}) {
  return (
    <div className="flex items-start gap-4 bg-cream-dark/60 rounded-xl px-5 py-4">
      <div className="shrink-0 w-9 h-9 rounded-full bg-success/10 flex items-center justify-center mt-0.5">
        <Icon className="size-4 text-success" strokeWidth={1.75} />
      </div>
      <div>
        <p className="eyebrow mb-1">{label}</p>
        {lines.map((line, i) => (
          <p key={i} className={cn("font-sans text-[0.9375rem] leading-[1.7]",
            i === 0 ? "text-brown font-medium" : "text-brown-soft/70 text-sm"
          )}>
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

function MapEmbed() {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading")

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === "loading") setStatus("error")
    }, 8000)
    return () => clearTimeout(timer)
  }, [status])

  return (
    <>
      {status !== "loaded" && <MapFallback loading={status === "loading"} />}
      <iframe
        src={MAP_SRC}
        className={cn(
          "absolute inset-0 w-full h-full transition-opacity duration-500",
          status === "loaded" ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setStatus("loaded")}
      />
    </>
  )
}

function MapFallback({ loading }: { loading: boolean }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-cream-dark"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 23px, color-mix(in srgb, var(--color-brown) 6%, transparent) 24px)",
      }}
    >
      {/* Bullseye icon */}
      <div className={cn(
        "w-14 h-14 rounded-full border-2 border-green flex items-center justify-center mb-4",
        loading && "animate-pulse",
      )}>
        <div className="w-5 h-5 rounded-full border-2 border-green flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-green" />
        </div>
      </div>

      <p className="font-sans font-bold text-green text-base mb-1">ຕົ້ນນ້ຳ</p>
      <p className="font-sans text-sm text-brown-soft/65 text-center leading-[1.7]">
        ບ້ານຈອມແກ້ວ ນະຄອນໄກສອນພົມວິຫານ
        <br />
        ແຂວງສະຫວັນນະເຂດ
      </p>
    </div>
  )
}
