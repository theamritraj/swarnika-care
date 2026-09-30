import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BottomNavbar } from "@/components/layout/BottomNavbar";
import { PregnancyCalculatorSideTab } from "@/components/common/PregnancyCalculatorSideTab";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Swarnika Hospital",
    default: "Swarnika Hospital - Bridging Gaps, Building Healthier Bharat",
  },
  description: "Swarnika Hospital provides world-class medical services, top-tier doctors, and emergency care in Sasaram, Rohtas. Book your appointment online today.",
  keywords: ["Hospital in Sasaram", "Best Doctors in Rohtas", "Swarnika Care", "Medical Services", "Emergency Hospital", "Orthopaedics Sasaram"],
  icons: {
    icon: "https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712540/swarnikacare/website/logo.png",
    apple: "https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712540/swarnikacare/website/logo.png",
  },
  openGraph: {
    title: "Swarnika Hospital - Quality Healthcare in Sasaram",
    description: "Providing world-class medical services and experienced doctors in Sasaram, Rohtas.",
    siteName: "Swarnika Hospital",
    images: [
      {
        url: "https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712540/swarnikacare/website/logo.png",
        width: 800,
        height: 600,
        alt: "Swarnika Hospital Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-50 flex flex-col`}>
        <Providers>
          
          <Navbar />

          <main className="flex-1 flex flex-col w-full pb-[64px]">{children}</main>
          <Footer />
          <PregnancyCalculatorSideTab />
          <BottomNavbar />
        </Providers>
      </body>
    </html>
  );
}
