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
  if (pathname.startsWith('/admin') || pathname.startsWith('/doctor') || pathname.startsWith('/staff')) return null;

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
            src="/logo.png" 
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
          <button className="flex items-center gap-3 text-card-foreground/80 hover:text-[#007b92] transition-colors cursor-pointer group">
            <HeadphonesIcon className="w-6 h-6 text-muted-foreground group-hover:text-[#007b92]" />
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-[14px] font-bold leading-tight">Support</span>
              <span className="text-[11px] text-muted-foreground font-medium leading-tight group-hover:text-[#007b92]">Need Help?</span>
            </div>
          </button>
          
          <div className="h-8 w-[1px] bg-accent/50"></div>

          <button className="flex items-center gap-1.5 text-card-foreground/80 hover:text-[#007b92] transition-colors cursor-pointer font-bold text-[14px]">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <span>EN</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground/70" />
          </button>
          
          <div className="h-8 w-[1px] bg-accent/50"></div>
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
