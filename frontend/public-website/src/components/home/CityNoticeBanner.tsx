'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { MapPin, X } from 'lucide-react';

export function CityNoticeBanner() {
  const searchParams = useSearchParams();
  const unavailableCity = searchParams.get('unavailableCity');
  const [dismissed, setDismissed] = useState(false);

  if (!unavailableCity || dismissed) return null;

  const cityName = unavailableCity.charAt(0).toUpperCase() + unavailableCity.slice(1);

  return (
    <div className="w-full bg-[#fff4e6] border-b border-[#ffe2bf] text-[#8c4800] px-4 py-3 flex items-center justify-between animate-in slide-in-from-top duration-200 z-40 font-sans">
      <div className="container mx-auto max-w-7xl flex items-center gap-3 text-[13.5px]">
        <div className="w-7 h-7 rounded-full bg-[#ffd8a8] flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 text-[#d9480f]" />
        </div>
        <div className="flex-1">
          <span className="font-bold">Swarnika Hospitals & Clinics</span> are <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded text-[12px] border border-amber-300">Coming Soon</span> to{' '}
          <span className="font-bold text-[#d9480f]">{cityName}</span>! We are currently open &amp; operating exclusively at our primary super-speciality centre in{' '}
          <span className="font-bold text-[#622060]">Sasaram, Rohtas, Bihar</span>.
        </div>
        <button 
          onClick={() => setDismissed(true)} 
          className="p-1 hover:bg-[#ffd8a8] rounded-full transition cursor-pointer text-[#8c4800]"
          aria-label="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
