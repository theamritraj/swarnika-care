'use client';

import Link from "next/link";


import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin') || pathname.startsWith('/doctor') || pathname.startsWith('/staff') || pathname.startsWith('/patient')) return null;

  return (
    <footer className="bg-background border-t border-border mt-auto flex flex-col">
      {/* Bottom Legal */}
      <div className="w-full bg-background py-6">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-[13px] font-medium">
            © {new Date().getFullYear()} Swarnika Hospitals. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-muted-foreground hover:text-[#007b92] text-[13px] font-medium transition-colors">Privacy Policy</Link>
            <span className="text-border">|</span>
            <Link href="#" className="text-muted-foreground hover:text-[#007b92] text-[13px] font-medium transition-colors">Terms of Service</Link>
            <span className="text-border">|</span>
            <Link href="#" className="text-muted-foreground hover:text-[#007b92] text-[13px] font-medium transition-colors">Help & Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
