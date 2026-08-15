import type { Metadata } from "next";
import { Alfa_Slab_One, Special_Elite, Oswald } from "next/font/google";
import "./globals.css";

const alfaSlabOne = Alfa_Slab_One({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const specialElite = Special_Elite({
  variable: "--font-type",
  weight: "400",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bobdylanquiz.danielbrainich.com"),
  title: "Tangled Up In Who? — A Bob Dylan Quiz",
  description:
    "A Bob Dylan character-matching quiz. Drag each character to the song they belong in.",
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${alfaSlabOne.variable} ${specialElite.variable} ${oswald.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
