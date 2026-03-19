import type { ReactNode } from "react"

import { CartProvider } from "@/components/public/cart-provider"
import SiteFooter from "@/components/public/site-footer"
import SiteHeader from "@/components/public/site-header"

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      {children}
      <SiteFooter />
    </CartProvider>
  )
}
