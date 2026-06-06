import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Line, Gem } from "@/components/landing-page/commons"
import { Reveal } from "@/components/ui/reveal"

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative w-full h-screen bg-green flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="crosshatch-pattern-overlay" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-2xl">

        <Reveal direction="fade" delay={0} duration={600}>
          <p className="font-sans text-[11px] font-medium tracking-[0.22em] text-white/50 uppercase mb-7">
            ຕົ້ນນ້ຳ · Lao Heritage Dining
          </p>
        </Reveal>

        <Reveal direction="up" delay={200} duration={700}>
          <h1 className="font-sans font-bold text-white leading-[1.15] text-[2.6rem] md:text-[3.75rem] mb-0">
            ອາຫານລາວແທ້ /
            <br />
            <span className="font-heading">from the{" "}</span>
            <em className="font-heading text-gold">headwater</em>
          </h1>
        </Reveal>

        <Reveal direction="fade" delay={450} duration={500}>
          <div className="flex items-center gap-4 w-full max-w-[260px] my-8">
            <Line />
            <Gem />
            <Line />
          </div>
        </Reveal>

        <Reveal direction="up" delay={550} duration={600}>
          <p className="font-sans text-white/65 text-[0.9375rem] leading-[1.8] mb-10">
            ລົດຊາດດັ້ງເດີມຈາກວັດຖຸດິບທີ່ຄັດສັນ
            <br />
            ສົ່ງຈາກຕົ້ນນ້ຳສູ່ໂຕະອາຫານຂອງທ່ານ
          </p>
        </Reveal>

        <Reveal direction="up" delay={700} duration={600}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              className="h-12 px-8 rounded-lg bg-gold text-brown font-sans font-semibold text-[0.9375rem] border-0 hover:bg-gold-dark transition-colors duration-base"
            >
              <Link href="/menu">ເມນູແນະນຳ</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 px-8 rounded-lg border-white/35 text-white bg-transparent font-sans text-[0.9375rem] hover:bg-white/8 hover:text-white hover:border-white/35 transition-colors duration-base"
            >
              <Link href="/reservations">ຂໍ້ມູນຮ້ານ</Link>
            </Button>
          </div>
        </Reveal>

      </div>

      <Reveal
        direction="fade"
        delay={1000}
        duration={500}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-sans text-[12px] text-gold tracking-[0.28em] uppercase">
          ເລື່ອນລົງ
        </span>
        <ChevronDown className="size-5 text-gold animate-bounce" />
      </Reveal>
    </section>
  )
}
