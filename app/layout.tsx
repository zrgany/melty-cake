import type { Metadata, Viewport } from "next";
import { El_Messiri, IBM_Plex_Sans_Arabic } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

const displayFont = El_Messiri({
  subsets: ["arabic"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Melty Cake | ميلتي كيك",
  description:
    "Melty Cake — كيك، حلويات، وأكواب سعادة، ومأكولات عراقية أصيلة. اطلب أونلاين وتوصلك لباب البيت.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#C77A2E",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
