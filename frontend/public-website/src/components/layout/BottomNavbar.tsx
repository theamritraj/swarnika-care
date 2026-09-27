'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function BottomNavbar() {
  const router = useRouter();
  const pillRef = useRef<HTMLDivElement>(null);

  // Dynamic docking logic: Sticks right above the footer when scrolled to the bottom
  useEffect(() => {
    let rafId: number | null = null;

    const updatePillPosition = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const footer = document.getElementById('site-footer') || document.querySelector('footer');
        if (footer && pillRef.current) {
          const footerRect = footer.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // How many pixels of footer are visible in the viewport:
          const footerVisibleHeight = windowHeight - footerRect.top;
          const baseMargin = 20; // 20px gap above the footer or viewport bottom

          if (footerVisibleHeight > 0) {
            // Footer is visible in viewport -> dock right above the footer
            pillRef.current.style.bottom = `${footerVisibleHeight + baseMargin}px`;
          } else {
            // Footer is below viewport -> stay floating at standard bottom margin
            pillRef.current.style.bottom = `${baseMargin}px`;
          }
        }
        rafId = null;
      });
    };

    window.addEventListener('scroll', updatePillPosition, { passive: true });
    window.addEventListener('resize', updatePillPosition, { passive: true });
    
    // Initial check
    updatePillPosition();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', updatePillPosition);
      window.removeEventListener('resize', updatePillPosition);
    };
  }, []);

  const handlePregnancyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('calculator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#calculator');
    }
  };

  return (
    <>
      {/* ========================================================= */}
      {/* MOBILE ONLY (md:hidden): Apollo Cradle Fixed 4-Tab Teal Bar*/}
      {/* On Tablet & Desktop this is HIDDEN                        */}
      {/* ========================================================= */}
      <nav 
        id="bottom-action-navbar"
        aria-label="Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d829d] text-white shadow-[0_-3px_12px_rgba(0,0,0,0.22)] select-none font-sans border-t border-[#1398b7]"
      >
        <div className="w-full flex items-stretch h-[60px]">
          
          {/* 1. APPOINTMENT */}
          <Link 
            href="/book" 
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 border-r border-[#199bb9]/70 hover:bg-[#0b738c] active:bg-[#09667c] transition-colors group cursor-pointer"
          >
            <svg 
              className="w-[24px] h-[24px] fill-current text-white mb-0.5 group-hover:scale-105 transition-transform" 
              viewBox="0 0 24 24"
            >
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
            </svg>
            <span className="text-[12px] font-medium tracking-tight text-white leading-none">
              Appointment
            </span>
          </Link>

          {/* 2. CALL US */}
          <a 
            href="tel:18605001066" 
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 border-r border-[#199bb9]/70 hover:bg-[#0b738c] active:bg-[#09667c] transition-colors group cursor-pointer"
          >
            <svg 
              className="w-[24px] h-[24px] fill-current text-white mb-0.5 group-hover:scale-105 transition-transform" 
              viewBox="0 0 24 24"
            >
              <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25 1.12.37 2.32.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              <path d="M15.5 3a6.5 6.5 0 0 1 6.5 6.5h-1.8A4.7 4.7 0 0 0 15.5 4.8V3z" />
              <path d="M15.5 6.8a2.7 2.7 0 0 1 2.7 2.7h-1.6a1.1 1.1 0 0 0-1.1-1.1V6.8z" />
            </svg>
            <span className="text-[12px] font-medium tracking-tight text-white leading-none">
              Call Us
            </span>
          </a>

          {/* 3. WHATSAPP */}
          <a 
            href="https://wa.me/919934000000?text=Hi%20Swarnika%20Hospital,%20I%20would%20like%20to%20inquire%20about%20maternity%20and%20childcare%20services" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 border-r border-[#199bb9]/70 hover:bg-[#0b738c] active:bg-[#09667c] transition-colors group cursor-pointer"
          >
            <svg 
              className="w-[24px] h-[24px] fill-current text-white mb-0.5 group-hover:scale-105 transition-transform" 
              viewBox="0 0 24 24"
            >
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.49 0-2.94-.4-4.21-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.38c0-4.52 3.68-8.2 8.25-8.2 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.01 4.54-3.67 8.19-8.23 8.19zm4.51-6.15c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.06 0 1.21.88 2.39 1.01 2.56.12.17 1.74 2.66 4.22 3.73.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.1-.23-.16-.48-.28z"/>
            </svg>
            <span className="text-[12px] font-medium tracking-tight text-white leading-none">
              WhatsApp
            </span>
          </a>

          {/* 4. PREGNANCY */}
          <button 
            onClick={handlePregnancyClick} 
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 hover:bg-[#0b738c] active:bg-[#09667c] transition-colors group cursor-pointer"
          >
            <svg 
              className="w-[24px] h-[24px] text-white mb-0.5 group-hover:scale-105 transition-transform" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <rect x="3.5" y="2" width="17" height="20" rx="2.5" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="6.5" y="4.5" width="11" height="3" rx="0.5" fill="currentColor" />
              <circle cx="7.2" cy="11.2" r="1.1" fill="currentColor" />
              <circle cx="10.4" cy="11.2" r="1.1" fill="currentColor" />
              <circle cx="13.6" cy="11.2" r="1.1" fill="currentColor" />
              <circle cx="16.8" cy="11.2" r="1.1" fill="currentColor" />

              <circle cx="7.2" cy="14.7" r="1.1" fill="currentColor" />
              <circle cx="10.4" cy="14.7" r="1.1" fill="currentColor" />
              <circle cx="13.6" cy="14.7" r="1.1" fill="currentColor" />
              <circle cx="16.8" cy="14.7" r="1.1" fill="currentColor" />

              <circle cx="7.2" cy="18.2" r="1.1" fill="currentColor" />
              <circle cx="10.4" cy="18.2" r="1.1" fill="currentColor" />
              <circle cx="13.6" cy="18.2" r="1.1" fill="currentColor" />
              <circle cx="16.8" cy="18.2" r="1.1" fill="currentColor" />
            </svg>
            <span className="text-[12px] font-medium tracking-tight text-white leading-none">
              Pregnancy
            </span>
          </button>

        </div>
      </nav>

      {/* ========================================================================= */}
      {/* TABLET & DESKTOP (hidden md:flex): Floating Dual-Pill Bar                  */}
      {/* Matches Apollo Cradle iPad Pro & Desktop Screenshot:                       */}
      {/* Floats fixed during scroll, and docks right above footer when reached bottom */}
      {/* ========================================================================= */}
      <div 
        ref={pillRef}
        className="hidden md:flex fixed bottom-5 left-0 right-0 z-40 pointer-events-none justify-center px-4 font-sans antialiased will-change-[bottom]"
        style={{ bottom: '20px' }}
      >
        <div className="pointer-events-auto flex items-stretch w-full max-w-[430px] h-[52px] rounded-full shadow-[0_10px_28px_rgba(0,0,0,0.32)] overflow-hidden transition-all duration-200 hover:scale-[1.015] bg-[#622060] border border-[#7f277d]/40">
          
          {/* Left Half: Find a Doctor */}
          <Link 
            href="/doctors" 
            className="w-1/2 flex items-center justify-start pl-2 pr-3 bg-[#622060] hover:bg-[#722268] active:bg-[#581a56] transition-colors group cursor-pointer border-r border-white/20"
          >
            {/* White circle with stethoscope */}
            <div className="w-[38px] h-[38px] rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
              <svg 
                className="w-[22px] h-[22px] text-[#622060]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.1" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Earpieces */}
                <path d="M4.5 3v5a4 4 0 0 0 8 0V3" />
                <path d="M3.5 3h2" />
                <path d="M11.5 3h2" />
                {/* Tube down and bell */}
                <path d="M8.5 12v3a4 4 0 0 0 8 0v-2" />
                <circle cx="16.5" cy="11.5" r="2" fill="currentColor" />
              </svg>
            </div>

            <span className="flex-1 text-center font-medium text-white text-[14px] lg:text-[14.5px] tracking-tight whitespace-nowrap px-1">
              Find a Doctor
            </span>
          </Link>

          {/* Right Half: Book an Appointment */}
          <Link 
            href="/book" 
            className="w-1/2 flex items-center justify-end pl-3 pr-2 bg-[#622060] hover:bg-[#722268] active:bg-[#581a56] transition-colors group cursor-pointer"
          >
            <span className="flex-1 text-center font-medium text-white text-[14px] lg:text-[14.5px] tracking-tight whitespace-nowrap px-1">
              Book an Appointment
            </span>

            {/* White circle with calendar */}
            <div className="w-[38px] h-[38px] rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
              <svg 
                className="w-[20px] h-[20px] text-[#622060]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                {/* 3x2 calendar grid dots/squares */}
                <circle cx="8" cy="14" r="0.75" fill="currentColor" />
                <circle cx="12" cy="14" r="0.75" fill="currentColor" />
                <circle cx="16" cy="14" r="0.75" fill="currentColor" />
                <circle cx="8" cy="18" r="0.75" fill="currentColor" />
                <circle cx="12" cy="18" r="0.75" fill="currentColor" />
                <circle cx="16" cy="18" r="0.75" fill="currentColor" />
              </svg>
            </div>
          </Link>

        </div>
      </div>
    </>
  );
}
