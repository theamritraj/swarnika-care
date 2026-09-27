'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [
  {
    id: 'book',
    text: 'Book Appointment',
    bgColor: 'bg-[#fff4d2]',
    icon: '👨‍⚕️' 
  },
  {
    id: 'hospital',
    text: 'Our Specialities',
    bgColor: 'bg-[#dce9fd]',
    icon: '🏥'
  },
  {
    id: 'health_check',
    text: 'Book Health Check',
    bgColor: 'bg-[#e6f8f1]',
    icon: '🛡️'
  },
  {
    id: 'expert',
    text: 'Get Expert Opinion',
    bgColor: 'bg-[#d9f2f6]',
    icon: '🩺'
  }
];

export function FloatingSideNav() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate if the user is near the bottom (in the footer area)
      const isNearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 700;

      // Show when scrolled down past ~80vh (almost past hero) AND not near bottom
      if (window.scrollY > window.innerHeight * 0.8 && !isNearBottom) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={`fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-10 pointer-events-none'
      }`}
    >
      
      {navItems.map((item) => (
        <div 
          key={item.id}
          className={`group flex items-center h-14 rounded-full cursor-pointer overflow-hidden transition-all duration-300 ease-out w-14 hover:w-56 ${item.bgColor} shadow-sm border border-white/50`}
        >
          <div className="w-14 h-14 shrink-0 flex items-center justify-center text-2xl bg-white/40 rounded-full">
            {item.icon}
          </div>
          <span className="whitespace-nowrap font-bold text-[#1a3b42] text-[14px] px-3">
            {item.text}
          </span>
          <div className="ml-auto mr-3 w-8 h-8 shrink-0 rounded-full bg-[#007b92] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity delay-100">
            &rarr;
          </div>
        </div>
      ))}

      {/* Special Search Button */}
      <div className="group flex items-center h-14 rounded-full cursor-pointer overflow-hidden transition-all duration-300 ease-out w-14 hover:w-40 bg-[#d9f2f6] shadow-sm border border-white/50">
        <div className="w-14 h-14 shrink-0 flex items-center justify-center bg-orange-500 rounded-full text-white">
          <Search className="w-5 h-5" />
        </div>
        <span className="whitespace-nowrap font-bold text-[#1a3b42] text-[14px] px-3">
          Search
        </span>
        <div className="ml-auto mr-3 w-8 h-8 shrink-0 rounded-full bg-[#007b92] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity delay-100">
          &rarr;
        </div>
      </div>

    </div>
  );
}
