import Link from "next/link"
import { Line, Gem } from "@/components/landing-page/commons"

const CONTACT_LINES = [
  "ບ້ານຈອມແກ້ວ ນະຄອນໄກສອນພົມວິຫານ",
  "ແຂວງສະຫວັນນະເຂດ ສ.ປ.ປ. ລາວ",
  "ຈັນ – ອາທິດ · 16:00 – 21:00 ໂມງ",
  "020-995-51122",
]

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative bg-green overflow-hidden">
      <div className="crosshatch-pattern-overlay" />

      <div className="relative z-10">

        {/* Main grid */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

            {/* Brand */}
            <div>
              <Link href="/" className="inline-block mb-4">
                <span className="font-heading text-[1.375rem] font-semibold text-white leading-none">
                  Ton
                </span>
                <span className="font-heading italic text-[1.375rem] font-semibold text-gold leading-none">
                  Nam
                </span>
              </Link>
              <p className="font-sans text-sm text-white/50 leading-[1.8] mb-4">
                ລົດຊາດດັ້ງເດີມຈາກວັດຖຸດິບທີ່ຄັດສັນ
                <br />
                ສົ່ງກົງຈາກຕົ້ນນ້ຳສູ່ໂຕ໊ະອາຫານຂອງທ່ານ
              </p>
              <em className="font-heading text-gold/80 text-sm italic">
                Pure origins, warm welcome
              </em>
            </div>

            <div></div>

            {/* Contact */}
            <div >
              <p className="font-sans text-[10px] font-semibold tracking-[0.28em] text-white/35 uppercase mb-5">
                ຕິດຕໍ່
              </p>
              <ul className="flex flex-col gap-3">
                {CONTACT_LINES.map((line, i) => (
                  <li
                    key={i}
                    className={`font-sans text-sm ${i < 2 ? "text-white/60" : "text-white/35"}`}
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Dashed divider */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Line />
            <Gem />
            <Line />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-center gap-2">
          <p className="font-sans text-[11px] text-white/50">
            © {year} ຕົ້ນນ້ຳ · TonNam Restaurant. ສະຫງວນລິຂະສິດ.
          </p>
        </div>
      </div>
    </footer>
  )
}
