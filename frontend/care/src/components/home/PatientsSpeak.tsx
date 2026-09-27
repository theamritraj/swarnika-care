'use client';

import { Play } from 'lucide-react';
import Image from 'next/image';

const row1Cards = [
  <div key="r1-1" className="shrink-0 w-[280px] md:w-[320px] h-[280px] p-8 rounded-3xl bg-[#c6dee6] flex flex-col">
    <h3 className="text-xl font-bold text-[#1a3b42] mb-4">Anita</h3>
    <p className="text-[15px] text-[#1a3b42] leading-relaxed line-clamp-6">
      ...severe osteoarthritis in both knees, causing her immense difficulty in performing daily activities. A friend recommended Dr. Uttpal Kant, who had successfully treate...
    </p>
    <div className="mt-auto font-bold text-[#1a3b42] text-sm">Anita</div>
  </div>,
  <div key="r1-2" className="shrink-0 w-[280px] h-[280px] rounded-3xl relative overflow-hidden group cursor-pointer">
    <Image src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop" alt="Patient Video" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center pl-1 group-hover:scale-110 transition-transform">
      <Play className="w-5 h-5 text-orange-500" />
    </div>
  </div>,
  <div key="r1-3" className="shrink-0 w-[420px] md:w-[480px] h-[280px] p-8 rounded-3xl bg-[#c6dee6] flex flex-col">
    <h3 className="text-xl font-bold text-[#1a3b42] mb-4">Shachi</h3>
    <p className="text-[15px] text-[#1a3b42] leading-relaxed line-clamp-5 mb-4">
      Dear Dr. Vibha, I want to thank you for the exceptional care you provided during my lumpectomy. Your precise surgical skills and compassionate approach laid the foundation for my recovery an...
    </p>
    <div className="mt-auto font-bold text-[#1a3b42] text-sm">Shachi</div>
  </div>,
  <div key="r1-4" className="shrink-0 w-[280px] h-[280px] rounded-3xl relative overflow-hidden group cursor-pointer">
    <Image src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop" alt="Patient Video" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center pl-1 group-hover:scale-110 transition-transform">
      <Play className="w-5 h-5 text-orange-500" />
    </div>
  </div>
];

const row2Cards = [
  <div key="r2-1" className="shrink-0 w-[200px] md:w-[240px] h-[280px] rounded-3xl relative overflow-hidden group cursor-pointer">
    <Image src="https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?q=80&w=600&auto=format&fit=crop" alt="Patient Video" fill className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center pl-1 group-hover:scale-110 transition-transform">
      <Play className="w-5 h-5 text-orange-500" />
    </div>
  </div>,
  <div key="r2-2" className="shrink-0 w-[300px] md:w-[340px] h-[280px] rounded-3xl relative overflow-hidden group cursor-pointer">
    <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop" alt="Patient Video" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center pl-1 group-hover:scale-110 transition-transform">
      <Play className="w-5 h-5 text-orange-500" />
    </div>
  </div>,
  <div key="r2-3" className="shrink-0 w-[240px] md:w-[280px] h-[280px] rounded-3xl relative overflow-hidden group cursor-pointer">
    <Image src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=600&auto=format&fit=crop" alt="Patient Video" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center pl-1 group-hover:scale-110 transition-transform">
      <Play className="w-5 h-5 text-orange-500" />
    </div>
  </div>,
  <div key="r2-4" className="shrink-0 w-[380px] md:w-[440px] h-[280px] p-8 rounded-3xl bg-[#007b92] flex flex-col text-white">
    <p className="text-[16px] leading-relaxed line-clamp-6 mb-4 font-medium">
      Dr. Deepak is a lifesaver. My father was diagnosed with stage 4 lung cancer and given only six months. Thankfully, we found Dr. Deepak, and after Cyberknife treatment, my father's condition...
    </p>
    <div className="mt-auto font-bold text-[15px]">Niyati Shah</div>
  </div>
];

export function PatientsSpeak() {
  return (
    <section className="py-20 bg-[#f7f9fa] overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 12px)); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(calc(-50% - 12px)); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 45s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 45s linear infinite;
        }
        .animate-marquee:hover, .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
      `}} />
      
      {/* Heading Container */}
      <div className="max-w-[1400px] mx-auto px-6 mb-10">
        <h2 className="text-[32px] font-medium text-[#1a3b42]">
          Patients Speak
        </h2>
      </div>

      {/* Full-width Scrolling Rows */}
      <div className="w-full flex flex-col gap-6 overflow-hidden relative">
        
        {/* Row 1 (Auto-scroll right to left) */}
        <div className="flex flex-nowrap gap-6 w-max animate-marquee pl-6">
          <div className="flex flex-nowrap gap-6 w-max">
            {row1Cards}
          </div>
          <div className="flex flex-nowrap gap-6 w-max">
            {row1Cards}
          </div>
          <div className="flex flex-nowrap gap-6 w-max">
            {row1Cards}
          </div>
          <div className="flex flex-nowrap gap-6 w-max">
            {row1Cards}
          </div>
        </div>

        {/* Row 2 (Auto-scroll left to right) */}
        <div className="flex flex-nowrap gap-6 w-max animate-marquee-reverse pl-6">
          <div className="flex flex-nowrap gap-6 w-max">
            {row2Cards}
          </div>
          <div className="flex flex-nowrap gap-6 w-max">
            {row2Cards}
          </div>
          <div className="flex flex-nowrap gap-6 w-max">
            {row2Cards}
          </div>
          <div className="flex flex-nowrap gap-6 w-max">
            {row2Cards}
          </div>
        </div>

      </div>
    </section>
  );
}
