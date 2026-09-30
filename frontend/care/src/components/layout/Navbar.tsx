'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeadphonesIcon, Globe, ChevronDown, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === '/login' || pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Guard AFTER all hooks — React Rules of Hooks requires hooks to always
  // be called in the same order; no early returns before hook calls.
  if (pathname.startsWith('/admin') || pathname.startsWith('/doctor') || pathname.startsWith('/staff') || pathname.startsWith('/patient')) return null;

  return (
    <header 
      className={`w-full fixed top-0 z-50 transition-all duration-300 bg-card ${
        isScrolled ? "shadow-md py-2" : "border-b border-border/50 py-4"
      }`}
    >
      <div className="max-w-[1400px] mx-auto flex justify-between items-center px-6">
        
        {/* Left Logo */}
        <Link href="/" className="flex items-center gap-4">
          <Image 
            src="https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712540/swarnikacare/website/logo.png" 
            alt="Swarnika Hospital" 
            width={180} 
            height={55} 
            className="object-contain" 
            priority 
          />
          <div className="h-10 w-[1px] bg-slate-300 hidden sm:block"></div>
          <div className="hidden sm:flex flex-col">
            <span className="text-[20px] font-bold text-[#007b92] leading-tight tracking-tight">
              Care Portal
            </span>
            <span className="text-[12px] font-medium text-muted-foreground leading-tight">
              For a Healthier Tomorrow
            </span>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-8">



          <ThemeToggle />

          {!isLoginPage && (
            <>
              <div className="h-8 w-[1px] bg-accent/50"></div>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-red-600 transition-colors text-sm font-bold cursor-pointer">
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
        
      </div>
    </header>
  );
}
