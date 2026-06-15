import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  type Dish,
  DishCard,
  Line,
  Gem,
} from "@/components/landing-page/commons";
import { Reveal } from "@/components/ui/reveal";
import PadThaiWithRiverPrawns from "@/public/Pad-thai-with-river-prawns.jpg";
import TomYum from "@/public/tom-yum.jpg";
import FriedChickenWings from "@/public/fried-chicken-wings.jpg";

const FEATURED_DISHES: Dish[] = [
  {
    id: "pad-thai",
    category: { lao: "ເສັ້ນ", en: "NOODLES" },
    name: { lao: "ຜັດໄທກຸ້ງສົດ", en: "Pad Thai with River Prawns" },
    description: "ຜັດເສັ້ນ, ກຸ້ງສົດ, ໄຂ່ໄກ່, ຖົ່ວງອກ, ຕົ້ນໜອມ, ເສີບພ້ອມມະນາວ",
    price: 60000,
    cardColor: "bg-green",
    imageSrc: PadThaiWithRiverPrawns,
  },
  {
    id: "tom-yum",
    category: { lao: "ແກງ", en: "SOUP" },
    name: { lao: "ດຳຍຳກຸ້ງ", en: "Tom Yum Goong" },
    description:
      "ຕົ້ມຍຳນ້ຳຂົ້ນກຸ້ງສົດ, ຫົວສີໄຄ, ເຫັດຟາງ, ລົດຊາດເຂັ້ມຈາກສູດດັ້ງເດີມ",
    price: 100000,
    cardColor: "bg-terra",
    imageSrc: TomYum,
  },
  {
    id: "fried-chicken-wings",
    category: { lao: "ອາຫານຈານຫຼັກ", en: "MAIN" },
    name: { lao: "ປີກໄກ່ທອດ", en: "Fried Chicken Wings" },
    description: "ປີກໄກ່ທອດກອບ, ຫມັກຈາກສູດຂອງທາງຮ້ານ, ເສີບພ້ອມນ້ຳຈິ້ມຫວານ",
    price: 50000,
    cardColor: "bg-gold",
    imageSrc: FriedChickenWings,
  },
];

export default function FeaturedMenuSection() {
  return (
    <section id="menu-preview" className="bg-cream-dark py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <Reveal direction="up" duration={700}>
          <div className="flex flex-col items-center text-center mb-14">
            <p className="eyebrow mb-5 text-sm">ເມນູແນະນຳ · Signature Dishes</p>
            <h2 className="font-sans font-bold text-green text-[2rem] md:text-[2.625rem] leading-tight mb-5">
              ລົດຊາດທີ່ເຮົາພາກພູມໃຈ{" "}
              <em className="italic text-gold">ນຳສະເໜີ</em>
            </h2>
            <div className="flex items-center gap-4 w-full max-w-xs">
              <Line />
              <Gem />
              <Line />
            </div>
          </div>
        </Reveal>

        {/* Dish cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {FEATURED_DISHES.map((dish, i) => (
            <Reveal
              key={dish.id}
              direction="up-scale"
              delay={i * 130}
              duration={600}
            >
              <DishCard dish={dish} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
