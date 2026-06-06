import Image from "next/image"
import { Reveal } from "@/components/ui/reveal"

interface AboutSectionProps {
  imageSrc?: string
  imageAlt?: string
}

const PARAGRAPHS = [
  {
    lao: "ຕົ້ນນ້ຳຕັ້ງຢູ່ເຖິງແນວຄິດວ່າ ອາຫານລາວທີ່ແທ້ຈິງເລີ່ມຕົ້ນຈາກວັດຖຸດິບ, ເຮົາຄັດເລືອກຜັກສົດ ແລະສະໝຸນໄພຈາກແຫລ່ງທີ່ເຮົາໄວ້ໃຈ",
    en: "TonNam is built on the belief that authentic Lao food begins at the source: the farms, and the growers we trust.",
  },
  {
    lao: "ສູດອາຫານຂອງເຮົາສືບທອດມາຫຼາຍຊົ່ວຄົນດ້ວຍຄວາມຮັກ ແຕ່ລະຈານຖືກປຸງດ້ວຍມືແລະໃຈ ເພື່ອໃຫ້ທ່ານໄດ້ລົດຊາດທີ່ແທ້ຈິງຂອງອາຫານລາວ",
    en: "Our recipes have been passed down with care through generations. Each dish is prepared by hand, so you taste Lao food as it was meant to be.",
  },
  {
    lao: "ເຮົາຕ້ອນຮັບທຸກທ່ານເປັນແຂກຂອງຄອບຄົວ ໃນບັນຍາກາດທີ່ອົບອຸ່ນແລະເປັນກັນເອງ",
    en: "We welcome every guest as family, in an atmosphere that is warm and genuine.",
  },
]

const TAGS = ["ວັດຖຸດິບສົດ", "ສູດດັ້ງເດີມ", "ຄອບຄົວ"]

export default function AboutSection({ imageSrc, imageAlt }: AboutSectionProps) {
  return (
    <section id="about" className="bg-cream py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

        {/* Left: Text content */}
        <Reveal direction="right" duration={700}>
        <div>
          <p className="eyebrow mb-5 text-sm">ກ່ຽວກັບເຮົາ · Our Story</p>

          <h2 className="font-sans font-bold text-green leading-[1.2] text-[2rem] md:text-[2.625rem] mb-4">
            ຕົ້ນນ້ຳ, ຈຸດເລີ່ມຕົ້ນ{" "}
            <em className="text-gold">ຂອງລົດຊາດ</em>
          </h2>

          <div className="w-12 h-0.5 bg-gold mb-8" />

          <div className="flex flex-col gap-7 mb-10">
            {PARAGRAPHS.map((p, i) => (
              <div key={i}>
                <p className="font-sans text-brown text-[0.9375rem] leading-[1.85]">
                  {p.lao}
                </p>
                <p className="font-sans text-brown text-sm leading-relaxed italic mt-1.5">
                  {p.en}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="font-sans text-sm text-green border border-green/25 bg-green/6 px-4 py-1.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        </Reveal>

        {/* Right: Card — image if provided, branded placeholder otherwise */}
        <Reveal direction="left" delay={200} duration={700}>
        <div className="relative  aspect-video lg:aspect-4/5 rounded-2xl overflow-hidden shadow-lg">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt ?? "About TonNam"}
              fill
              className="object-cover"
            />
          ) : (
            <BrandCard />
          )}
        </div>
        </Reveal>

      </div>
    </section>
  )
}

function BrandCard() {
  return (
    <div className="relative w-full h-full bg-green flex flex-col items-center justify-center">
      <div className="crosshatch-pattern-overlay" />
      <div className="relative z-10 flex flex-col items-center text-center px-10">

        {/* TN Monogram */}
        <div className="flex items-baseline mb-7">
          <span className="font-heading font-bold text-white leading-none text-[4rem] lg:text-[5.5rem] tracking-tight">
            T
          </span>
          <span className="font-heading font-bold text-gold leading-none text-[4rem] lg:text-[5.5rem] tracking-tight">
            N
          </span>
        </div>

        {/* Wordmark */}
        <p className="font-sans text-[10px] font-semibold tracking-[0.35em] text-white/55 uppercase mb-3">
          TONNAM
        </p>
        <div className="w-10 h-px bg-white/20 mb-3" />
        <p className="font-sans text-sm text-white/45 mb-6">ຕົ້ນນ້ຳ</p>

        <em className="font-heading text-gold/65 text-[0.9375rem] italic">
          Pure origins, warm welcome
        </em>

      </div>
    </div>
  )
}
