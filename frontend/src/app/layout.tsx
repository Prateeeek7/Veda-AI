import type { Metadata } from "next";
import { Cinzel, Outfit, Yatra_One } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({ 
  subsets: ["latin"], 
  variable: "--font-cinzel",
  display: "swap",
});

const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-outfit",
  display: "swap",
});

const yatra = Yatra_One({ 
  subsets: ["devanagari", "latin"], 
  weight: "400", 
  variable: "--font-yatra",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GeetaAI - Cosmic Guidance",
  description: "Divine zero-hallucination Bhagavad Gita AI Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${outfit.variable} ${yatra.variable}`}>
      <body suppressHydrationWarning className={`antialiased font-outfit min-h-screen text-foreground relative selection:bg-gold/30 selection:text-white`}>
        <div className="cosmic-bg" />
        <main className="relative z-0 min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
