"use client"

import Link from "next/link"
import { Navbar, NavItems, NavItem, NavCta } from "@/components/common/navbar"

function TonNamLogo() {
  return (
    <Link href="/" className="flex flex-col gap-1 leading-none">
      <span className="font-heading italic text-[20px] md:text-2xl font-semibold text-gold leading-none">
        TonNam
      </span>
    </Link>
  )
}

const NAV_LINKS = [
  { href: "/menu", label: "ເມນູ" },
  { href: "/about", label: "ກ່ຽວກັບເຮົາ" },
  { href: "/contact", label: "ຕິດຕໍ່" },
]

export default function SiteNavbar() {
  return (
    <Navbar
      logo={<TonNamLogo />}
      behavior="fixed"
      mobileVariant="overlay"
      colorScheme="dark"
    >
      <NavItems align="end">
        {NAV_LINKS.map(({ href, label }) => (
          <NavItem key={href} href={href}>
            {label}
          </NavItem>
        ))}
        <NavCta href="/login">ເຂົ້າສູ່ລະບົບ</NavCta>
      </NavItems>
    </Navbar>
  )
}
